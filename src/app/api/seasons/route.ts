import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdminAuth } from "@/lib/auth";

// GET - Listar todas as estações
export async function GET() {
  try {
    const seasons = await prisma.season.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: seasons,
    });
  } catch (error) {
    console.error("Erro ao buscar estações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar nova estação
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

    // Verificar se já existe
    const existing = await prisma.season.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Esta estação já existe" },
        { status: 400 }
      );
    }

    const season = await prisma.season.create({
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      data: season,
    });
  } catch (error) {
    console.error("Erro ao criar estação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir estação
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
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.season.delete({
      where: { name },
    });

    return NextResponse.json({
      success: true,
      message: "Estação deletada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar estação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
