
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { FloatingButton } from "@/components/animations/hover-effects";
import { PageTransition } from "@/components/animations/page-effects";
import { FastProductCard, ProductFilters, ProductListCard } from "@/components/product";
import { SortSelect } from "@/components/product/sort-select";

// Cache por 60 segundos para atualizar stock mais frequentemente
export const revalidate = 60;

interface ProdutosPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    brand?: string;
    material?: string;
    season?: string;
    gender?: string;
    inStock?: string;
    onSale?: string;
    sortBy?: string;
    viewMode?: string;
  }>;
}

export default async function ProdutosPage({ searchParams }: ProdutosPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');
  const limit = 16;
  const skip = (page - 1) * limit;

  // Construir filtros
  const search = resolvedSearchParams.search || '';
  const category = resolvedSearchParams.category || '';
  const minPrice = resolvedSearchParams.minPrice ? parseFloat(resolvedSearchParams.minPrice) : undefined;
  const maxPrice = resolvedSearchParams.maxPrice ? parseFloat(resolvedSearchParams.maxPrice) : undefined;
  const brand = resolvedSearchParams.brand || '';
  const material = resolvedSearchParams.material || '';
  const season = resolvedSearchParams.season || '';
  const gender = resolvedSearchParams.gender || '';
  const inStock = resolvedSearchParams.inStock === 'true';
  const onSale = resolvedSearchParams.onSale === 'true';
  const sortBy = resolvedSearchParams.sortBy || 'newest';
  const viewMode = resolvedSearchParams.viewMode || 'grid';

  // Construir where clause
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  // Filtro por busca de texto
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { material: { contains: search, mode: 'insensitive' } },
      { category: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  // Filtro por categoria
  if (category) {
    where.category = { slug: category };
  }

  // Filtro por preço
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = minPrice;
    if (maxPrice) where.price.lte = maxPrice;
  }

  // Filtros por campos específicos
  if (brand) where.brand = { contains: brand, mode: 'insensitive' };
  if (material) where.material = { contains: material, mode: 'insensitive' };
  if (season) where.season = season;

  // Filtro por saldo
  if (onSale) {
    where.oldPrice = { not: null };
  }

  // Configurar ordenação
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  switch (sortBy) {
    case 'price-asc':
      orderBy = { price: 'asc' };
      break;
    case 'price-desc':
      orderBy = { price: 'desc' };
      break;
    case 'name':
      orderBy = { name: 'asc' };
      break;
    case 'popular':
      orderBy = { isFeatured: 'desc' };
      break;
    default:
      orderBy = { createdAt: 'desc' };
  }

  // Fetch products with pagination and filters
  const [rawProducts, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: {
          take: 1,
          orderBy: { order: 'asc' },
        },
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy,
      take: limit,
      skip,
    }),
    prisma.product.count({ where }),
  ]);

  // Convert Decimal to number for client components
  const products = rawProducts.map(product => ({
    ...product,
    price: Number(product.price),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
  }));

  const totalPages = Math.ceil(totalCount / limit);

  // Helper function to build pagination URLs
  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams();

    // Add current search params except page
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (minPrice) params.set('minPrice', minPrice.toString());
    if (maxPrice) params.set('maxPrice', maxPrice.toString());
    if (brand) params.set('brand', brand);
    if (material) params.set('material', material);
    if (season) params.set('season', season);
    if (gender) params.set('gender', gender);
    if (inStock) params.set('inStock', 'true');
    if (onSale) params.set('onSale', 'true');
    if (sortBy !== 'newest') params.set('sortBy', sortBy);
    if (viewMode !== 'grid') params.set('viewMode', viewMode);

    // Add page number
    params.set('page', pageNum.toString());

    const queryString = params.toString();
    return `/produtos${queryString ? `?${queryString}` : ''}`;
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="pt-22 bg-white border-b border-gray-100">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-light text-black mb-4 tracking-wider">
                PRODUTOS
              </h1>
              <div className="w-24 h-px bg-black mx-auto mb-4"></div>
              <p className="text-gray-600">
                Descubra a nossa coleção completa com filtros avançados
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            {/* Filtros e Controles */}
            <ProductFilters />

            {/* Results Info e Sort */}
            <div className=" mb-6 p-4 bg-white border border-gray-200 shadow-sm rounded-sm">
              <div className="flex justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {totalCount} {totalCount === 1 ? 'produto encontrado' : 'produtos encontrados'}
                  </span>
                </div>
                <SortSelect currentSortBy={sortBy} />
              </div>
            </div>

            {products.length > 0 ? (
              <>
                {/* Products Display - Grid or List */}
                {viewMode === 'list' ? (
                  <div className="space-y-4 mb-12">
                    {products.map((product) => (
                      <ProductListCard
                        key={product.id}
                        product={product}
                        className="transform transition-all duration-300 hover:shadow-lg"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                    {products.map((product) => (
                      <FastProductCard
                        key={product.id}
                        product={product}
                        className="transform transition-all duration-300 hover:scale-105"
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    {page > 1 && (
                      <FloatingButton>
                        <Link
                          href={buildPageUrl(page - 1)}
                          className="px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-300 hover:border-black hover:text-black"
                        >
                          Anterior
                        </Link>
                      </FloatingButton>
                    )}

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(page - 2 + i, totalPages - 4)) + i;
                      if (pageNum > totalPages) return null;

                      return (
                        <FloatingButton key={pageNum} delay={i * 0.1}>
                          <Link
                            href={buildPageUrl(pageNum)}
                            className={`px-4 py-2 border transition-all duration-300 ${pageNum === page
                              ? 'bg-black text-white border-black shadow-lg'
                              : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-black hover:text-black'
                              }`}
                          >
                            {pageNum}
                          </Link>
                        </FloatingButton>
                      );
                    })}

                    {page < totalPages && (
                      <FloatingButton delay={0.3}>
                        <Link
                          href={buildPageUrl(page + 1)}
                          className="px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-300 hover:border-black hover:text-black"
                        >
                          Próxima
                        </Link>
                      </FloatingButton>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="mb-8">
                  <div className="w-24 h-24 bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">📦</span>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Nenhum produto encontrado
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Tente ajustar os filtros ou fazer uma nova busca
                  </p>
                  <Link
                    href="/produtos"
                    className="inline-block bg-black text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-gray-800 transition-all duration-300"
                  >
                    Limpar Filtros
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </PageTransition>
  );
}