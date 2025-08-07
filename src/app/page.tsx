import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { HomeAddToCartButton } from "@/components/cart/home-add-to-cart-button";

// Cache por 1 hora (3600 segundos)
export const revalidate = 3600;

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
    <main className="min-h-screen bg-white">
      {/* Hero Section with fashion imagery */}
      <section className="relative h-screen bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-4xl">
              <h1 className="text-5xl md:text-7xl font-light text-black mb-6 tracking-wider">
                COLEÇÃO EXCLUSIVA
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 font-light">
                Elegância e sofisticação para a mulher moderna
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/produtos" className="bg-black text-white px-12 py-4 text-sm uppercase tracking-widest hover:bg-gray-800 transition-all duration-300 font-medium">
                  DESCOBRIR COLEÇÃO
                </Link>
                <Link href="/produtos" className="border border-black text-black px-12 py-4 text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300 font-medium">
                  VER PRODUTOS
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-black mb-4 tracking-wider">
              NOSSAS CATEGORIAS
            </h2>
            <div className="w-24 h-px bg-accent mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.length > 0 ? (
              categories.map((category) => (
                <Link key={category.id} href={`/category/${category.slug}`} className="group cursor-pointer">
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
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-black mb-4 tracking-wider">
              PRODUTOS EM DESTAQUE
            </h2>
            <div className="w-24 h-px bg-accent mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <div key={product.id} className="bg-white border border-gray-200 group hover:shadow-lg transition-all duration-300">
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
                  <div className="p-4">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="text-base font-medium text-gray-900 mb-2 hover:text-black transition-colors cursor-pointer h-12 overflow-hidden">
                        {product.name}
                      </h3>
                    </Link>
                    {product.category && (
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                        {product.category.name}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-medium text-black">€{product.price.toFixed(2)}</span>
                      {product.oldPrice && product.oldPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">€{product.oldPrice.toFixed(2)}</span>
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
                </div>
              ))
            ) : (
              // Fallback products if no featured products exist
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="group cursor-pointer">
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
                </div>
              ))
            )}
          </div>

          {/* Ver Todos os Produtos Button */}
          <div className="text-center mt-12">
            <Link
              href="/produtos"
              className="inline-block bg-black text-white px-12 py-4 text-sm uppercase tracking-widest hover:bg-gray-800 transition-all duration-300 font-medium"
            >
              VER TODOS OS PRODUTOS
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
