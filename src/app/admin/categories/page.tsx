'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info } from 'lucide-react';
import { CategorySortableList } from '@/components/admin/category-sortable-list';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    isActive: boolean;
    order: number;
    _count: {
        products: number;
    };
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Carregar categorias
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data.data || []);
            }
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReorder = async (newOrder: Category[]) => {
        // Atualizar ordem localmente primeiro para feedback imediato
        const updatedCategories = newOrder.map((category, index) => ({
            ...category,
            order: index
        }));
        setCategories(updatedCategories);
        setUpdating(true);

        try {
            const categoryOrders = updatedCategories.map((category, index) => ({
                id: category.id,
                order: index
            }));

            const response = await fetch('/api/categories/reorder', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ categoryOrders }),
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar ordem');
            }

            // Recarregar categorias para garantir sincronização
            await fetchCategories();
        } catch (error) {
            console.error('Erro ao reordenar categorias:', error);
            // Reverter para ordem original em caso de erro
            await fetchCategories();
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando categorias...</p>
                </div>
            </div>
        );
    }

    const totalProducts = categories.reduce((acc, cat) => acc + cat._count.products, 0);
    const activeCategories = categories.filter(cat => cat.isActive);
    const inactiveCategories = categories.filter(cat => !cat.isActive);

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
                        <h1 className="text-4xl font-light text-black mb-4 tracking-wider uppercase">
                            Gestão de Categorias
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Gerir as categorias de produtos da Zarife
                        </p>
                    </div>
                    <Link href="/admin/categories/new" className="inline-block">
                        <Button className="bg-black hover:bg-gray-800 text-white w-auto cursor-pointer uppercase tracking-widest text-sm py-3 px-6">
                            + Nova Categoria
                        </Button>
                    </Link>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
                    <div className="bg-white p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="h-2 w-2 bg-blue-500 rounded-full mr-2 sm:mr-3"></div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Total</p>
                                <p className="text-lg sm:text-2xl font-light text-black">{categories.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="h-2 w-2 bg-green-500 rounded-full mr-2 sm:mr-3"></div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Ativas</p>
                                <p className="text-lg sm:text-2xl font-light text-black">{activeCategories.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="h-2 w-2 bg-red-500 rounded-full mr-2 sm:mr-3"></div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Inativas</p>
                                <p className="text-lg sm:text-2xl font-light text-black">{inactiveCategories.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="h-2 w-2 bg-purple-500 rounded-full mr-2 sm:mr-3"></div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Produtos</p>
                                <p className="text-lg sm:text-2xl font-light text-black">{totalProducts}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Aviso sobre ordenação */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-semibold text-blue-900 mb-1">
                                Ordem das Categorias na Página Inicial
                            </h3>
                            <p className="text-sm text-blue-800">
                                As primeiras 4 categorias <strong>ativas</strong> na ordem abaixo aparecem na página inicial. 
                                Arraste e solte para reordenar. Categorias inativas não aparecem na página inicial.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Lista de Categorias com Drag and Drop */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Ordenação das Categorias</h2>
                            {updating && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                    Salvando ordem...
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-6">
                        {categories.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-lg mb-4">Nenhuma categoria encontrada.</p>
                                <Link href="/admin/categories/new" className="inline-block">
                                    <Button>Criar primeira categoria</Button>
                                </Link>
                            </div>
                        ) : (
                            <CategorySortableList 
                                categories={categories} 
                                onReorder={handleReorder}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
