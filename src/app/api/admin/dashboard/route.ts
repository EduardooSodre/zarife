import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar se o usuário é admin
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Get dashboard stats
    const [totalProducts, totalOrders, totalUsers, recentOrdersRaw, revenueByMethod] =
      await Promise.all([
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
        // Aggregate revenue grouped by payment method (only for completed/paid orders)
        prisma.order.groupBy({
          by: ['paymentMethod'],
          _sum: { total: true },
        }),
      ]);

    // Convert recent orders Decimal fields to plain numbers
    const recentOrders = recentOrdersRaw.map(o => ({
      ...o,
      total: Number(o.total),
      subtotal: Number(o.subtotal),
      shipping: Number(o.shipping),
      discount: o.discount ? Number(o.discount) : 0,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
      items: o.items.map(item => ({
        ...item,
        price: Number(item.price),
      })),
    }));

    // Build revenueByPaymentMethod object with numbers
    const revenueByPaymentMethod: Record<string, number> = {};
    for (const row of revenueByMethod) {
      const method = row.paymentMethod || 'unknown';
      revenueByPaymentMethod[method] = Number(row._sum.total || 0);
    }

    const revenue = Object.values(revenueByPaymentMethod).reduce((s, v) => s + v, 0);

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalUsers,
      recentOrders,
      revenue,
      revenueByPaymentMethod,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
