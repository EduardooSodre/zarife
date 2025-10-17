import { prisma } from "@/lib/db";

/**
 * Helper function to get products with pagination and filters
 */
export async function getProductsWithPagination({
  page = 1,
  limit = 12,
  category,
  search,
  minPrice,
  maxPrice,
  isFeatured,
  isActive = true,
  includeInactive = false,
}: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  includeInactive?: boolean;
}) {
  const skip = (page - 1) * limit;

  const where = {
    ...(includeInactive ? {} : { isActive }),
    ...(category && { category: { slug: category } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
    ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
    ...(isFeatured !== undefined && { isFeatured }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: {
          orderBy: { order: "asc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Helper function to get products by category name patterns
 */
export async function getProductsByCategory(categoryPatterns: string[]) {
  const categories = await prisma.category.findMany({
    where: {
      OR: categoryPatterns.map((pattern) => ({
        name: { contains: pattern, mode: "insensitive" as const },
      })),
    },
    include: {
      products: {
        where: { isActive: true },
        include: {
          images: {
            orderBy: { order: "asc" },
            take: 1,
          },
          category: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return categories.flatMap((category) => category.products);
}

/**
 * Calcula o estoque total de um produto baseado em suas variantes
 */
export function calculateProductStock(product: {
  variants?: { stock: number }[];
}): number {
  if (!product.variants || product.variants.length === 0) {
    return 0;
  }
  return product.variants.reduce((total, variant) => total + variant.stock, 0);
}

/**
 * Verifica se um produto tem estoque disponível
 */
export function hasStock(product: { variants?: { stock: number }[] }): boolean {
  return calculateProductStock(product) > 0;
}
