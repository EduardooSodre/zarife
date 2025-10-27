"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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

// Map backend enum status to Portuguese labels
const translateStatus = (status: string) => {
    switch (status) {
        case "PAID":
            return "Pago";
        case "PROCESSING":
            return "Em processamento";
        case "SHIPPED":
            return "Enviado";
        case "DELIVERED":
            return "Entregue";
        case "CANCELLED":
            return "Cancelado";
        case "PENDING":
        default:
            return "Pendente";
    }
};

export default function MeusPedidosPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Avoid returning cached/stale order data so pages reflect webhook updates (e.g. Stripe -> PAID)
        fetch("/api/orders", { cache: "no-store" })
            .then((res) => res.json())
            .then((data) => {
                setOrders(data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ paddingTop: '100px' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Carregando pedidos...</p>
                </div>
            </div>
        );
    }

    if (!orders.length) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ paddingTop: '100px' }}>
                <div className="text-center">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Nenhum pedido encontrado</h2>
                    <p className="text-gray-600 mb-4">Você ainda não fez nenhuma compra.</p>
                    <Link href="/produtos">
                        <Button>Começar a comprar</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-light text-primary tracking-wider uppercase mb-8 text-center">
                    Meus Pedidos
                </h1>
                <div className="space-y-6">
                    {orders.map((order) => (
                        <Card key={order.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary" />
                                    Pedido #{order.id.slice(-8).toUpperCase()}
                                    <span className="ml-auto text-sm font-medium">
                                        Status: <span className="capitalize">{translateStatus(order.status)}</span>
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold mb-2">Produtos:</h3>
                                    {order.items && order.items.length > 0 ? (
                                        <div className="flex flex-wrap gap-4">
                                            {order.items.map((item: OrderItem) => (
                                                <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                    <div className="relative w-12 h-12 bg-white rounded overflow-hidden flex-shrink-0">
                                                        {item.product?.images?.[0]?.url ? (
                                                            <Image
                                                                src={item.product.images[0].url}
                                                                alt={item.product?.name || 'Produto'}
                                                                className="object-cover"
                                                                fill
                                                                sizes="48px"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                                <Package className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium truncate">{item.product?.name || 'Produto'}</div>
                                                        {(item.size || item.color) && (
                                                            <div className="text-xs text-gray-500">
                                                                {item.size && `Tam: ${item.size}`} {item.size && item.color && '| '} {item.color && `Cor: ${item.color}`}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-gray-600">
                                                            <span className="font-medium">Qtd: {item.quantity}</span>
                                                            <span className="ml-2 text-gray-500">€{(Number(item.price) * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">Nenhum item encontrado neste pedido.</p>
                                    )}
                                </div>
                                <div className="border-t pt-3 mt-3 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total:</span>
                                        <span className="font-semibold text-lg">€{Number(order.total).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Pagamento:</span>
                                        <span className="font-medium uppercase">{order.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Data:</span>
                                        <span className="text-gray-700">{new Date(order.createdAt).toLocaleString('pt-PT', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</span>
                                    </div>
                                    <div className="mt-4">
                                        <Link href={`/meus-pedidos/${order.id}`}>
                                            <Button variant="outline" className="w-full">
                                                Ver Pedido Completo
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
