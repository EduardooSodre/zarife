import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [categories, brands, materials, seasons, colors, priceRange] =
      await Promise.all([
        // Categorias
        prisma.category.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: {
                products: {
                  where: { isActive: true },
                },
              },
            },
          },
          orderBy: { name: "asc" },
        }),

        // Marcas únicas
        prisma.product.findMany({
          where: {
            isActive: true,
            brand: { not: null },
          },
          select: { brand: true },
          distinct: ["brand"],
          orderBy: { brand: "asc" },
        }),

        // Materiais únicos
        prisma.product.findMany({
          where: {
            isActive: true,
            material: { not: null },
          },
          select: { material: true },
          distinct: ["material"],
          orderBy: { material: "asc" },
        }),

        // Estações únicas
        prisma.product.findMany({
          where: {
            isActive: true,
            season: { not: null },
          },
          select: { season: true },
          distinct: ["season"],
          orderBy: { season: "asc" },
        }),

        // Cores únicas das variantes
        prisma.productVariant.findMany({
          where: {
            color: { not: null },
            product: { isActive: true },
          },
          select: { color: true },
          distinct: ["color"],
          orderBy: { color: "asc" },
        }),

        // Faixa de preços
        prisma.product.aggregate({
          where: { isActive: true },
          _min: { price: true },
          _max: { price: true },
        }),
      ]);

    return NextResponse.json({
      categories: categories.map((cat) => ({
        ...cat,
        count: cat._count.products,
      })),
      brands: brands.map((b) => b.brand).filter(Boolean),
      materials: materials.map((m) => m.material).filter(Boolean),
      seasons: seasons.map((s) => s.season).filter(Boolean),
      colors: colors.map((c) => c.color).filter(Boolean),
      priceRange: {
        min: Number(priceRange._min.price) || 0,
        max: Number(priceRange._max.price) || 1000,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar filtros:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
