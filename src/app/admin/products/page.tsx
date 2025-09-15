'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Search, Package, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { EditProductDialog } from "./edit-product-dialog";
import { NewProductDialog } from "./new-product-dialog";

interface Product {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    oldPrice?: number | null;
    stock: number;
    isActive: boolean;
    category: {
        name: string;
        slug: string;
    };
    images: Array<{
        url: string;
    }>;
    _count: {
        images: number;
    };
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [productsResponse, categoriesResponse] = await Promise.all([
                    fetch('/api/admin/products'),
                    fetch('/api/categories/for-products')
                ]);

                if (!productsResponse.ok || !categoriesResponse.ok) {
                    throw new Error('Falha ao carregar dados');
                }

                const productsData = await productsResponse.json();
                const categoriesData = await categoriesResponse.json();

                setProducts(productsData.products || []);
                setCategories(categoriesData.data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro desconhecido');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                            <p>Carregando produtos...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                    <Card className="border-0 shadow-sm">
                        <CardContent className="text-center py-16">
                            <div className="text-red-600 mb-4">
                                <Package className="h-12 w-12 mx-auto" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Erro ao carregar produtos
                            </h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <Button onClick={() => window.location.reload()}>
                                Tentar Novamente
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {/* Botão de retorno */}
                <div className="mb-6">
                    <Link href="/admin" className="inline-block">
                        <Button variant="outline" className="flex items-center gap-2 cursor-pointer w-auto">
                            <ArrowLeft className="w-4 h-4" />
                            Voltar ao Painel
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-light text-primary mb-4 tracking-wider uppercase">
                            Gestão de Produtos
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Gerir o catálogo de produtos da Zarife
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <NewProductDialog onCreated={() => window.location.reload()} />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-white p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary mr-2 sm:mr-3" />
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Total</p>
                                <p className="text-lg sm:text-2xl font-light text-primary">{products.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="h-2 w-2 bg-green-500 rounded-full mr-2 sm:mr-3"></div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Em Stock</p>
                                <p className="text-lg sm:text-2xl font-light text-primary">{products.filter(p => p.stock > 0).length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="h-2 w-2 bg-red-500 rounded-full mr-2 sm:mr-3"></div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Sem Stock</p>
                                <p className="text-lg sm:text-2xl font-light text-primary">{products.filter(p => p.stock === 0).length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="h-2 w-2 bg-accent rounded-full mr-2 sm:mr-3"></div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Categorias</p>
                                <p className="text-lg sm:text-2xl font-light text-primary">{categories.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <Card className="mb-6 sm:mb-8 border border-gray-200 shadow-sm">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Procurar produtos..."
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                />
                            </div>
                            <select className="px-3 sm:px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm">
                                <option value="">Todas as categorias</option>
                                {(categories || []).map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <select className="px-3 sm:px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm">
                                <option value="">Todos os estados</option>
                                <option value="in-stock">Em Stock</option>
                                <option value="out-of-stock">Sem Stock</option>
                                <option value="low-stock">Stock Baixo</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Products Grid */}
                {products.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="text-center py-12 sm:py-16 px-4">
                            <div className="mb-4">
                                <div className="bg-gray-100 p-4 sm:p-6 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center">
                                    <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                                </div>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                                Nenhum produto encontrado
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                                Comece a adicionar produtos ao seu catálogo
                            </p>
                            <NewProductDialog 
                                onCreated={() => window.location.reload()} 
                                buttonText="Criar Primeiro Produto"
                                buttonClassName="bg-black hover:bg-gray-800"
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {products.map((product) => (
                            <Card key={product.id} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200 group">
                                <CardContent className="p-0">
                                    {/* Product Image */}
                                    <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                                        {product.images && product.images.length > 0 ? (
                                            <Image
                                                src={product.images[0].url}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-200 group-hover:scale-105"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="text-gray-400">
                                                    <Package className="h-6 w-6 sm:h-8 sm:w-8" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Stock Status */}
                                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${product.stock > 0
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                                }`}>
                                                {product.stock > 0 ? `${product.stock} em stock` : "Esgotado"}
                                            </span>
                                        </div>

                                        {/* Actions Overlay */}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <div className="flex space-x-1 sm:space-x-2">
                                                <Link href={`/admin/products/${product.id}`}>
                                                    <Button size="sm" variant="outline" className="bg-white text-xs sm:text-sm h-7 sm:h-8 cursor-pointer">
                                                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    </Button>
                                                </Link>
                                                {(() => {
                                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                    const { oldPrice, ...productWithoutOldPrice } = product;
                                                    return <EditProductDialog product={{
                                                        ...productWithoutOldPrice,
                                                        price: Number(product.price),
                                                    }} />;
                                                })()}
                                                <DeleteProductButton
                                                    productId={product.id}
                                                    productName={product.name}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="p-3 sm:p-4">
                                        <div className="mb-2">
                                            {product.category && (
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                    {product.category.name}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm sm:text-base">
                                            {product.name}
                                        </h3>

                                        {product.description && (
                                            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                                                {product.description}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-base sm:text-lg font-bold text-gray-900">
                                                    €{Number(product.price).toFixed(2)}
                                                </p>
                                                {product.oldPrice && Number(product.oldPrice) > Number(product.price) && (
                                                    <p className="text-xs sm:text-sm text-gray-500 line-through">
                                                        €{Number(product.oldPrice).toFixed(2)}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-1">
                                                {(() => {
                                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                    const { oldPrice, ...productWithoutOldPrice } = product;
                                                    return <EditProductDialog product={{
                                                        ...productWithoutOldPrice,
                                                        price: Number(product.price),
                                                    }} />;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {products.length > 0 && (
                    <div className="mt-6 sm:mt-8 flex justify-center">
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" disabled className="text-xs sm:text-sm">
                                Anterior
                            </Button>
                            <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600">
                                Página 1 de 1
                            </span>
                            <Button variant="outline" size="sm" disabled className="text-xs sm:text-sm">
                                Próximo
                            </Button>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
}
