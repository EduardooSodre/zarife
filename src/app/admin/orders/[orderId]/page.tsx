import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, MapPin, User, CreditCard, Truck, Calendar, Phone, Mail } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

interface OrderDetailPageProps {
    params: Promise<{ orderId: string }>;
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
    const { orderId } = await params;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: true,
            items: {
                include: {
                    product: {
                        include: {
                            images: {
                                take: 1,
                                orderBy: { order: 'asc' },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!order) {
        notFound();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const trackingCode = (order as any).trackingCode as string | null;

    const formatStatus = (status: string) => {
        const statusMap: { [key: string]: string } = {
            PENDING: "Pendente",
            PAID: "Pago",
            PROCESSING: "Processando",
            SHIPPED: "Enviado",
            DELIVERED: "Entregue",
            CANCELLED: "Cancelado",
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PAID":
                return "bg-green-100 text-green-800 border-green-200";
            case "PROCESSING":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "SHIPPED":
                return "bg-purple-100 text-purple-800 border-purple-200";
            case "DELIVERED":
                return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "CANCELLED":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
        }
    };

    const subtotal = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const shipping = Number(order.shipping) || 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Botão de retorno */}
                <div className="mb-6">
                    <Link href="/admin/orders" className="inline-block">
                        <Button variant="outline" className="flex items-center gap-2 cursor-pointer">
                            <ArrowLeft className="w-4 h-4" />
                            Voltar aos Pedidos
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Pedido #{order.id.slice(-8).toUpperCase()}
                        </h1>
                        <p className="text-gray-600">
                            Realizado em {new Date(order.createdAt).toLocaleDateString("pt-PT", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                    </div>
                    <div>
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                            {formatStatus(order.status)}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Produtos do Pedido */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="border-b bg-gray-50">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Package className="w-5 h-5" />
                                    Produtos ({order.items.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                                            {/* Imagem do Produto */}
                                            <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                {item.product.images?.[0]?.url ? (
                                                    <Image
                                                        src={item.product.images[0].url}
                                                        alt={item.product.name}
                                                        width={80}
                                                        height={80}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Package className="w-8 h-8" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Detalhes do Produto */}
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900 mb-1">
                                                    {item.product.name}
                                                </h3>
                                                {(item.size || item.color) && (
                                                    <div className="text-sm text-gray-600 mb-2">
                                                        {item.size && <span>Tamanho: {item.size}</span>}
                                                        {item.size && item.color && <span className="mx-1">•</span>}
                                                        {item.color && <span>Cor: {item.color}</span>}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="text-gray-600">
                                                        Quantidade: <span className="font-medium text-gray-900">{item.quantity}</span>
                                                    </span>
                                                    <span className="text-gray-600">
                                                        Preço unit.: <span className="font-medium text-gray-900">€{Number(item.price).toFixed(2)}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Total do Item */}
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">
                                                    €{(Number(item.price) * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Endereço de Envio */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="border-b bg-gray-50">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <MapPin className="w-5 h-5" />
                                    Endereço de Envio
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-2">
                                    <p className="font-medium text-gray-900">
                                        {order.customerFirstName} {order.customerLastName}
                                    </p>
                                    <p className="text-gray-700">{order.shippingAddress}</p>
                                    {order.shippingComplement && (
                                        <p className="text-gray-700">{order.shippingComplement}</p>
                                    )}
                                    <p className="text-gray-700">
                                        {order.shippingPostalCode} {order.shippingCity}
                                    </p>
                                    {order.shippingState && (
                                        <p className="text-gray-700">{order.shippingState}</p>
                                    )}
                                    {order.shippingCountry && (
                                        <p className="text-gray-700">{order.shippingCountry}</p>
                                    )}
                                    {order.customerPhone && (
                                        <div className="flex items-center gap-2 mt-3 text-gray-700">
                                            <Phone className="w-4 h-4" />
                                            <span>{order.customerPhone}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - 1 column */}
                    <div className="space-y-6">
                        {/* Informações do Cliente */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="border-b bg-gray-50">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <User className="w-5 h-5" />
                                    Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Nome</p>
                                        <p className="font-medium text-gray-900">{order.user.name || "Não informado"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Email</p>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <p className="text-gray-900">{order.user.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resumo do Pedido */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="border-b bg-gray-50">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <CreditCard className="w-5 h-5" />
                                    Resumo do Pagamento
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-gray-700">
                                        <span>Subtotal</span>
                                        <span>€{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Envio</span>
                                        <span>{shipping === 0 ? "Grátis" : `€${shipping.toFixed(2)}`}</span>
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between text-lg font-bold text-gray-900">
                                            <span>Total</span>
                                            <span>€{Number(order.total).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    {order.stripePaymentId && (
                                        <div className="text-xs text-gray-500 pt-2 border-t">
                                            <p>ID Pagamento Stripe:</p>
                                            <p className="font-mono break-all">{order.stripePaymentId}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Informações de Rastreamento */}
                        {trackingCode && (
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="border-b bg-gray-50">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Truck className="w-5 h-5" />
                                        Rastreamento
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600">Código de Rastreamento</p>
                                        <p className="font-mono font-medium text-gray-900 bg-gray-50 p-2 rounded">
                                            {trackingCode}
                                        </p>
                                        <a
                                            href={`https://www.ctt.pt/feapl_2/app/open/cttexpresso/objectSearch/objectSearch.jspx?objects=${trackingCode}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:text-blue-800 inline-block mt-2"
                                        >
                                            Rastrear no CTT →
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Timeline/Status */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="border-b bg-gray-50">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Calendar className="w-5 h-5" />
                                    Histórico
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Pedido Criado</p>
                                            <p className="text-xs text-gray-600">
                                                {new Date(order.createdAt).toLocaleString("pt-PT")}
                                            </p>
                                        </div>
                                    </div>
                                    {order.updatedAt && order.updatedAt.getTime() !== order.createdAt.getTime() && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Última Atualização</p>
                                                <p className="text-xs text-gray-600">
                                                    {new Date(order.updatedAt).toLocaleString("pt-PT")}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
