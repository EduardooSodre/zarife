import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteFromCloudinary } from "@/lib/upload";
import { checkAdminAuth } from "@/lib/auth";
import { calculateProductStock } from '@/lib/products'

type ProductImageWithPublicId = {
  id: string;
  order: number;
  productId: string;
  productVariantId: string | null;
  url: string;
  publicId?: string | null;
};

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
            order: "asc",
          },
        },
        variants: {
          include: {
            images: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Compute stock and normalize prices to numbers for public consumers
  const stock = calculateProductStock(product as unknown as { variants?: { stock: number }[] });

    const normalized = {
      ...product,
      price: Number(product.price),
      oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      variants: (product.variants || []).map(v => ({
        ...v,
        stock: v.stock
      })),
      stock,
    };

    return NextResponse.json({
      success: true,
      data: normalized,
    });
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
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
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const {
      name,
      description,
      additionalDescriptions,
      price,
      oldPrice,
      categoryId,
      isFeatured,
      isActive,
      isOnSale,
      salePercentage,
      material,
      brand,
      season,
      images,
      variants,
    } = data;

    // Calcular salePrice se estiver em promoção
    const salePrice =
      isOnSale && salePercentage
        ? Number(price) * (1 - salePercentage / 100)
        : null;

    // Verificar se o produto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
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
          ...(additionalDescriptions !== undefined && {
            additionalDescriptions,
          }),
          price,
          oldPrice,
          categoryId,
          isFeatured,
          isActive,
          isOnSale: isOnSale || false,
          salePercentage: isOnSale ? salePercentage : null,
          salePrice,
          material,
          brand,
          season,
        },
      });

      // Atualizar variantes se fornecidas
      if (variants && Array.isArray(variants)) {
        // Basic validation: do not allow empty variants list
        if (variants.length === 0) {
          throw new Error("At least one variant is required");
        }

        // Validate each variant shape before proceeding
        for (const v of variants) {
          const stockNum =
            typeof v.stock === "number" ? v.stock : parseInt(String(v.stock));
          if (
            (v.size === undefined || v.size === null) &&
            (v.color === undefined || v.color === null)
          ) {
            throw new Error(
              "Each variant must have at least a size or a color"
            );
          }
          if (isNaN(stockNum) || stockNum < 0) {
            throw new Error("Variant stock must be a non-negative number");
          }
        }

        // Deletar todas as variantes antigas (incluindo suas imagens)
        await tx.productVariant.deleteMany({
          where: { productId: id },
        });

        // Criar novas variantes (normalizando stock e nulls)
        for (const variant of variants) {
          const stockNum =
            typeof variant.stock === "number"
              ? variant.stock
              : parseInt(String(variant.stock)) || 0;
          const createdVariant = await tx.productVariant.create({
            data: {
              productId: id,
              size: variant.size ?? null,
              color: variant.color ?? null,
              stock: stockNum,
            },
          });

          // Criar imagens da variante
          if (
            variant.images &&
            Array.isArray(variant.images) &&
            variant.images.length > 0
          ) {
            await tx.productImage.createMany({
              data: variant.images.map(
                (img: { url: string; order: number; publicId?: string }) => ({
                  productId: id,
                  productVariantId: createdVariant.id,
                  url: img.url,
                  publicId: img.publicId ?? null,
                  order: img.order,
                })
              ),
            });
          }
        }
      }

      // Atualizar imagens antigas (se fornecidas e não usando variantes)
      if (
        images &&
        Array.isArray(images) &&
        (!variants || variants.length === 0)
      ) {
        // Deletar imagens existentes
        await tx.productImage.deleteMany({
          where: { productId: id },
        });

        // Criar novas imagens
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map(
              (img: { url: string; order: number; publicId?: string }) => ({
                productId: id,
                url: img.url,
                publicId: img.publicId ?? null,
                order: img.order,
              })
            ),
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
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
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
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Verificar se é force delete
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

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
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se existem pedidos com este produto
    if (existingProduct._count.orderItems > 0) {
      // Se force=true, não permitir deleção permanente de produtos com pedidos
      if (force && existingProduct.deletedAt) {
        return NextResponse.json(
          {
            error:
              "Não é possível deletar permanentemente um produto com histórico de pedidos",
            details: {
              totalOrders: existingProduct._count.orderItems,
              message:
                "Produtos com pedidos devem ser mantidos no sistema para preservar o histórico de vendas.",
            },
          },
          { status: 400 }
        );
      }

      // Verificar se todos os pedidos estão com status DELIVERED
      const allDelivered = existingProduct.orderItems.every(
        (item) => item.order.status === "DELIVERED"
      );

      if (!allDelivered) {
        // Contar pedidos pendentes
        const pendingOrders = existingProduct.orderItems.filter(
          (item) => item.order.status !== "DELIVERED"
        );

        return NextResponse.json(
          {
            error: "Não é possível deletar um produto com pedidos pendentes",
            details: {
              totalOrders: existingProduct._count.orderItems,
              pendingOrders: pendingOrders.length,
              message: `Este produto possui ${pendingOrders.length} pedido(s) pendente(s). Aguarde a conclusão de todos os pedidos ou mova para produtos deletados.`,
            },
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
        message: "Produto movido para produtos deletados",
        softDelete: true,
      });
    }

    // Sem pedidos - permitir deleção permanente
    // Se force=true e produto está deletado, deletar permanentemente (remover imagens do Cloudinary primeiro)
    if (force && existingProduct.deletedAt) {
      const images = (await prisma.productImage.findMany({
        where: { productId: id },
      })) as ProductImageWithPublicId[];
      for (const img of images) {
        try {
          if (img.publicId) await deleteFromCloudinary(img.publicId);
        } catch (err) {
          console.error(
            "Failed to delete image from Cloudinary for product",
            id,
            img.id,
            err
          );
        }
      }

      await prisma.product.delete({ where: { id: id } });

      return NextResponse.json({
        success: true,
        message: "Produto deletado permanentemente",
      });
    }

    // Se não tem pedidos e não está deletado, deletar permanentemente (remover imagens do Cloudinary primeiro)
    const images = (await prisma.productImage.findMany({
      where: { productId: id },
    })) as ProductImageWithPublicId[];
    for (const img of images) {
      try {
        if (img.publicId) await deleteFromCloudinary(img.publicId);
      } catch (err) {
        console.error(
          "Failed to delete image from Cloudinary for product",
          id,
          img.id,
          err
        );
      }
    }

    await prisma.product.delete({ where: { id: id } });

    return NextResponse.json({
      success: true,
      message: "Produto deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
