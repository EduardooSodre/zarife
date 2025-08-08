import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { MotionWrapper, MotionContainer, MotionCard } from "@/components/animations/motion-wrapper";
import { AnimatedText } from "@/components/animations/animated-text";
import { HoverCard, FloatingButton, RevealOnScroll } from "@/components/animations/hover-effects";
import { PageTransition } from "@/components/animations/page-effects";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;

  // Get category
  const category = await prisma.category.findUnique({
    where: { 
      slug: resolvedParams.slug,
    },
    include: {
      products: {
        where: {
          isActive: true,
        },
        include: {
          images: {
            orderBy: { order: "asc" },
            take: 1,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <RevealOnScroll direction="left" delay={0.2}>
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link href="/" className="hover:text-black transition-colors">
              Início
            </Link>
            <span>/</span>
            <span className="text-black">{category.name}</span>
          </nav>
        </RevealOnScroll>

        {/* Back Button */}
        <MotionWrapper direction="right" delay={0.4} className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-black transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Voltar
          </Link>
        </MotionWrapper>

        {/* Category Header */}
        <div className="text-center mb-16">
          <AnimatedText
            text={category.name.toUpperCase()}
            className="text-4xl lg:text-5xl font-light text-black mb-4 tracking-wider"
            variant="wave"
            delay={0.6}
          />
          <MotionWrapper delay={1.2} direction="scale">
            <div className="w-24 h-px bg-black mx-auto mb-6"></div>
          </MotionWrapper>
          <RevealOnScroll direction="up" delay={1.5}>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Descubra nossa seleção cuidadosa de produtos em {category.name.toLowerCase()}
            </p>
          </RevealOnScroll>
        </div>

        {/* Products Grid */}
        {category.products.length === 0 ? (
          <MotionWrapper direction="up" className="text-center py-16">
            <MotionWrapper direction="scale" delay={0.3}>
              <div className="text-6xl mb-4">🛍️</div>
            </MotionWrapper>
            <AnimatedText
              text="Nenhum produto encontrado"
              className="text-2xl font-light text-gray-900 mb-4"
              variant="slide"
              delay={0.6}
            />
            <RevealOnScroll direction="up" delay={0.9}>
              <p className="text-gray-600 mb-8">
                Esta categoria ainda não possui produtos disponíveis.
              </p>
            </RevealOnScroll>
            <FloatingButton delay={1.2}>
              <Link href="/" className="inline-block bg-black text-white px-8 py-3 uppercase tracking-widest hover:bg-gray-800 transition-colors">
                Ver Todas as Categorias
              </Link>
            </FloatingButton>
          </MotionWrapper>
        ) : (
          <>
            {/* Products Count */}
            <RevealOnScroll direction="left" delay={0.3} className="mb-8">
              <p className="text-gray-600">
                {category.products.length} {category.products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </p>
            </RevealOnScroll>

            {/* Products Grid */}
            <MotionContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16" staggerChildren={0.1}>
              {category.products.map((product, index) => (
                <MotionCard key={product.id} delay={index * 0.05}>
                  <HoverCard hoverScale={1.03} hoverY={-8}>
                    <Card className="border-0 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden">
                      <CardContent className="p-0">
                        {/* Product Image */}
                        <Link href={`/product/${product.id}`}>
                          <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden relative">
                            {product.images && product.images.length > 0 ? (
                              <Image
                                src={product.images[0].url}
                                alt={product.name}
                                width={300}
                                height={300}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span className="text-sm">Sem imagem</span>
                              </div>
                            )}
                            {/* Overlay com gradiente */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          </div>
                        </Link>

                        {/* Product Details */}
                        <div className="p-4 space-y-3">
                          {/* Product Name */}
                          <Link href={`/product/${product.id}`}>
                            <h3 className="font-medium text-gray-900 hover:text-black transition-colors cursor-pointer line-clamp-2 group-hover:text-black">
                              {product.name}
                            </h3>
                          </Link>

                          {/* Brand */}
                          {product.brand && (
                            <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                              {product.brand}
                            </p>
                          )}

                          {/* Price */}
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-medium text-black group-hover:text-accent transition-colors">
                              €{Number(product.price).toFixed(2)}
                            </span>
                            {product.oldPrice && Number(product.oldPrice) > Number(product.price) && (
                              <span className="text-sm text-gray-500 line-through">
                                €{Number(product.oldPrice).toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Stock Status */}
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${product.stock > 0 ? 'bg-green-500 group-hover:bg-green-400' : 'bg-red-500 group-hover:bg-red-400'}`}></div>
                            <span className={`text-xs transition-colors ${product.stock > 0 ? 'text-green-700 group-hover:text-green-600' : 'text-red-700 group-hover:text-red-600'}`}>
                              {product.stock > 0 ? 'Em stock' : 'Esgotado'}
                            </span>
                          </div>

                          {/* Add to Cart */}
                          <div className="transform group-hover:scale-105 transition-transform duration-300">
                            <AddToCartButton
                              product={{
                                id: product.id,
                                name: product.name,
                                price: Number(product.price),
                                image: product.images?.[0]?.url || '/placeholder-product.jpg',
                                size: "Único",
                                color: "Padrão"
                              }}
                              className="w-full bg-black text-white py-2 text-sm uppercase tracking-wider hover:bg-gray-800 transition-all duration-300 hover:shadow-lg"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </HoverCard>
                </MotionCard>
              ))}
            </MotionContainer>
          </>
        )}
      </div>
      </div>
    </PageTransition>
  );
}
