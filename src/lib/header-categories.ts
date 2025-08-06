import { prisma } from '@/lib/db';

export async function getHeaderCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        parent: null, // Apenas categorias principais
      },
      include: {
        children: {
          where: {
            isActive: true,
          },
          include: {
            children: {
              where: {
                isActive: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories;
  } catch (error) {
    console.error('Erro ao buscar categorias para header:', error);
    return [];
  }
}
