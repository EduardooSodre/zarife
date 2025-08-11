import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  ShoppingBag,
  Users,
  Package,
  Euro,
  Plus,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  // Get dashboard stats
  const [
    totalProducts,
    totalOrders,
    totalUsers,
    recentOrders
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // Calculate revenue
  const revenue = recentOrders.reduce((sum, order) => sum + Number(order.total), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-light text-primary mb-4 tracking-wider uppercase">
            PAINEL ADMINISTRATIVO
          </h1>
          <p className="text-gray-600 text-lg">
            Bem-vinda ao centro de controlo da Zarife
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border border-gray-200 hover:shadow-sm transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Receita Total
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    €{revenue.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    +12% vs. mês anterior
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <Euro className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 hover:shadow-sm transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Produtos
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {totalProducts}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Em catálogo
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <Package className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 hover:shadow-sm transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Pedidos
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {totalOrders}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Este mês
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <ShoppingBag className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 hover:shadow-sm transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Clientes
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {totalUsers}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Registados
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardHeader className="p-6 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Pedidos Recentes
                </CardTitle>
                <Link href="/admin/orders">
                  <Button variant="outline" size="sm">
                    Ver Todos
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Nenhum pedido ainda</p>
                  <p className="text-sm text-gray-400">
                    Os pedidos aparecerão aqui assim que forem realizados
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <ShoppingBag className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            #{order.id.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.user.name || order.user.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.items.length} item(s)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          €{Number(order.total).toFixed(2)}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${order.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : order.status === "SHIPPED"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "DELIVERED"
                                ? "bg-purple-100 text-purple-800"
                                : order.status === "CANCELLED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                          }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="p-6 pb-3">
              <CardTitle className="text-lg font-semibold">
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-3">
                <Link href="/admin/products/new" className="block">
                  <Button className="w-full justify-start bg-black hover:bg-gray-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Produto
                  </Button>
                </Link>
                <Link href="/admin/categories/new" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Categoria
                  </Button>
                </Link>
                <Link href="/admin/orders" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Pedidos
                  </Button>
                </Link>
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Loja
                  </Button>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">
                  Estatísticas Rápidas
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Taxa de Conversão</span>
                    <span className="font-medium text-green-600">3.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ticket Médio</span>
                    <span className="font-medium text-gray-900">€{revenue > 0 ? (revenue / totalOrders).toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Produtos Ativos</span>
                    <span className="font-medium text-gray-900">{totalProducts}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
