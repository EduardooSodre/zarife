'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, Search, Filter, Download, ArrowLeft } from "lucide-react";

interface Order {
    id: string;
    status: string;
    total: number;
    shipping: number;
    createdAt: string;
    updatedAt: string;
    stripePaymentId: string | null;
    paypalOrderId: string | null;
    trackingCode: string | null;
    customerFirstName: string;
    customerLastName: string;
    customerPhone: string | null;
    shippingAddress: string;
    shippingComplement: string | null;
    shippingCity: string;
    shippingState: string | null;
    shippingPostalCode: string;
    shippingCountry: string;
    user: {
        name: string | null;
        email: string;
    };
    items: Array<{
        id: string;
        quantity: number;
        price: number;
        size: string | null;
        color: string | null;
        product: {
            id: string;
            name: string;
        };
    }>;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        async function fetchOrders() {
            try {
                const response = await fetch('/api/admin/orders');
                if (!response.ok) throw new Error('Failed to fetch orders');
                const data = await response.json();
                setOrders(data.orders || []);
                setFilteredOrders(data.orders || []);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    // Filter orders when search term or status filter changes
    useEffect(() => {
        let filtered = [...orders];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.user.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filter by status
        if (statusFilter) {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        setFilteredOrders(filtered);
    }, [searchTerm, statusFilter, orders]);

    const handleExport = () => {
        // Helper to escape CSV values
        const escapeCsv = (value: string | number | null | undefined) => {
            if (value === null || value === undefined) return '';
            const str = String(value);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        // Create CSV content with all order details
        const csvContent = [
            // Header
            [
                'Pedido ID',
                'Cliente Nome',
                'Cliente Email',
                'Cliente Telefone',
                'Data Pedido',
                'Última Atualização',
                'Status',
                'Endereço',
                'Complemento',
                'Cidade',
                'Estado',
                'Código Postal',
                'País',
                'Produtos',
                'Subtotal',
                'Envio',
                'Total',
                'ID Pagamento Stripe',
                'ID Pedido PayPal',
                'Código Rastreamento'
            ].join(','),
            // Data rows
            ...filteredOrders.map(order => {
                const subtotal = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
                const productsDetails = order.items.map(item =>
                    `${item.product.name}${item.size ? ` (Tamanho: ${item.size})` : ''}${item.color ? ` (Cor: ${item.color})` : ''} - Qtd: ${item.quantity} x €${Number(item.price).toFixed(2)}`
                ).join('; ');

                return [
                    escapeCsv(`#${order.id.slice(-8)}`),
                    escapeCsv(`${order.customerFirstName} ${order.customerLastName}`),
                    escapeCsv(order.user.email),
                    escapeCsv(order.customerPhone),
                    escapeCsv(new Date(order.createdAt).toLocaleString('pt-PT')),
                    escapeCsv(new Date(order.updatedAt).toLocaleString('pt-PT')),
                    escapeCsv(formatStatus(order.status)),
                    escapeCsv(order.shippingAddress),
                    escapeCsv(order.shippingComplement),
                    escapeCsv(order.shippingCity),
                    escapeCsv(order.shippingState),
                    escapeCsv(order.shippingPostalCode),
                    escapeCsv(order.shippingCountry),
                    escapeCsv(productsDetails),
                    escapeCsv(`€${subtotal.toFixed(2)}`),
                    escapeCsv(order.shipping === 0 ? 'Grátis' : `€${Number(order.shipping).toFixed(2)}`),
                    escapeCsv(`€${Number(order.total).toFixed(2)}`),
                    escapeCsv(order.stripePaymentId),
                    escapeCsv(order.paypalOrderId),
                    escapeCsv(order.trackingCode)
                ].join(',');
            })
        ].join('\n');

        // Create blob and download
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `pedidos_completo_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatStatus = (status: string) => {
        const statusMap: { [key: string]: string } = {
            PENDING: "Pendente",
            PAID: "Pago",
            SHIPPED: "Enviado",
            DELIVERED: "Entregue",
            CANCELLED: "Cancelado",
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PAID":
                return "bg-green-100 text-green-800";
            case "SHIPPED":
                return "bg-blue-100 text-blue-800";
            case "DELIVERED":
                return "bg-purple-100 text-purple-800";
            case "CANCELLED":
                return "bg-red-100 text-red-800";
            default:
                return "bg-yellow-100 text-yellow-800";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                            <p>Carregando pedidos...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Gestão de Pedidos
                        </h1>
                        <p className="text-gray-600">
                            Visualizar e gerir todos os pedidos da loja
                        </p>
                    </div>
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                </div>

                {/* Search and Filters */}
                <Card className="mb-6 border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Procurar por número do pedido ou cliente..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    aria-label="Filtrar por status"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                >
                                    <option value="">Todos os status</option>
                                    <option value="PENDING">Pendente</option>
                                    <option value="PAID">Pago</option>
                                    <option value="SHIPPED">Enviado</option>
                                    <option value="DELIVERED">Entregue</option>
                                    <option value="CANCELLED">Cancelado</option>
                                </select>
                                <Button variant="outline">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="text-center py-16">
                            <div className="mb-4">
                                <div className="bg-gray-100 p-6 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                                    <Eye className="h-8 w-8 text-gray-400" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {orders.length === 0 ? 'Nenhum pedido encontrado' : 'Nenhum resultado encontrado'}
                            </h3>
                            <p className="text-gray-600">
                                {orders.length === 0
                                    ? 'Os pedidos aparecerão aqui quando os clientes fizerem compras'
                                    : 'Tente ajustar os filtros de pesquisa'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Pedido
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cliente
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Data
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            #{order.id.slice(-8)}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {order.items.length} item(s)
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {order.user.name || "Cliente"}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {order.user.email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(order.createdAt).toLocaleDateString("pt-PT", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                            order.status
                                                        )}`}
                                                    >
                                                        {formatStatus(order.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    €{Number(order.total).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Link href={`/admin/orders/${order.id}`}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-3 w-3 mr-1" />
                                                                Ver
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {orders.length > 0 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" disabled>
                                Anterior
                            </Button>
                            <span className="px-3 py-1 text-sm text-gray-600">
                                Página 1 de 1
                            </span>
                            <Button variant="outline" size="sm" disabled>
                                Próximo
                            </Button>
                        </div>
                    </div>
                )}

                {/* Stats Summary */}
                {orders.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {orders.length}
                                </div>
                                <div className="text-sm text-gray-600">Total Pedidos</div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {orders.filter((o) => o.status === "PAID").length}
                                </div>
                                <div className="text-sm text-gray-600">Pagos</div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {orders.filter((o) => o.status === "SHIPPED").length}
                                </div>
                                <div className="text-sm text-gray-600">Enviados</div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    €{orders.reduce((sum, order) => sum + Number(order.total), 0).toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-600">Receita Total</div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
