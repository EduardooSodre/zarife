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

    // Get deleted products
    const products = await prisma.product.findMany({
      where: {
        deletedAt: {
          not: null,
        },
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        images: {
          take: 1,
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            images: true,
            orderItems: true,
          },
        },
      },
      orderBy: {
        deletedAt: "desc",
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("[DELETED_PRODUCTS_GET]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
