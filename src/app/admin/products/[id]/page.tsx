import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Star, Calendar, Tag, Palette, Ruler } from "lucide-react";
import { calculateProductStock } from "@/lib/products";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}


export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
      variants: true,
    },
  });
  if (!product) notFound();

  const totalStock = calculateProductStock(product);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar handled by layout */}
      <div className="flex-1 flex flex-col">
        {/* Header handled by layout */}
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-6 px-2 sm:px-6 lg:px-0">
          {/* Top actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <Link href="/admin/products" className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 px-3">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar aos Produtos
                </Button>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate max-w-xs sm:max-w-md" title={product.name}>{product.name}</h1>
            </div>
            <div className="flex gap-2">
              {/* Dialog de edição removido pois dependia de arquivo deletado */}
              <DeleteProductButton productId={product.id} productName={product.name} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Images */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Package className="w-5 h-5" /> Imagens do Produto
                </CardTitle>
              </CardHeader>
              <CardContent>
                {product.images.length > 0 ? (
                  <div className="space-y-4">
                    <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 400px"
                        priority
                      />
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> Capa
                      </div>
                    </div>
                    {product.images.length > 1 && (
                      <div className="grid grid-cols-3 gap-2">
                        {product.images.slice(1).map((image, idx) => (
                          <div key={image.id} className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={image.url}
                              alt={`${product.name} ${idx + 2}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 120px"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2" />
                      <p>Nenhuma imagem</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Details */}
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Nome</span>
                    <span className="text-base font-semibold text-gray-900">{product.name}</span>
                  </div>
                  {product.description && (
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">Descrição</span>
                      <span className="text-gray-700 text-sm">{product.description}</span>
                    </div>
                  )}
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Categoria</span>
                    <Badge variant="secondary">{product.category?.name || "Sem categoria"}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-xs text-gray-500 mb-1">Preço Atual</span>
                      <span className="text-lg font-bold text-green-600">€{Number(product.price).toFixed(2)}</span>
                    </div>
                    {product.oldPrice && (
                      <div>
                        <span className="block text-xs text-gray-500 mb-1">Preço Antigo</span>
                        <span className="text-base text-gray-500 line-through">€{Number(product.oldPrice).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Stock</span>
                    <span className={`text-base font-semibold ${totalStock > 0 ? 'text-green-600' : 'text-red-600'}`}>{totalStock} {totalStock === 1 ? 'unidade' : 'unidades'}</span>
                  </div>
                </CardContent>
              </Card>

              {(product.material || product.brand || product.season) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Tag className="w-5 h-5" /> Detalhes da Moda
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {product.brand && (
                      <div>
                        <span className="block text-xs text-gray-500 mb-1">Marca</span>
                        <span>{product.brand}</span>
                      </div>
                    )}
                    {product.material && (
                      <div>
                        <span className="block text-xs text-gray-500 mb-1">Material</span>
                        <span>{product.material}</span>
                      </div>
                    )}
                    {product.season && (
                      <div>
                        <span className="block text-xs text-gray-500 mb-1">Temporada</span>
                        <span>{product.season}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {product.variants.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Ruler className="w-4 h-4" /> <Palette className="w-4 h-4" /> Variações do Produto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {product.variants.map((variant, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            {variant.size && (
                              <div>
                                <span className="text-xs text-gray-500">Tamanho</span>
                                <span className="font-medium ml-1">{variant.size}</span>
                              </div>
                            )}
                            {variant.color && (
                              <div>
                                <span className="text-xs text-gray-500">Cor</span>
                                <span className="font-medium ml-1">{variant.color}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500">Stock</span>
                            <span className={`font-medium ml-1 ${variant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>{variant.stock}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Status do Produto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Produto Ativo</span>
                    <Badge variant={product.isActive ? "default" : "secondary"}>{product.isActive ? "Ativo" : "Inativo"}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Produto em Destaque</span>
                    <Badge variant={product.isFeatured ? "default" : "secondary"}>{product.isFeatured ? "Sim" : "Não"}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-4 h-4" />
                    Criado em {new Date(product.createdAt).toLocaleDateString("pt-PT")}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
