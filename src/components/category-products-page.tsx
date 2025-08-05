import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

interface CategoryProductsPageProps {
  title: string;
  categoryPatterns: string[];
  description?: string;
  breadcrumb?: string;
}

export default async function CategoryProductsPage({
  title,
  categoryPatterns,
  description,
  breadcrumb = title,
}: CategoryProductsPageProps) {
  // Get products from specified category patterns
  const categories = await prisma.category.findMany({
    where: {
      OR: categoryPatterns.map(pattern => ({
        name: { contains: pattern, mode: "insensitive" as const }
      }))
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

  // Flatten products from all categories
  const products = categories.flatMap(category => category.products);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-black transition-colors">
            Início
          </Link>
          <span>/</span>
          <span className="text-black">{breadcrumb}</span>
        </nav>

        {/* Back Button */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4 tracking-wide">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {description}
            </p>
          )}
          <div className="w-24 h-0.5 bg-black mx-auto mt-6"></div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden bg-gray-50">
                    <Link href={`/product/${product.id}`}>
                      {product.images[0] ? (
                        <div className="relative">
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            width={400}
                            height={500}
                            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {product.oldPrice && (
                            <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                              SALE
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-80 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">Sem imagem</span>
                        </div>
                      )}
                    </Link>
                  </div>
                  
                  <div className="p-6">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-medium text-gray-900 mb-2 group-hover:text-black transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-gray-500 mb-3">{product.category.name}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-gray-900">
                          €{Number(product.price).toFixed(2)}
                        </span>
                        {product.oldPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            €{Number(product.oldPrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <AddToCartButton 
                      product={{
                        id: product.id,
                        name: product.name,
                        price: Number(product.price),
                        image: product.images[0]?.url || '/placeholder.jpg'
                      }}
                      className="w-full bg-black text-white hover:bg-gray-800 transition-colors"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-600 mb-8">
              Não temos produtos nesta categoria no momento.
            </p>
            <Link href="/produtos">
              <button className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors">
                Ver Todos os Produtos
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
