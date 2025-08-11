import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, Search, Filter, Download, ArrowLeft } from "lucide-react";

export default async function AdminOrdersPage() {

    // Get all orders
    const orders = await prisma.order.findMany({
        include: {
            user: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

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
                    <Button variant="outline">
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
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-2">
                                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent">
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
                {orders.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="text-center py-16">
                            <div className="mb-4">
                                <div className="bg-gray-100 p-6 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                                    <Eye className="h-8 w-8 text-gray-400" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Nenhum pedido encontrado
                            </h3>
                            <p className="text-gray-600">
                                Os pedidos aparecerão aqui quando os clientes fizerem compras
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
                                        {orders.map((order) => (
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
