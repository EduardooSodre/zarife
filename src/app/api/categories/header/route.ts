import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        // For header, we'll just return categories that contain specific keywords
        OR: [
          { name: { contains: 'roupa', mode: 'insensitive' } },
          { name: { contains: 'look', mode: 'insensitive' } },
          { name: { contains: 'moda', mode: 'insensitive' } },
          { name: { contains: 'vestido', mode: 'insensitive' } },
          { name: { contains: 'conjunto', mode: 'insensitive' } },
        ]
      },
      orderBy: { name: 'asc' },
      take: 5, // Limit to 5 categories for header
      include: {
        _count: {
          select: { products: true }
        }
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Erro ao buscar categorias do header:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
