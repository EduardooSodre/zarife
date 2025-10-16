import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdminAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const isFeatured = searchParams.get("featured") === "true";

    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(category && { category: { slug: category } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
      ...(isFeatured && { isFeatured: true }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: {
            orderBy: { order: "asc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await checkAdminAuth();

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      oldPrice,
      stock,
      categoryId,
      isFeatured,
      isActive,
      isOnSale,
      salePercentage,
      material,
      brand,
      season,
      gender,
      variants,
    } = body;

    // Validações de segurança
    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const priceNum = parseFloat(price);
    if (priceNum <= 0) {
      return NextResponse.json(
        { success: false, error: "Price must be greater than zero" },
        { status: 400 }
      );
    }

    // Validar porcentagem de desconto
    let salePercentageNum = null;
    let salePriceNum = null;

    if (isOnSale) {
      if (!salePercentage || salePercentage < 1 || salePercentage > 99) {
        return NextResponse.json(
          { success: false, error: "Sale percentage must be between 1 and 99" },
          { status: 400 }
        );
      }
      salePercentageNum = parseInt(salePercentage);
      // Calcular preço com desconto no backend (SEGURANÇA)
      salePriceNum = priceNum * (1 - salePercentageNum / 100);
      salePriceNum = Math.round(salePriceNum * 100) / 100; // Arredondar para 2 casas
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: priceNum,
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        stock: parseInt(stock) || 0,
        categoryId,
        isFeatured: Boolean(isFeatured),
        isActive: Boolean(isActive),
        isOnSale: Boolean(isOnSale),
        salePercentage: salePercentageNum,
        salePrice: salePriceNum,
        material,
        brand,
        season,
        gender,
      },
    });

    // Criar variantes com imagens
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        const createdVariant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
          },
        });

        // Criar imagens da variante
        if (variant.images && Array.isArray(variant.images)) {
          await prisma.productImage.createMany({
            data: variant.images.map((image: { url: string; order: number }) => ({
              productId: product.id,
              productVariantId: createdVariant.id,
              url: image.url,
              order: image.order,
            })),
          });
        }
      }
    }

    // Buscar produto completo com todas as relações
    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        images: {
          orderBy: { order: "asc" },
        },
        variants: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: fullProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}
