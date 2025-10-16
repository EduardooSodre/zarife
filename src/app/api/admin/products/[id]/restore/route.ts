import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdminAuth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { isAdmin } = await checkAdminAuth();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Restaurar produto (remover deletedAt e reativar)
    await prisma.product.update({
      where: { id: id },
      data: {
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Produto restaurado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao restaurar produto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
