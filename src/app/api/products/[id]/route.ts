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
        },
      });

      // Atualizar imagens se fornecidas
      if (images && Array.isArray(images)) {
        // Deletar imagens existentes
        await tx.productImage.deleteMany({
          where: { productId: id },
        });

        // Criar novas imagens
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img: { url: string; order: number }) => ({
              productId: id,
              url: img.url,
              order: img.order,
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

    // Verificar se é force delete
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    // Verificar se o produto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: id },
      include: {
        orderItems: {
          include: {
            order: {
              select: {
                status: true,
              },
            },
          },
        },
        _count: {
          select: { 
            orderItems: true,
          },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Se force=true e produto já está deletado, permitir exclusão permanente
    if (force && existingProduct.deletedAt) {
      await prisma.product.delete({
        where: { id: id },
      });

      return NextResponse.json({
        success: true,
        message: 'Produto deletado permanentemente',
      });
    }

    // Verificar se existem pedidos com este produto
    if (existingProduct._count.orderItems > 0) {
      // Verificar se todos os pedidos estão com status DELIVERED
      const allDelivered = existingProduct.orderItems.every(
        (item) => item.order.status === 'DELIVERED'
      );

      if (!allDelivered) {
        // Contar pedidos pendentes
        const pendingOrders = existingProduct.orderItems.filter(
          (item) => item.order.status !== 'DELIVERED'
        );

        return NextResponse.json(
          { 
            error: 'Não é possível deletar um produto com pedidos pendentes',
            details: {
              totalOrders: existingProduct._count.orderItems,
              pendingOrders: pendingOrders.length,
              message: `Este produto possui ${pendingOrders.length} pedido(s) pendente(s). Aguarde a conclusão de todos os pedidos ou mova para produtos deletados.`
            }
          },
          { status: 400 }
        );
      }

      // Todos os pedidos estão concluídos, fazer soft delete
      await prisma.product.update({
        where: { id: id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Produto movido para produtos deletados',
        softDelete: true,
      });
    }

    // Sem pedidos, deletar permanentemente
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
