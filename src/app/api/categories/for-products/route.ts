import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      include: {
        parent: {
          include: {
            parent: true
          }
        },
        children: {
          include: {
            children: true,
            _count: {
              select: { products: true }
            }
          }
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' },
    });

    // Separar categorias por nível
    const categoriesByLevel = {
      level1: categories.filter(cat => !cat.parent),
      level2: categories.filter(cat => cat.parent && !cat.parent.parent),
      level3: categories.filter(cat => cat.parent?.parent),
    };

    return NextResponse.json({
      data: categories,
      all: categories,
      byLevel: categoriesByLevel
    });
  } catch (error) {
    console.error('Erro ao buscar categorias para produtos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
