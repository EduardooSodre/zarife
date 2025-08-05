import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
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
  { params }: { params: { id: string } }
) {
  try {
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
      where: { id: params.id },
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
        where: { id: params.id },
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
        // Deletar imagens existentes
        await tx.productImage.deleteMany({
          where: { productId: params.id },
        });

        // Criar novas imagens
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img: { url: string; order: number }) => ({
              productId: params.id,
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
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o produto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Deletar produto e suas imagens (cascade)
    await prisma.product.delete({
      where: { id: params.id },
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
