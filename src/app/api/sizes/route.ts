import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdminAuth } from "@/lib/auth";

// GET - Listar todos os tamanhos
export async function GET() {
  try {
    const sizes = await prisma.size.findMany({
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: sizes,
    });
  } catch (error) {
    console.error("Erro ao buscar tamanhos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo tamanho
export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await checkAdminAuth();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { name } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const normalizedName = name.trim().toUpperCase();

    // Verificar se já existe
    const existing = await prisma.size.findUnique({
      where: { name: normalizedName },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Este tamanho já existe" },
        { status: 400 }
      );
    }

    // Obter o maior order existente
    const maxOrderSize = await prisma.size.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const size = await prisma.size.create({
      data: {
        name: normalizedName,
        order: (maxOrderSize?.order || 0) + 1,
      },
    });

    return NextResponse.json({
      success: true,
      data: size,
    });
  } catch (error) {
    console.error("Erro ao criar tamanho:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir tamanho
export async function DELETE(request: NextRequest) {
  try {
    const { isAdmin } = await checkAdminAuth();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.size.delete({
      where: { name },
    });

    return NextResponse.json({
      success: true,
      message: "Tamanho deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar tamanho:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
