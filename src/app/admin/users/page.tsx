import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Search, Filter, UserCheck, Crown, ArrowLeft } from "lucide-react";

export default async function AdminUsersPage() {

    // Get all users with order statistics
    const users = await prisma.user.findMany({
        include: {
            orders: true,
        },
        orderBy: { createdAt: "desc" },
    });

    const formatRole = (role: string) => {
        const roleMap: { [key: string]: string } = {
            USER: "Cliente",
            ADMIN: "Administrador",
        };
        return roleMap[role] || role;
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-purple-100 text-purple-800";
            default:
                return "bg-gray-100 text-gray-800";
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
                            Gestão de Clientes
                        </h1>
                        <p className="text-gray-600">
                            Visualizar e gerir todos os clientes registados
                        </p>
                    </div>
                </div>

                {/* Search and Filters */}
                <Card className="mb-6 border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Procurar por nome ou email..."
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-2">
                                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent">
                                    <option value="">Todos os tipos</option>
                                    <option value="USER">Clientes</option>
                                    <option value="ADMIN">Administradores</option>
                                </select>
                                <Button variant="outline">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users List */}
                {users.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="text-center py-16">
                            <div className="mb-4">
                                <div className="bg-gray-100 p-6 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                                    <Users className="h-8 w-8 text-gray-400" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Nenhum cliente encontrado
                            </h3>
                            <p className="text-gray-600">
                                Os clientes aparecerão aqui quando se registarem na loja
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {users.map((customer) => (
                            <Card key={customer.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-gray-100 p-3 rounded-full">
                                                {customer.role === "ADMIN" ? (
                                                    <Crown className="h-6 w-6 text-purple-600" />
                                                ) : (
                                                    <UserCheck className="h-6 w-6 text-gray-600" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {customer.name || "Cliente"}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {customer.email}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                                                customer.role
                                            )}`}
                                        >
                                            {formatRole(customer.role)}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Membro desde:</span>
                                            <span className="font-medium text-gray-900">
                                                {new Date(customer.createdAt).toLocaleDateString("pt-PT", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Total de pedidos:</span>
                                            <span className="font-medium text-gray-900">
                                                {customer.orders.length}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Valor total gasto:</span>
                                            <span className="font-medium text-gray-900">
                                                €{customer.orders
                                                    .reduce((sum, order) => sum + Number(order.total), 0)
                                                    .toFixed(2)}
                                            </span>
                                        </div>

                                        {customer.address && (
                                            <div className="pt-2 border-t border-gray-200">
                                                <span className="text-xs text-gray-500">Endereço:</span>
                                                <p className="text-sm text-gray-700 mt-1">
                                                    {customer.address}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className={`w-2 h-2 rounded-full ${customer.orders.length > 0 ? "bg-green-400" : "bg-gray-300"
                                                        }`}
                                                />
                                                <span className="text-xs text-gray-600">
                                                    {customer.orders.length > 0 ? "Cliente ativo" : "Sem pedidos"}
                                                </span>
                                            </div>

                                            <Button variant="outline" size="sm">
                                                Ver Detalhes
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Stats Summary */}
                {users.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {users.length}
                                </div>
                                <div className="text-sm text-gray-600">Total Clientes</div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {users.filter((u) => u.orders.length > 0).length}
                                </div>
                                <div className="text-sm text-gray-600">Clientes Ativos</div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {users.filter((u) => u.role === "ADMIN").length}
                                </div>
                                <div className="text-sm text-gray-600">Administradores</div>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {users.filter((u) => {
                                        const oneMonthAgo = new Date();
                                        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                                        return new Date(u.createdAt) > oneMonthAgo;
                                    }).length}
                                </div>
                                <div className="text-sm text-gray-600">Novos Este Mês</div>
                            </CardContent>
                        </Card>
                    </div>
                )}


            </div>
        </div>
    );
}
