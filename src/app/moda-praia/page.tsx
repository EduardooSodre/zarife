import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

export default async function ModaPraiaPage() {
  // Get products from beach/swimwear categories
  const beachCategories = await prisma.category.findMany({
    where: {
      OR: [
        { name: { contains: "Biquíni", mode: "insensitive" } },
        { name: { contains: "Bikini", mode: "insensitive" } },
        { name: { contains: "Maiô", mode: "insensitive" } },
        { name: { contains: "Saída", mode: "insensitive" } },
        { name: { contains: "Praia", mode: "insensitive" } },
        { name: { contains: "Canga", mode: "insensitive" } },
        { name: { contains: "Sunga", mode: "insensitive" } },
      ]
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

  const allProducts = beachCategories.flatMap(cat => cat.products);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Moda Praia</h1>
          <p className="text-gray-600">
            {allProducts.length} produto{allProducts.length !== 1 ? 's' : ''} encontrado{allProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Subcategories */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Categorias</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/moda-praia/biquini" className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Biquíni
            </Link>
            <Link href="/moda-praia/maio" className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Maiô
            </Link>
            <Link href="/moda-praia/saidas-de-praia" className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Saídas de Praia
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        {allProducts.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-medium text-gray-900 mb-2">
              Nenhum produto encontrado
            </h2>
            <p className="text-gray-600 mb-4">
              Esta categoria ainda não possui produtos cadastrados.
            </p>
            <p className="text-sm text-gray-500">
              Para adicionar produtos, acesse o painel administrativo e crie categorias como &quot;Biquíni&quot;, &quot;Maiô&quot;, &quot;Saídas de Praia&quot;, etc.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
                <CardContent className="p-0">
                  <Link href={`/product/${product.id}`}>
                    <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-sm">Sem imagem</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {product.category.name}
                        </Badge>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-sm">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            R$ {Number(product.price).toFixed(2)}
                          </span>
                          {product.oldPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              R$ {Number(product.oldPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        {product.oldPrice && (
                          <Badge variant="destructive" className="text-xs">
                            -{Math.round(((Number(product.oldPrice) - Number(product.price)) / Number(product.oldPrice)) * 100)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                  
                  <div className="px-4 pb-4">
                    <AddToCartButton 
                      product={{
                        id: product.id,
                        name: product.name,
                        price: Number(product.price),
                        image: product.images?.[0]?.url || ''
                      }}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
