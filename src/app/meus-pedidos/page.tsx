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
    size?: string;
    color?: string;
    product: {
        name: string;
        images?: { url: string }[];
    };
};

type Order = {
    id: string;
    status: string;
    items: OrderItem[];
    total: number;
    paymentMethod: string;
    createdAt: string;
};

export default function MeusPedidosPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/orders")
            .then((res) => res.json())
            .then((data) => {
                setOrders(data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return <div className="p-8 text-center">Carregando...</div>;
    }

    if (!orders.length) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-2">Nenhum pedido encontrado</h2>
                <Link href="/produtos">
                    <Button>Ver produtos</Button>
                </Link>
            </div>
        );
    }

    return (
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
                                    Status: <span className="uppercase">{order.status}</span>
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4 mb-2">
                                {order.items.map((item: OrderItem) => (
                                    <div key={item.id} className="flex items-center gap-2">
                                        <div className="relative w-10 h-10 bg-gray-100 rounded">
                                            <Image
                                                src={item.product.images?.[0]?.url ?? ""}
                                                alt={item.product.name}
                                                className="object-cover rounded"
                                                width={40}
                                                height={40}
                                            />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{item.product?.name}</div>
                                            {(item.size || item.color) && (
                                                <div className="text-xs text-gray-500">
                                                    {item.size && `Tam: ${item.size}`} {item.size && item.color && '|'} {item.color && `Cor: ${item.color}`}
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-500">Qtd: {item.quantity}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-sm mt-2">
                                <span>Total:</span>
                                <span className="font-medium">€{Number(order.total).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-2">
                                <span>Pagamento:</span>
                                <span className="font-medium">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-2">
                                <span>Data:</span>
                                <span>{new Date(order.createdAt).toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
