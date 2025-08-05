import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAdminAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const product = await prisma.product.findUnique({
      where: {
        id: id,
      },
      include: {
        category: true,
        images: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const { isAdmin } = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const {
      name,
      description,
      price,
      oldPrice,
      stock,
      categoryId,
      isFeatured,
      isActive,
      material,
      brand,
      season,
      gender,
      images,
      variants,
    } = data;

    // Verificar se o produto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar produto em uma transação
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Atualizar dados do produto
      const product = await tx.product.update({
        where: { id: id },
        data: {
          name,
          description,
          price,
          oldPrice,
          stock,
          categoryId,
          isFeatured,
          isActive,
          material,
          brand,
          season,
          gender,
          variants: variants || [],
        },
      });

      // Atualizar imagens se fornecidas
      if (images && Array.isArray(images)) {
        // Remover imagens existentes
        await tx.productImage.deleteMany({
          where: { productId: id },
        });

        // Adicionar novas imagens
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((image: { url: string; order: number }) => ({
              productId: id,
              url: image.url,
              order: image.order,
            })),
          });
        }
      }

      return product;
    });

    return NextResponse.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const { isAdmin } = await checkAdminAuth();
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Verificar se o produto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Deletar produto (imagens serão deletadas em cascata)
    await prisma.product.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Produto deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
