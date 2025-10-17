import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { calculateProductStock } from "@/lib/products";

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user in our database by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ favorites: [] });
    }

    // Get user's favorites
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            images: true,
            category: true,
            variants: { select: { stock: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedFavorites = favorites.map((fav) => ({
      id: fav.product.id,
      name: fav.product.name,
      price: Number(fav.product.price),
      oldPrice: fav.product.oldPrice ? Number(fav.product.oldPrice) : null,
      images: fav.product.images,
      stock: calculateProductStock(fav.product),
      category: fav.product.category,
      addedAt: fav.createdAt.toISOString(),
    }));

    return NextResponse.json({ favorites: formattedFavorites });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user in our database by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { product } = await request.json();

    // Check if already in favorites
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: product.id,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: "Product already in favorites" },
        { status: 400 }
      );
    }

    // Add to favorites
    await prisma.favorite.create({
      data: {
        userId: user.id,
        productId: product.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
