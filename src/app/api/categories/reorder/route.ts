import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryOrders } = body;

    if (!Array.isArray(categoryOrders)) {
      return NextResponse.json(
        { error: 'categoryOrders deve ser um array' },
        { status: 400 }
      );
    }

    // Atualizar a ordem de cada categoria em uma transação
    await prisma.$transaction(async (tx) => {
      for (const item of categoryOrders) {
        if (!item.id || typeof item.order !== 'number') {
          throw new Error('Cada item deve ter id e order válidos');
        }

        await tx.category.update({
          where: { id: item.id },
          data: { order: item.order },
        });
      }
    });

    // Revalidar as páginas que usam categorias
    revalidatePath('/');
    revalidatePath('/admin/categories');

    return NextResponse.json({
      success: true,
      message: 'Ordem das categorias atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar ordem das categorias:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
