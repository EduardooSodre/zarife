'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Eye, Search, Package, ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";
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
        orderItems: number;
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

    console.log('🔄 Current state - Products:', products.length, 'Categories:', categories.length);

    // Estados para filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStockStatus, setSelectedStockStatus] = useState('');

    // Produtos filtrados
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    // Função para recarregar produtos
    const refreshProducts = async () => {
        try {
            const response = await fetch('/api/admin/products');
            if (response.ok) {
                const data = await response.json();
                setProducts(data.products || []);
            }
        } catch (err) {
            console.error('Erro ao recarregar produtos:', err);
        }
    };

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

                console.log('📦 Products loaded:', productsData.products?.length || 0);
                console.log('📁 Categories response:', categoriesData);

                const categoriesList = categoriesData.data || categoriesData.all || [];
                console.log('📁 Categories list:', categoriesList.length);

                setProducts(productsData.products || []);
                setCategories(categoriesList);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro desconhecido');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Filtrar produtos sempre que mudar os filtros ou a lista de produtos
    useEffect(() => {
        let filtered = [...products];

        // Filtro de busca
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro de categoria
        if (selectedCategory) {
            filtered = filtered.filter(product => product.category.slug === selectedCategory);
        }

        // Filtro de stock
        if (selectedStockStatus === 'in-stock') {
            filtered = filtered.filter(product => product.stock > 0);
        } else if (selectedStockStatus === 'out-of-stock') {
            filtered = filtered.filter(product => product.stock === 0);
        } else if (selectedStockStatus === 'low-stock') {
            filtered = filtered.filter(product => product.stock > 0 && product.stock <= 5);
        }

        setFilteredProducts(filtered);
        setCurrentPage(1); // Reset para primeira página quando filtrar
    }, [products, searchTerm, selectedCategory, selectedStockStatus]);

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
                        <NewProductDialog onCreated={refreshProducts} />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-white p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary mr-2 sm:mr-3" />
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Total</p>
                                <p className="text-lg sm:text-2xl font-light text-primary">{filteredProducts.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="h-2 w-2 bg-green-500 rounded-full mr-2 sm:mr-3"></div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Em Stock</p>
                                <p className="text-lg sm:text-2xl font-light text-primary">{filteredProducts.filter(p => p.stock > 0).length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="h-2 w-2 bg-red-500 rounded-full mr-2 sm:mr-3"></div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Sem Stock</p>
                                <p className="text-lg sm:text-2xl font-light text-primary">{filteredProducts.filter(p => p.stock === 0).length}</p>
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
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Procurar produtos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}>
                                    <SelectTrigger className="w-full sm:w-[200px] bg-white">
                                        <SelectValue placeholder="Todas as categorias" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas as categorias</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.slug}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={selectedStockStatus || "all"} onValueChange={(value) => setSelectedStockStatus(value === "all" ? "" : value)}>
                                    <SelectTrigger className="w-full sm:w-[180px] bg-white">
                                        <SelectValue placeholder="Todos os estados" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os estados</SelectItem>
                                        <SelectItem value="in-stock">Em Stock</SelectItem>
                                        <SelectItem value="out-of-stock">Sem Stock</SelectItem>
                                        <SelectItem value="low-stock">Stock Baixo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Mostrar filtros ativos */}
                            {(searchTerm || selectedCategory || selectedStockStatus) && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm text-gray-600">Filtros ativos:</span>
                                    {searchTerm && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                                            Busca: &ldquo;{searchTerm}&rdquo;
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="hover:bg-primary/20 rounded-full p-0.5"
                                                aria-label="Remover filtro de busca"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                    {selectedCategory && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                                            Categoria: {categories.find(c => c.slug === selectedCategory)?.name}
                                            <button
                                                onClick={() => setSelectedCategory('')}
                                                className="hover:bg-primary/20 rounded-full p-0.5"
                                                aria-label="Remover filtro de categoria"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                    {selectedStockStatus && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                                            Stock: {selectedStockStatus === 'in-stock' ? 'Em Stock' : selectedStockStatus === 'out-of-stock' ? 'Sem Stock' : 'Stock Baixo'}
                                            <button
                                                onClick={() => setSelectedStockStatus('')}
                                                className="hover:bg-primary/20 rounded-full p-0.5"
                                                aria-label="Remover filtro de stock"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    )}
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSelectedCategory('');
                                            setSelectedStockStatus('');
                                        }}
                                        className="text-xs text-gray-600 hover:text-gray-900 underline"
                                    >
                                        Limpar todos
                                    </button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="text-center py-12 sm:py-16 px-4">
                            <div className="mb-4">
                                <div className="bg-gray-100 p-4 sm:p-6 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center">
                                    <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                                </div>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                                {products.length === 0 ? 'Nenhum produto encontrado' : 'Nenhum produto corresponde aos filtros'}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                                {products.length === 0
                                    ? 'Comece a adicionar produtos ao seu catálogo'
                                    : 'Tente ajustar os filtros de busca'}
                            </p>
                            {products.length === 0 && (
                                <NewProductDialog
                                    onCreated={refreshProducts}
                                    buttonText="Criar Primeiro Produto"
                                    buttonClassName="bg-black hover:bg-gray-800"
                                />
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {currentProducts.map((product) => (
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
                                                    return <EditProductDialog
                                                        product={{
                                                            ...productWithoutOldPrice,
                                                            price: Number(product.price),
                                                        }}
                                                        onUpdated={refreshProducts}
                                                    />;
                                                })()}
                                                <DeleteProductButton
                                                    productId={product.id}
                                                    productName={product.name}
                                                    onDeleted={refreshProducts}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="p-3 sm:p-4">
                                        <div className="mb-2 flex flex-wrap gap-2">
                                            {product.category && (
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                    {product.category.name}
                                                </span>
                                            )}
                                            {product._count.orderItems > 0 && (
                                                <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full font-medium">
                                                    {product._count.orderItems} {product._count.orderItems === 1 ? 'pedido' : 'pedidos'}
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
                                                    return <EditProductDialog
                                                        product={{
                                                            ...productWithoutOldPrice,
                                                            price: Number(product.price),
                                                        }}
                                                        onUpdated={refreshProducts}
                                                    />;
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
                {totalPages > 1 && (
                    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6">
                        <div className="text-sm text-gray-600">
                            Mostrando <span className="font-semibold">{startIndex + 1}</span> a{' '}
                            <span className="font-semibold">{Math.min(endIndex, filteredProducts.length)}</span> de{' '}
                            <span className="font-semibold">{filteredProducts.length}</span> produto
                            {filteredProducts.length !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Anterior</span>
                            </Button>
                            <span className="px-3 py-1 text-sm text-gray-600">
                                Página <span className="font-semibold">{currentPage}</span> de{' '}
                                <span className="font-semibold">{totalPages}</span>
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="gap-2"
                            >
                                <span className="hidden sm:inline">Próximo</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
}
