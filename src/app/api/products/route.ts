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
          variants: true,
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
      variants,
      collectionId,
      promotionId,
    } = body;

    // Validações de segurança
    if (!name || !price || !categoryId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: name, price and categoryId are required",
        },
        { status: 400 }
      );
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json(
        { success: false, error: "Price must be a number greater than zero" },
        { status: 400 }
      );
    }

    // Validate variants presence and shape to avoid creating generic products
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one variant is required" },
        { status: 400 }
      );
    }
    // Validate each variant has at least size or color and a numeric non-negative stock
    for (const v of variants) {
      const stockNum =
        typeof v.stock === "number" ? v.stock : parseInt(String(v.stock));
      if (
        (v.size === undefined || v.size === null) &&
        (v.color === undefined || v.color === null)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Each variant must have at least a size or a color",
          },
          { status: 400 }
        );
      }
      if (isNaN(stockNum) || stockNum < 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Variant stock must be a non-negative number",
          },
          { status: 400 }
        );
      }
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
        ...(additionalDescriptions && { additionalDescriptions }),
        price: priceNum,
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        categoryId,
        isFeatured: Boolean(isFeatured),
        isActive: Boolean(isActive),
        isOnSale: Boolean(isOnSale),
        salePercentage: salePercentageNum,
        salePrice: salePriceNum,
        material,
        brand,
        season,
        ...(collectionId && { collections: { connect: { id: collectionId } } }),
        ...(promotionId && { promotions: { connect: { id: promotionId } } }),
      },
    });

    // Criar variantes com imagens (usando valores validados e normalizados)
    for (const variant of variants) {
      const stockNum =
        typeof variant.stock === "number"
          ? variant.stock
          : parseInt(String(variant.stock)) || 0;

      const createdVariant = await prisma.productVariant.create({
        data: {
          productId: product.id,
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
        const data: Array<{
          productId: string;
          productVariantId: string;
          url: string;
          publicId?: string | null;
          order: number;
        }> = variant.images.map(
          (image: { url: string; order: number; publicId?: string }) => ({
            productId: product.id,
            productVariantId: createdVariant.id,
            url: image.url,
            publicId: image.publicId ?? null,
            order: image.order,
          })
        );

        try {
          await prisma.productImage.createMany({ data });
        } catch (error) {
          const msg = String(error || "");
          // Fallback for environments where the DB schema/migration hasn't added publicId yet
          if (
            msg.includes("Unknown argument `publicId`") ||
            msg.includes("Unknown arg `publicId`")
          ) {
            console.warn(
              "DB does not have product_images.public_id column yet - retrying without publicId. Run prisma migrate to add it."
            );
            const dataNoPublic = data.map(
              ({
                productId,
                productVariantId,
                url,
                order,
              }: {
                productId: string;
                productVariantId: string;
                url: string;
                order: number;
              }) => ({ productId, productVariantId, url, order })
            );
            await prisma.productImage.createMany({ data: dataNoPublic });
          } else {
            throw error;
          }
        }
      }
    }

    // Buscar produto completo com relações básicas e retornar
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

    return NextResponse.json({ success: true, data: fullProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}
