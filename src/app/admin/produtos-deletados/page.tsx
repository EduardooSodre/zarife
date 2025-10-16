"use client";

import { useState, useEffect } from "react";
import { Trash2, Package, RotateCcw, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);
    const [dialogAction, setDialogAction] = useState<'restore' | 'delete' | null>(null);
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null); useEffect(() => {
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

    function openDialog(productId: string, productName: string, action: 'restore' | 'delete') {
        setSelectedProduct({ id: productId, name: productName });
        setDialogAction(action);
    }

    function closeDialog() {
        setSelectedProduct(null);
        setDialogAction(null);
    }

    async function confirmAction() {
        if (!selectedProduct || !dialogAction) return;

        try {
            if (dialogAction === 'restore') {
                const response = await fetch(`/api/admin/products/${selectedProduct.id}/restore`, {
                    method: 'POST',
                });

                if (response.ok) {
                    setAlert({ type: 'success', message: 'Produto restaurado com sucesso!' });
                    fetchDeletedProducts();
                } else {
                    setAlert({ type: 'error', message: 'Erro ao restaurar produto' });
                }
            } else if (dialogAction === 'delete') {
                const response = await fetch(`/api/products/${selectedProduct.id}?force=true`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setAlert({ type: 'success', message: 'Produto deletado permanentemente!' });
                    fetchDeletedProducts();
                } else {
                    const error = await response.json();
                    setAlert({ type: 'error', message: error.error || 'Erro ao deletar produto' });
                }
            }
        } catch {
            setAlert({ type: 'error', message: 'Erro ao processar a ação' });
        } finally {
            closeDialog();
            // Auto-hide alert após 5 segundos
            setTimeout(() => setAlert(null), 5000);
        }
    } if (loading) {
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

            {/* Alert de feedback */}
            {alert && (
                <Alert className={`mb-6 ${alert.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                    {alert.type === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                        {alert.message}
                    </AlertDescription>
                </Alert>
            )}            {products.length === 0 ? (
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

                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDialog(product.id, product.name, 'restore')}
                                    className="flex items-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Restaurar
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => openDialog(product.id, product.name, 'delete')}
                                    className="flex items-center gap-2"
                                    disabled={product._count.orderItems > 0}
                                    title={product._count.orderItems > 0 ? 'Produtos com pedidos não podem ser deletados permanentemente' : 'Deletar permanentemente'}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {product._count.orderItems > 0 ? 'Não Deletável' : 'Deletar Permanentemente'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* AlertDialog de confirmação */}
            <AlertDialog open={!!dialogAction} onOpenChange={closeDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {dialogAction === 'restore' ? 'Restaurar Produto' : 'Deletar Permanentemente'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {dialogAction === 'restore' ? (
                                <>
                                    Deseja restaurar o produto <span className="font-semibold">&quot;{selectedProduct?.name}&quot;</span>?
                                    <br />
                                    <br />
                                    O produto voltará a aparecer na lista de produtos ativos.
                                </>
                            ) : (
                                <>
                                    <span className="text-red-600 font-semibold">ATENÇÃO: Esta ação é irreversível!</span>
                                    <br />
                                    <br />
                                    Deseja deletar permanentemente o produto <span className="font-semibold">&quot;{selectedProduct?.name}&quot;</span>?
                                    <br />
                                    <br />
                                    <span className="text-sm text-gray-600">
                                        ⚠️ <strong>Importante:</strong> Apenas produtos SEM pedidos podem ser deletados permanentemente.
                                        Produtos com histórico de pedidos serão mantidos para preservar os registros de vendas.
                                    </span>
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmAction}
                            className={dialogAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                            {dialogAction === 'restore' ? 'Restaurar' : 'Deletar Permanentemente'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
