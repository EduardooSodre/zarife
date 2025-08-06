import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await context.params;
    const { name, description, image, isActive } = await request.json();

    console.log('📝 Dados recebidos para atualizar categoria:', {
      categoryId,
      name,
      description,
      image: image ? `Imagem fornecida (${image.length} chars)` : 'Sem imagem',
      isActive
    });

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
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

    // Atualizar usando raw SQL para garantir que funciona
    await prisma.$executeRaw`
      UPDATE categories 
      SET 
        name = ${name.trim()},
        slug = ${slug},
        description = ${description?.trim() || null},
        image = ${image?.trim() || null},
        is_active = ${isActive !== undefined ? isActive : true},
        updated_at = NOW()
      WHERE id = ${categoryId}
    `;

    console.log('✅ Categoria atualizada via SQL raw');

    // Buscar a categoria atualizada
    const updatedCategory = await prisma.$queryRaw`
      SELECT id, name, slug, description, image, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
      FROM categories 
      WHERE id = ${categoryId}
    `;

    console.log('📋 Categoria após atualização:', updatedCategory);

    return NextResponse.json({
      success: true,
      data: Array.isArray(updatedCategory) ? updatedCategory[0] : updatedCategory,
    });
  } catch (error) {
    console.error('💥 Erro ao atualizar categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
