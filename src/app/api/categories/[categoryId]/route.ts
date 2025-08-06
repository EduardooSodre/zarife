import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await context.params;
    
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        products: {
          where: { isActive: true },
          include: {
            images: {
              orderBy: { order: 'asc' },
              take: 1,
            },
          },
        },
        _count: {
          select: { products: true }
        }
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await context.params;
    const { isAdmin } = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { name, description, image, isActive } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    // Generate new slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if another category with same name exists
    const duplicateCategory = await prisma.category.findFirst({
      where: { 
        name: name.trim(),
        id: { not: categoryId }
      },
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { error: 'Uma categoria com este nome já existe' },
        { status: 400 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        image: image?.trim() || null,
        isActive: isActive !== undefined ? isActive : existingCategory.isActive,
      },
      include: {
        _count: {
          select: { products: true }
        }
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await context.params;
    
    const { isAdmin } = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { products: true }
        }
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar uma categoria que possui produtos' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({
      success: true,
      message: 'Categoria deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
