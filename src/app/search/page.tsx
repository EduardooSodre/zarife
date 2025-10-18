import { Suspense } from 'react'
import { prisma } from "@/lib/db";
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { calculateProductStock } from "@/lib/products";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

async function SearchResults({ query }: { query: string }) {
  // Search products by name, description, brand, or category
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          brand: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          category: {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
      ],
    },
    include: {
      category: true,
      images: {
        orderBy: { order: "asc" },
        take: 1,
      },
  variants: { select: { size: true, color: true, stock: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const productsWithStock = products.map(product => ({
    ...product,
    totalStock: calculateProductStock(product)
  }));

  return (
    <div className="space-y-6">
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {products.length} {products.length === 1 ? 'resultado encontrado' : 'resultados encontrados'} para &ldquo;{query}&rdquo;
        </p>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-light text-gray-900 mb-4">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-600 mb-8">
            Tente pesquisar com outras palavras-chave ou visite a nossa coleção completa.
          </p>
          <Link href="/produtos" className="inline-block bg-black text-white px-8 py-3 uppercase tracking-widest hover:bg-gray-800 transition-colors">
            Ver Todos os Produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsWithStock.map((product) => (
            <Card key={product.id} className="border-0 shadow-sm hover:shadow-lg transition-shadow group">
              <CardContent className="p-0">
                {/* Product Image */}
                <Link href={`/product/${product.id}`}>
                  <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-sm">Sem imagem</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Details */}
                <div className="p-4 space-y-3">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between">
                    <Link href={`/category/${product.category.slug}`}>
                      <Badge variant="outline" className="text-xs cursor-pointer hover:bg-gray-50">
                        {product.category.name}
                      </Badge>
                    </Link>
                  </div>

                  {/* Product Name */}
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-medium text-gray-900 hover:text-black transition-colors cursor-pointer line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Brand */}
                  {product.brand && (
                    <p className="text-sm text-gray-600">
                      {product.brand}
                    </p>
                  )}

                  {/* Price */}
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-medium text-black">
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
                    <div className={`w-2 h-2 rounded-full ${product.totalStock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-xs ${product.totalStock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {product.totalStock > 0 ? 'Em stock' : 'Esgotado'}
                    </span>
                  </div>

                  {/* Add to Cart */}
                  <AddToCartButton
                    product={{
                      id: product.id,
                      name: product.name,
                      price: Number(product.price),
                      image: product.images?.[0]?.url || '/placeholder-product.jpg',
                      size: "nico",
                      color: "Padro",
                      maxStock: product.totalStock,
                      variants: product.variants || [],
                    }}
                    className="w-full bg-black text-white py-2 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-black transition-colors">
            Início
          </Link>
          <span>/</span>
          <span className="text-black">Busca</span>
        </nav>

        {/* Back Button */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-light text-black mb-4 tracking-wider uppercase">
            Resultados da Busca
          </h1>
          <div className="w-24 h-px bg-black mx-auto mb-6"></div>
          {query && (
            <p className="text-gray-600 text-lg text-center">
              Mostrando resultados para: <span className="font-medium text-black">&ldquo;{query}&rdquo;</span>
            </p>
          )}
        </div>

        {/* Search Results */}
        {query ? (
          <Suspense fallback={
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p>Buscando produtos...</p>
            </div>
          }>
            <SearchResults query={query} />
          </Suspense>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-light text-gray-900 mb-4">
              Digite algo para buscar
            </h3>
            <p className="text-gray-600 mb-8">
              Use a barra de pesquisa acima para encontrar produtos.
            </p>
            <Link href="/produtos" className="inline-block bg-black text-white px-8 py-3 uppercase tracking-widest hover:bg-gray-800 transition-colors">
              Ver Todos os Produtos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
