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

    // Get products with optimized queries
    const products = await prisma.product.findMany({
        include: {
            category: {
                select: {
                    name: true,
                    slug: true,
                },
            },
            images: {
                take: 1, // Apenas a primeira imagem
                orderBy: {
                    order: 'asc',
                },
            },
            _count: {
                select: {
                    images: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
