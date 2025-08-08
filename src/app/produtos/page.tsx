import Link from "next/link";
import Image from "next/image";
import { HomeAddToCartButton } from '@/components/cart/home-add-to-cart-button';
import { prisma } from "@/lib/db";
import { MotionWrapper, MotionContainer, MotionCard } from "@/components/animations/motion-wrapper";
import { AnimatedText } from "@/components/animations/animated-text";
import { HoverCard, FloatingButton, RevealOnScroll } from "@/components/animations/hover-effects";
import { PageTransition } from "@/components/animations/page-effects";

// Cache por 30 minutos
export const revalidate = 1800;

interface ProdutosPageProps {
  searchParams: { page?: string };
}

export default async function ProdutosPage({ searchParams }: ProdutosPageProps) {
  const page = parseInt(searchParams.page || '1');
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

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <PageTransition>
      <main className="min-h-screen bg-white">
      {/* Page Header */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AnimatedText 
              text="TODOS OS PRODUTOS"
              className="text-4xl font-light text-black mb-4 tracking-wider"
              variant="wave"
              delay={0.2}
            />
            <MotionWrapper delay={0.8} direction="scale">
              <div className="w-24 h-px bg-accent mx-auto mb-4"></div>
            </MotionWrapper>
            <RevealOnScroll 
              direction="up" 
              delay={1.0}
              className="text-gray-600 text-lg"
            >
              <p>Descubra nossa coleção completa de produtos exclusivos</p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {products.length > 0 ? (
            <>
              <RevealOnScroll direction="left" delay={0.3} className="mb-8">
                <p className="text-gray-600">
                  Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, totalCount)} de {totalCount} produto{totalCount !== 1 ? 's' : ''}
                </p>
              </RevealOnScroll>
              
              <MotionContainer className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" staggerChildren={0.08}>
                {products.map((product, index) => (
                  <MotionCard key={product.id} delay={index * 0.05}>
                    <HoverCard 
                      className="bg-white border border-gray-200 group hover:shadow-xl transition-all duration-500"
                      hoverScale={1.03}
                      hoverY={-12}
                    >
                      <Link href={`/product/${product.id}`}>
                        <div className="aspect-square bg-gray-200 overflow-hidden cursor-pointer relative">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              width={300}
                              height={300}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                              <span className="text-sm text-center px-2">{product.name}</span>
                            </div>
                          )}
                          {/* Overlay com gradient animado */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                      </Link>
                      <div className="p-2 md:p-4">
                        <Link href={`/product/${product.id}`}>
                          <h3 className="text-sm md:text-base font-medium text-gray-900 mb-2 hover:text-black transition-colors cursor-pointer h-10 md:h-12 overflow-hidden group-hover:text-black">
                            {product.name}
                          </h3>
                        </Link>
                        {product.category && (
                          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide group-hover:text-gray-700 transition-colors">
                            {product.category.name}
                          </p>
                        )}
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                          <span className="text-sm md:text-lg font-medium text-black group-hover:text-accent transition-colors">€{product.price.toFixed(2)}</span>
                          {product.oldPrice && product.oldPrice > product.price && (
                            <span className="text-xs md:text-sm text-gray-500 line-through">€{product.oldPrice.toFixed(2)}</span>
                          )}
                        </div>
                        <div className="transform group-hover:scale-105 transition-transform duration-300">
                          <HomeAddToCartButton
                            product={{
                              id: product.id,
                              name: product.name,
                              price: Number(product.price),
                              image: product.images?.[0]?.url || '/placeholder-product.jpg',
                            }}
                          />
                        </div>
                      </div>
                    </HoverCard>
                  </MotionCard>
                ))}
              </MotionContainer>

              {/* Paginação */}
              {totalPages > 1 && (
                <RevealOnScroll direction="up" delay={0.5} className="flex justify-center items-center space-x-2 mt-12">
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
                </RevealOnScroll>
              )}
            </>
          ) : (
            <MotionWrapper direction="up" className="text-center py-16">
              <div className="mb-8">
                <MotionWrapper direction="scale" delay={0.3}>
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">📦</span>
                  </div>
                </MotionWrapper>
                <AnimatedText
                  text="Nenhum produto encontrado"
                  className="text-xl font-medium text-gray-900 mb-2"
                  variant="slide"
                  delay={0.6}
                />
                <RevealOnScroll direction="up" delay={0.9}>
                  <p className="text-gray-600 mb-8">
                    Em breve teremos produtos incríveis disponíveis.
                  </p>
                </RevealOnScroll>
                <FloatingButton delay={1.2}>
                  <Link 
                    href="/" 
                    className="inline-block bg-black text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-gray-800 transition-all duration-300"
                  >
                    Voltar ao Início
                  </Link>
                </FloatingButton>
              </div>
            </MotionWrapper>
          )}
        </div>
      </section>
      </main>
    </PageTransition>
  );
}