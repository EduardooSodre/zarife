import Link from "next/link";
import { prisma } from "@/lib/db";
import { FloatingButton } from "@/components/animations/hover-effects";
import { PageTransition } from "@/components/animations/page-effects";
import { FastProductCard } from "@/components/product/fast-product-card";

// Cache por 30 minutos
export const revalidate = 1800;

interface ProdutosPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ProdutosPage({ searchParams }: ProdutosPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');
  const limit = 16; // Produtos por página
  const skip = (page - 1) * limit;

  // Fetch products with pagination and optimized queries
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        images: {
          take: 1, // Apenas a primeira imagem
          orderBy: {
            order: 'asc',
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: skip,
    }),
    prisma.product.count({
      where: {
        isActive: true,
      },
    }),
  ]);

  // Converter Decimal para number para evitar erro de serialização
  const serializedProducts = products.map(product => ({
    ...product,
    price: Number(product.price),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
  }));

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <PageTransition>
      <div className="min-h-screen bg-white" style={{ paddingTop: '100px' }}>
      {/* Page Header */}
      <section className="py-4 bg-white border-b border-gray-100">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-light text-black mb-3 tracking-wider">
              TODOS OS PRODUTOS
            </h1>
            <div className="w-24 h-px bg-black mx-auto mb-3"></div>
            <p className="text-gray-600">
              Descubra nossa coleção completa de produtos exclusivos
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {serializedProducts.length > 0 ? (
            <>
              <div className="mb-8">
                <p className="text-gray-600">
                  Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, totalCount)} de {totalCount} produto{totalCount !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {serializedProducts.map((product) => (
                  <FastProductCard 
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-12">
                  {page > 1 && (
                    <FloatingButton>
                      <Link
                        href={`/produtos?page=${page - 1}`}
                        className="px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-300 rounded-none hover:border-black hover:text-black"
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
                          href={`/produtos?page=${pageNum}`}
                          className={`px-4 py-2 border transition-all duration-300 rounded-none ${
                            pageNum === page
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
                        href={`/produtos?page=${page + 1}`}
                        className="px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-300 rounded-none hover:border-black hover:text-black"
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
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-400 text-2xl">📦</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-600 mb-8">
                  Em breve teremos produtos incríveis disponíveis.
                </p>
                <Link 
                  href="/" 
                  className="inline-block bg-black text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-gray-800 transition-all duration-300"
                >
                  Voltar ao Início
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