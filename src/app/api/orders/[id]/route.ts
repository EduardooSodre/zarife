import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { order: "asc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });
    if (!order) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedido" },
      { status: 500 }
    );
  }
}
