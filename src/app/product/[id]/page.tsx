import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import ProductImageGallery from "./product-image-gallery";
import ProductClientWrapper from "./product-client-wrapper";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;

  // Get product
  const product = await prisma.product.findUnique({
    where: {
      id: resolvedParams.id,
      isActive: true
    },
    include: {
      category: true,
      images: {
        orderBy: { order: "asc" },
      },
      variants: {
        orderBy: [
          { size: "asc" },
          { color: "asc" }
        ]
      }
    },
  });

  if (!product) {
    notFound();
  }

  // Get related products from the same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      isActive: true,
      id: {
        not: product.id,
      },
    },
    include: {
      images: {
        orderBy: { order: "asc" },
        take: 1,
      },
    },
    take: 4,
  });

  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: '100px' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link href="/" className="hover:text-black transition-colors">
            Início
          </Link>
          <span>/</span>
          <Link href={`/category/${product.category.slug}`} className="hover:text-black transition-colors">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </nav>

        {/* Back Button */}
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <ProductImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Category Badge */}
            <div>
              <Link href={`/category/${product.category.slug}`}>
                <Badge variant="outline" className="mb-4 cursor-pointer hover:bg-gray-50">
                  {product.category.name}
                </Badge>
              </Link>
            </div>

            {/* Product Name */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-light text-black mb-2 tracking-wide">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-gray-600">por {product.brand}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-medium text-black">
                €{Number(product.price).toFixed(2)}
              </span>
              {product.oldPrice && Number(product.oldPrice) > Number(product.price) && (
                <span className="text-xl text-gray-500 line-through">
                  €{Number(product.oldPrice).toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Product Details */}
            <div className="space-y-4">
              {product.material && (
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 w-24">Material:</span>
                  <span className="text-gray-700">{product.material}</span>
                </div>
              )}
              {product.season && (
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 w-24">Temporada:</span>
                  <span className="text-gray-700">{product.season}</span>
                </div>
              )}
              {product.gender && (
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 w-24">Público:</span>
                  <span className="text-gray-700">{product.gender}</span>
                </div>
              )}
            </div>

            {/* Stock Status - apenas se não há variações */}
            {(!product.variants || product.variants.length === 0) && (
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`font-medium ${product.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {product.stock > 0 ? `${product.stock} em stock` : 'Esgotado'}
                </span>
              </div>
            )}

            {/* Product Variants and Actions */}
            <ProductClientWrapper
              product={{
                id: product.id,
                name: product.name,
                price: Number(product.price),
                oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
                images: product.images || [],
                stock: product.stock,
                category: product.category
              }}
              variants={
                (product.variants || []).map(v => ({
                  ...v,
                  size: v.size === null ? undefined : v.size,
                  color: v.color === null ? undefined : v.color,
                }))
              }
            />
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-16 border-t border-gray-200">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light text-black mb-4 tracking-wider">
                PRODUTOS RELACIONADOS
              </h2>
              <div className="w-24 h-px bg-black mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/product/${relatedProduct.id}`} className="group">
                  <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                        {relatedProduct.images && relatedProduct.images.length > 0 ? (
                          <Image
                            src={relatedProduct.images[0].url}
                            alt={relatedProduct.name}
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
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-lg font-medium text-black">
                          €{Number(relatedProduct.price).toFixed(2)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
