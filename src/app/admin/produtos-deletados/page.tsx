"use client";

import { useState, useEffect } from "react";
import { Trash2, Package, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface DeletedProduct {
    id: string;
    name: string;
    price: number;
    deletedAt: string;
    category: {
        name: string;
    };
    images: Array<{
        url: string;
    }>;
    _count: {
        orderItems: number;
    };
}

export default function DeletedProductsPage() {
    const [products, setProducts] = useState<DeletedProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeletedProducts();
    }, []);

    async function fetchDeletedProducts() {
        try {
            const response = await fetch('/api/admin/products/deleted');
            if (response.ok) {
                const data = await response.json();
                setProducts(data.products);
            }
        } catch (error) {
            console.error('Erro ao carregar produtos deletados:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleRestore(productId: string) {
        if (!confirm('Deseja restaurar este produto?')) return;

        try {
            const response = await fetch(`/api/admin/products/${productId}/restore`, {
                method: 'POST',
            });

            if (response.ok) {
                alert('Produto restaurado com sucesso!');
                fetchDeletedProducts();
            } else {
                alert('Erro ao restaurar produto');
            }
        } catch (error) {
            alert('Erro ao restaurar produto');
        }
    }

    async function handlePermanentDelete(productId: string) {
        if (!confirm('ATENÇÃO: Esta ação é irreversível! Deseja deletar permanentemente este produto?')) return;

        try {
            const response = await fetch(`/api/admin/products/${productId}?force=true`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Produto deletado permanentemente!');
                fetchDeletedProducts();
            } else {
                const error = await response.json();
                alert(error.error || 'Erro ao deletar produto');
            }
        } catch (error) {
            alert('Erro ao deletar produto');
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Trash2 className="w-8 h-8" />
                        Produtos Deletados
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Produtos removidos que possuem pedidos concluídos
                    </p>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600">Nenhum produto deletado</h3>
                    <p className="text-gray-500 mt-2">Produtos deletados aparecerão aqui</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="border rounded-lg p-4 flex items-center gap-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="relative w-20 h-20 flex-shrink-0">
                                {product.images[0] ? (
                                    <Image
                                        src={product.images[0].url}
                                        alt={product.name}
                                        fill
                                        className="object-cover rounded"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                        <Package className="w-8 h-8 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{product.name}</h3>
                                <p className="text-sm text-gray-600">{product.category.name}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    € {product.price.toString()} • {product._count.orderItems} pedido(s)
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Deletado em: {new Date(product.deletedAt).toLocaleDateString('pt-BR')}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRestore(product.id)}
                                    className="flex items-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Restaurar
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handlePermanentDelete(product.id)}
                                    className="flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Deletar Permanentemente
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
