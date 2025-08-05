import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Package, Star, Calendar, Tag, Palette, Ruler } from "lucide-react";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  // Get product
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      images: {
        orderBy: { order: "asc" },
      },
      variants: true,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/products">
              <Button variant="outline" className="flex items-center gap-2 cursor-pointer w-auto">
                <ArrowLeft className="w-4 h-4" />
                Voltar aos Produtos
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600">Detalhes do produto</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/products/${product.id}/edit`}>
              <Button className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Editar Produto
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Imagens do Produto
                </CardTitle>
              </CardHeader>
              <CardContent>
                {product.images.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main image */}
                    <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      {product.images[0] && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Capa
                        </div>
                      )}
                    </div>
                    
                    {/* Other images */}
                    {product.images.length > 1 && (
                      <div className="grid grid-cols-3 gap-2">
                        {product.images.slice(1).map((image, index) => (
                          <div key={image.id} className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={image.url}
                              alt={`${product.name} ${index + 2}`}
                              fill
                              className="object-cover"
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
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nome</label>
                  <p className="text-lg font-semibold">{product.name}</p>
                </div>
                
                {product.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Descrição</label>
                    <p className="text-gray-600">{product.description}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Categoria</label>
                  <div className="mt-1">
                    <Badge variant="secondary">{product.category?.name || "Sem categoria"}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Preço Atual</label>
                    <p className="text-2xl font-bold text-green-600">€{Number(product.price).toFixed(2)}</p>
                  </div>
                  {product.oldPrice && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Preço Antigo</label>
                      <p className="text-lg text-gray-500 line-through">€{Number(product.oldPrice).toFixed(2)}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Stock</label>
                  <p className={`text-lg font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock} {product.stock === 1 ? 'unidade' : 'unidades'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Fashion Details */}
            {(product.material || product.brand || product.season || product.gender) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Detalhes da Moda
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {product.brand && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Marca</label>
                      <p>{product.brand}</p>
                    </div>
                  )}
                  {product.material && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Material</label>
                      <p>{product.material}</p>
                    </div>
                  )}
                  {product.season && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Temporada</label>
                      <p>{product.season}</p>
                    </div>
                  )}
                  {product.gender && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Público</label>
                      <p>{product.gender}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Variants */}
            {product.variants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Ruler className="w-4 h-4" />
                      <Palette className="w-4 h-4" />
                    </div>
                    Variações do Produto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {product.variants.map((variant, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          {variant.size && (
                            <div>
                              <span className="text-xs text-gray-500">Tamanho</span>
                              <p className="font-medium">{variant.size}</p>
                            </div>
                          )}
                          {variant.color && (
                            <div>
                              <span className="text-xs text-gray-500">Cor</span>
                              <p className="font-medium">{variant.color}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500">Stock</span>
                          <p className={`font-medium ${variant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {variant.stock}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status do Produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Produto Ativo</span>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Produto em Destaque</span>
                  <Badge variant={product.isFeatured ? "default" : "secondary"}>
                    {product.isFeatured ? "Sim" : "Não"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Criado em {new Date(product.createdAt).toLocaleDateString("pt-PT")}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
