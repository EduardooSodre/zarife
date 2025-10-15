"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, MapPin, CreditCard, Truck, CheckCircle2, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

type OrderItem = {
    id: string;
    quantity: number;
    price: number;
    size?: string | null;
    color?: string | null;
    product: {
        id: string;
        name: string;
        images?: { url: string }[];
    };
};

type Order = {
    id: string;
    status: string;
    items: OrderItem[];
    total: number;
    subtotal: number;
    shipping: number;
    paymentMethod: string;
    createdAt: string;
    updatedAt: string;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingState: string;
    shippingPostalCode: string;
    shippingCountry: string;
    shippingComplement?: string | null;
    trackingCode?: string | null;
    notes?: string | null;
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    PENDING: {
        label: "Pagamento Pendente",
        icon: <Clock className="w-5 h-5" />,
        color: "text-yellow-600 bg-yellow-50"
    },
    PAID: {
        label: "Pago - Processando",
        icon: <CheckCircle2 className="w-5 h-5" />,
        color: "text-green-600 bg-green-50"
    },
    PROCESSING: {
        label: "Em Processamento",
        icon: <Package className="w-5 h-5" />,
        color: "text-blue-600 bg-blue-50"
    },
    SHIPPED: {
        label: "Enviado",
        icon: <Truck className="w-5 h-5" />,
        color: "text-purple-600 bg-purple-50"
    },
    DELIVERED: {
        label: "Entregue",
        icon: <CheckCircle2 className="w-5 h-5" />,
        color: "text-green-700 bg-green-100"
    },
    CANCELLED: {
        label: "Cancelado",
        icon: <Clock className="w-5 h-5" />,
        color: "text-red-600 bg-red-50"
    }
};

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/orders/${orderId}`)
            .then((res) => {
                if (!res.ok) throw new Error("Pedido não encontrado");
                return res.json();
            })
            .then((data) => {
                setOrder(data);
                setIsLoading(false);
            })
            .catch(() => {
                setIsLoading(false);
            });
    }, [orderId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Carregando detalhes do pedido...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
                <div className="text-center">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Pedido não encontrado</h2>
                    <p className="text-gray-600 mb-4">O pedido solicitado não existe ou você não tem permissão para visualizá-lo.</p>
                    <Link href="/meus-pedidos">
                        <Button>Voltar aos Meus Pedidos</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const statusInfo = statusConfig[order.status] || statusConfig.PENDING;

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/meus-pedidos")}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar aos Meus Pedidos
                    </Button>
                    <h1 className="text-3xl font-light text-primary tracking-wider uppercase">
                        Pedido #{order.id.slice(-8).toUpperCase()}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Realizado em {new Date(order.createdAt).toLocaleString('pt-PT', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status do Pedido */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {statusInfo.icon}
                                    Status do Pedido
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${statusInfo.color}`}>
                                    {statusInfo.label}
                                </div>

                                {/* Rastreamento */}
                                {order.trackingCode && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-start gap-3">
                                            <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="font-semibold text-blue-900 mb-1">Código de Rastreamento</p>
                                                <p className="text-blue-700 font-mono text-sm mb-2">{order.trackingCode}</p>
                                                <a
                                                    href={`https://www.ctt.pt/feapl_2/app/open/objectSearch/objectSearch.jspx?objects=${order.trackingCode}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                                                >
                                                    Rastrear encomenda nos CTT →
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!order.trackingCode && order.status === 'SHIPPED' && (
                                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <p className="text-yellow-800 text-sm">
                                            O código de rastreamento será disponibilizado em breve.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Produtos */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Produtos ({order.items.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="relative w-20 h-20 bg-white rounded overflow-hidden flex-shrink-0">
                                                {item.product?.images?.[0]?.url ? (
                                                    <Image
                                                        src={item.product.images[0].url}
                                                        alt={item.product?.name || 'Produto'}
                                                        className="object-cover"
                                                        fill
                                                        sizes="80px"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                        <Package className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <Link href={`/product/${item.product.id}`}>
                                                    <h3 className="font-medium hover:text-primary transition-colors">
                                                        {item.product?.name || 'Produto'}
                                                    </h3>
                                                </Link>
                                                {(item.size || item.color) && (
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        {item.size && `Tamanho: ${item.size}`}
                                                        {item.size && item.color && ' • '}
                                                        {item.color && `Cor: ${item.color}`}
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-sm text-gray-600">
                                                        Quantidade: {item.quantity}
                                                    </span>
                                                    <span className="font-semibold">
                                                        €{(Number(item.price) * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notas */}
                        {order.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Observações</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700">{order.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Resumo do Pedido */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Resumo do Pedido
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-medium">€{Number(order.subtotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Envio:</span>
                                    <span className="font-medium">€{Number(order.shipping).toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between">
                                        <span className="font-semibold">Total:</span>
                                        <span className="font-bold text-lg text-primary">€{Number(order.total).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="border-t pt-3 mt-3">
                                    <p className="text-sm text-gray-600">Método de Pagamento</p>
                                    <p className="font-medium uppercase mt-1">{order.paymentMethod}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rastreamento */}
                        {order.trackingCode && (
                            <Card className="bg-blue-50 border-blue-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-blue-900">
                                        <Truck className="w-5 h-5" />
                                        Rastreamento do Pedido
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm text-blue-700 mb-2">Código de Rastreamento:</p>
                                        <p className="tracking-widest font-bold text-lg text-blue-900 bg-white px-4 py-3 rounded-lg border border-blue-300" style={{ fontFamily: 'Fira Mono, JetBrains Mono, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
                                            {order.trackingCode}
                                        </p>
                                    </div>
                                    <a
                                        href={`https://www.ctt.pt/feapl_2/app/open/cttexpresso/objectSearch/objectSearch.jspx?objects=${order.trackingCode}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium transition-colors"
                                    >
                                        <Truck className="w-4 h-4" />
                                        Rastrear no site dos CTT →
                                    </a>
                                    <p className="text-xs text-blue-600 mt-2">
                                        Clique no link acima para acompanhar a entrega do seu pedido em tempo real.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Endereço de Entrega */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Endereço de Entrega
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="font-medium">
                                    {order.customerFirstName} {order.customerLastName}
                                </p>
                                <p className="text-sm text-gray-700">{order.shippingAddress}</p>
                                {order.shippingComplement && (
                                    <p className="text-sm text-gray-700">{order.shippingComplement}</p>
                                )}
                                <p className="text-sm text-gray-700">
                                    {order.shippingPostalCode} {order.shippingCity}
                                </p>
                                <p className="text-sm text-gray-700">
                                    {order.shippingState}, {order.shippingCountry}
                                </p>
                                <div className="border-t pt-3 mt-3 space-y-1">
                                    <p className="text-sm text-gray-600">
                                        Email: <span className="text-gray-900">{order.customerEmail}</span>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Telefone: <span className="text-gray-900">{order.customerPhone}</span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
