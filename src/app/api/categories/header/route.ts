import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Buscar categorias principais (nível 1)
    const mainCategories = await prisma.category.findMany({
      where: {
        parentId: null,
      },
      orderBy: { name: 'asc' },
    });

    // Para cada categoria principal, buscar suas subcategorias
    const categoriesWithChildren = await Promise.all(
      mainCategories.map(async (category) => {
        const subcategories = await prisma.category.findMany({
          where: {
            parentId: category.id,
          },
          orderBy: { name: 'asc' },
        });

        // Para cada subcategoria, buscar suas sub-subcategorias
        const subcategoriesWithChildren = await Promise.all(
          subcategories.map(async (subcategory) => {
            const subSubcategories = await prisma.category.findMany({
              where: {
                parentId: subcategory.id,
              },
              orderBy: { name: 'asc' },
            });

            return {
              id: subcategory.id,
              name: subcategory.name,
              slug: subcategory.slug,
              href: `/category/${subcategory.slug}`,
              children: subSubcategories.map(subSub => ({
                id: subSub.id,
                name: subSub.name,
                slug: subSub.slug,
                href: `/category/${subSub.slug}`,
              })),
            };
          })
        );

        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          href: `/category/${category.slug}`,
          children: subcategoriesWithChildren,
        };
      })
    );

    return NextResponse.json(categoriesWithChildren);
  } catch (error) {
    console.error('Erro ao buscar categorias para header:', error);
    return NextResponse.json([]);
  }
}
