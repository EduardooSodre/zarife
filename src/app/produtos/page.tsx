import Link from "next/link";
import Image from "next/image";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { prisma } from "@/lib/db";

export default async function ProdutosPage() {
  // Fetch all active products
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    include: {
      images: {
        orderBy: {
          order: 'asc',
        },
      },
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <main className="min-h-screen bg-white">
      {/* Page Header */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-light text-black mb-4 tracking-wider">
              TODOS OS PRODUTOS
            </h1>
            <div className="w-24 h-px bg-accent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">
              Descubra nossa coleção completa de produtos exclusivos
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {products.length > 0 ? (
            <>
              <div className="mb-8">
                <p className="text-gray-600">
                  Mostrando {products.length} produto{products.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
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
                      <p className="text-gray-600 text-sm mb-3 h-10 overflow-hidden">
                        {product.description || 'Produto de qualidade premium'}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-medium text-primary">€{product.price.toFixed(2)}</span>
                        {product.oldPrice && product.oldPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">€{product.oldPrice.toFixed(2)}</span>
                        )}
                      </div>
                      <AddToCartButton
                        product={{
                          id: product.id,
                          name: product.name,
                          price: Number(product.price),
                          image: product.images?.[0]?.url || '/placeholder-product.jpg',
                          size: "Único",
                          color: "Padrão"
                        }}
                        className="w-full uppercase tracking-widest text-xs py-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-400 text-2xl">📦</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Nenhum produto encontrado
                </h3>
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
    </main>
  );
}
