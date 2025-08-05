import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-black transition-colors">
            Início
          </Link>
          <span>/</span>
          <span className="text-black">{category.name}</span>
        </nav>

        {/* Back Button */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </div>

        {/* Category Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-light text-black mb-4 tracking-wider uppercase">
            {category.name}
          </h1>
          <div className="w-24 h-px bg-black mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Descubra nossa seleção cuidadosa de produtos em {category.name.toLowerCase()}
          </p>
        </div>

        {/* Products Grid */}
        {category.products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-2xl font-light text-gray-900 mb-4">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-600 mb-8">
              Esta categoria ainda não possui produtos disponíveis.
            </p>
            <Link href="/" className="inline-block bg-black text-white px-8 py-3 uppercase tracking-widest hover:bg-gray-800 transition-colors">
              Ver Todas as Categorias
            </Link>
          </div>
        ) : (
          <>
            {/* Products Count */}
            <div className="mb-8">
              <p className="text-gray-600">
                {category.products.length} {category.products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
              {category.products.map((product) => (
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
                      {/* Featured Badge */}
                      {product.isFeatured && (
                        <Badge className="bg-black text-white">
                          Em Destaque
                        </Badge>
                      )}

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
                        <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-xs ${product.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {product.stock > 0 ? 'Em stock' : 'Esgotado'}
                        </span>
                      </div>

                      {/* Add to Cart */}
                      <AddToCartButton
                        product={{
                          id: product.id,
                          name: product.name,
                          price: Number(product.price),
                          image: product.images?.[0]?.url || '/placeholder-product.jpg',
                          size: "Único",
                          color: "Padrão"
                        }}
                        className="w-full bg-black text-white py-2 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
