"use client"

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Mock search results - replace with actual search functionality
const mockProducts = [
  {
    id: "1",
    name: "Vestido Elegante Preto",
    price: 89.99,
    originalPrice: 119.99,
    image: "/placeholder-product.jpg",
    category: "Vestidos"
  },
  {
    id: "2",
    name: "Blusa Sofisticada Branca",
    price: 59.99,
    image: "/placeholder-product.jpg", 
    category: "Blusas"
  },
  {
    id: "3",
    name: "Conjunto Executivo",
    price: 149.99,
    image: "/placeholder-product.jpg",
    category: "Conjuntos"
  }
]

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  // Filter products based on search query
  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.category.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm uppercase tracking-widest">Voltar</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light text-primary mb-4 tracking-wider uppercase">
                Resultados da Busca
              </h1>
              {query && (
                <p className="text-gray-600 text-lg">
                  Resultados para: <span className="font-medium">&ldquo;{query}&rdquo;</span>
                </p>
              )}
              <p className="text-gray-500 mt-2">
                {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </Button>
          </div>
        </div>

        {/* Search Results */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-light text-gray-900 mb-4">
              Nenhum produto encontrado
            </h2>
            <p className="text-gray-600 mb-8">
              Tente buscar com palavras-chave diferentes ou navegue pelas nossas categorias
            </p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-white uppercase tracking-widest">
                Ver Todos os Produtos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white border border-gray-200 group hover:shadow-lg transition-all duration-300">
                {/* Product Image */}
                <div className="aspect-square bg-gray-200 overflow-hidden">
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                    {/* Placeholder for product image */}
                    <span className="text-sm">Imagem do Produto</span>
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-6">
                  <div className="mb-3">
                    <span className="text-xs text-gray-500 uppercase tracking-widest">
                      {product.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-3 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-medium text-primary">
                      €{product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        €{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <Button className="w-full mt-4 bg-transparent border border-primary text-primary hover:bg-primary hover:text-white transition-all uppercase tracking-widest text-sm">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Suggested Categories */}
        {filteredProducts.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-16">
            <h2 className="text-2xl font-light text-primary mb-8 tracking-wider uppercase text-center">
              Explore Outras Categorias
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { name: "Roupas", href: "/roupas" },
                { name: "Looks Completos", href: "/looks-completos" },
                { name: "Conjuntos", href: "/conjuntos" },
                { name: "Vestidos", href: "/vestidos" },
                { name: "Moda Praia", href: "/moda-praia" },
              ].map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="text-center p-6 border border-gray-200 hover:border-primary hover:bg-gray-50 transition-all group"
                >
                  <span className="text-sm font-medium text-gray-900 group-hover:text-primary uppercase tracking-wide">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando resultados...</p>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  )
}
