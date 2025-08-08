import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { HomeAddToCartButton } from "@/components/cart/home-add-to-cart-button";
import { MotionWrapper, MotionContainer, MotionCard, MotionText } from "@/components/animations/motion-wrapper";
import { AnimatedText, AnimatedLetters } from "@/components/animations/animated-text";

// Cache por 1 hora (3600 segundos)
export const revalidate = 3600;

// Componente para efeito parallax
function ParallaxBanner() {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: 'translate3d(0, calc(var(--scroll) * 0.5), 0)',
        }}
      >
        <Image
          src="/banner.jpg"
          alt="Zarife Fashion Banner"
          fill
          className="object-cover object-center scale-110"
          priority
          quality={100}
          sizes="100vw"
        />
      </div>
    </div>
  );
}

export default async function Home() {
  // Fetch featured products with optimized query
  const featuredProducts = await prisma.product.findMany({
    where: {
      isFeatured: true,
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
    take: 8,
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Fetch categories for the category grid - apenas ativas e por ordem
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    take: 4,
    orderBy: [
      { order: 'asc' },
      { name: 'asc' }
    ],
  });
  return (
    <>
      {/* Script para efeito parallax */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              function updateParallax() {
                const scrolled = window.pageYOffset;
                const parallax = document.querySelector('.parallax-container');
                if (parallax) {
                  parallax.style.setProperty('--scroll', scrolled + 'px');
                }
              }
              
              window.addEventListener('scroll', updateParallax);
              updateParallax();
            });
          `,
        }}
      />

      <main className="min-h-screen bg-white">
        {/* Hero Section with fashion imagery */}
        <section className="relative h-[calc(100vh-1rem)] overflow-hidden parallax-container">
          {/* Background Image with Parallax */}
          <ParallaxBanner />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20 z-10"></div>

          {/* Content */}
          <div className="relative z-20 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-4xl">
                <AnimatedLetters 
                  text="COLEÇÃO EXCLUSIVA"
                  className="text-5xl md:text-7xl font-light text-white mb-6 tracking-wider drop-shadow-lg"
                  delay={0.3}
                />
                <MotionText delay={1.2} className="text-xl md:text-2xl text-white mb-8 font-light drop-shadow-md">
                  <p>Elegância e sofisticação para a mulher moderna</p>
                </MotionText>
                <MotionWrapper delay={1.8} direction="up" className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link href="/produtos" className="bg-white text-black px-12 py-4 text-sm uppercase tracking-widest hover:bg-gray-100 transition-all duration-300 font-medium">
                    DESCOBRIR COLEÇÃO
                  </Link>
                  <Link href="/produtos" className="border border-white text-white px-12 py-4 text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 font-medium">
                    VER PRODUTOS
                  </Link>
                </MotionWrapper>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-24 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MotionWrapper direction="up" className="text-center mb-16">
              <AnimatedText 
                text="NOSSAS CATEGORIAS"
                className="text-4xl font-light text-black mb-4 tracking-wider"
                variant="slide"
              />
              <MotionWrapper delay={0.3} direction="scale">
                <div className="w-24 h-px bg-accent mx-auto"></div>
              </MotionWrapper>
            </MotionWrapper>

            <MotionContainer className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8" staggerChildren={0.15}>
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <MotionCard key={category.id} delay={index * 0.1}>
                    <Link href={`/category/${category.slug}`} className="group cursor-pointer">
                      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                        {category.image ? (
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">Sem imagem</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h3 className="text-xl font-medium">{category.name.toUpperCase()}</h3>
                        <p className="text-sm">Veja nossa coleção</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-black mb-2 tracking-wide">{category.name.toUpperCase()}</h3>
                      <p className="text-gray-600 text-sm">Produtos selecionados para você</p>
                    </div>
                  </Link>
                  </MotionCard>
                ))
              ) : (
                // Categorias padrão caso não haja categorias no banco
                <>
                  <Link href="/produtos" className="group cursor-pointer">
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h3 className="text-xl font-medium">PRODUTOS</h3>
                        <p className="text-sm">TODA A COLEÇÃO</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-black mb-2 tracking-wide">PRODUTOS</h3>
                      <p className="text-gray-600 text-sm">Toda nossa coleção disponível</p>
                    </div>
                  </Link>
                </>
              )}
            </MotionContainer>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-24 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MotionWrapper direction="up" className="text-center mb-16">
              <AnimatedText 
                text="PRODUTOS EM DESTAQUE"
                className="text-4xl font-light text-black mb-4 tracking-wider"
                variant="slide"
              />
              <MotionWrapper delay={0.3} direction="scale">
                <div className="w-24 h-px bg-accent mx-auto"></div>
              </MotionWrapper>
            </MotionWrapper>

            <MotionContainer className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8" staggerChildren={0.1}>
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product, index) => (
                  <MotionCard key={product.id} delay={index * 0.1} className="bg-white border border-gray-200 group hover:shadow-lg transition-all duration-300">
                    <Link href={`/product/${product.id}`}>
                      <div className="aspect-square bg-gray-200 overflow-hidden cursor-pointer">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            width={300}
                            height={300}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                            <span className="text-sm text-center px-2">{product.name}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-2 md:p-4">
                      <Link href={`/product/${product.id}`}>
                        <h3 className="text-sm md:text-base font-medium text-gray-900 mb-2 hover:text-black transition-colors cursor-pointer h-10 md:h-12 overflow-hidden">
                          {product.name}
                        </h3>
                      </Link>
                      {product.category && (
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                          {product.category.name}
                        </p>
                      )}
                      <div className="flex items-center justify-between mb-2 md:mb-3">
                        <span className="text-sm md:text-lg font-medium text-black">€{product.price.toFixed(2)}</span>
                        {product.oldPrice && product.oldPrice > product.price && (
                          <span className="text-xs md:text-sm text-gray-500 line-through">€{product.oldPrice.toFixed(2)}</span>
                        )}
                      </div>
                      <HomeAddToCartButton
                        product={{
                          id: product.id,
                          name: product.name,
                          price: Number(product.price),
                          image: product.images?.[0]?.url || '/placeholder-product.jpg',
                        }}
                      />
                    </div>
                  </MotionCard>
                ))
              ) : (
                // Fallback products if no featured products exist
                Array.from({ length: 4 }).map((_, index) => (
                  <MotionCard key={index} delay={index * 0.1} className="group cursor-pointer">
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Produto em Breve</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-sm font-medium text-black mb-2 uppercase tracking-wide">
                        Produto em Destaque {index + 1}
                      </h3>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-lg font-light text-black">€0.00</span>
                      </div>
                      <button
                        disabled
                        className="w-full bg-transparent border border-gray-300 text-gray-400 cursor-not-allowed uppercase tracking-widest text-xs py-3 font-medium"
                      >
                        Em Breve
                      </button>
                    </div>
                  </MotionCard>
                ))
              )}
            </MotionContainer>

            {/* Ver Todos os Produtos Button */}
            <MotionWrapper delay={0.8} direction="up" className="text-center mt-12">
              <Link
                href="/produtos"
                className="inline-block bg-black text-white px-12 py-4 text-sm uppercase tracking-widest hover:bg-gray-800 transition-all duration-300 font-medium"
              >
                VER TODOS OS PRODUTOS
              </Link>
            </MotionWrapper>
          </div>
        </section>
      </main>
    </>
  )
}
