import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    // First try to find by category slug
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          include: {
            images: {
              orderBy: { order: "asc" },
            },
            category: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (category) {
      return NextResponse.json({
        success: true,
        products: category.products,
        categoryName: category.name,
      });
    }

    // If no category found, try to handle fixed categories from header
    let products = [];
    let categoryName = "";

    switch (slug) {
      case "roupas":
      case "partes-de-cima":
      case "partes-de-baixo":
        // Get products from categories that match clothing items
        const clothingCategories = await prisma.category.findMany({
          where: {
            OR: [
              { name: { contains: "Blusa", mode: "insensitive" } },
              { name: { contains: "Camisa", mode: "insensitive" } },
              { name: { contains: "Short", mode: "insensitive" } },
              { name: { contains: "Saia", mode: "insensitive" } },
              { name: { contains: "Calça", mode: "insensitive" } },
              { name: { contains: "Top", mode: "insensitive" } },
            ]
          },
          include: {
            products: {
              where: { isActive: true },
              include: {
                images: { orderBy: { order: "asc" } },
                category: true,
              },
            },
          },
        });
        
        products = clothingCategories.flatMap(cat => cat.products);
        categoryName = slug === "roupas" ? "Roupas" : 
                     slug === "partes-de-cima" ? "Partes de Cima" : "Partes de Baixo";
        break;

      case "look-completo":
      case "vestidos":
      case "conjuntos":
        const lookCategories = await prisma.category.findMany({
          where: {
            OR: [
              { name: { contains: "Vestido", mode: "insensitive" } },
              { name: { contains: "Conjunto", mode: "insensitive" } },
              { name: { contains: "Look", mode: "insensitive" } },
            ]
          },
          include: {
            products: {
              where: { isActive: true },
              include: {
                images: { orderBy: { order: "asc" } },
                category: true,
              },
            },
          },
        });
        
        products = lookCategories.flatMap(cat => cat.products);
        categoryName = slug === "look-completo" ? "Look Completo" : 
                     slug === "vestidos" ? "Vestidos" : "Conjuntos";
        break;

      case "moda-praia":
      case "biquini":
      case "maio":
      case "saidas-de-praia":
        const beachCategories = await prisma.category.findMany({
          where: {
            OR: [
              { name: { contains: "Biquíni", mode: "insensitive" } },
              { name: { contains: "Bikini", mode: "insensitive" } },
              { name: { contains: "Maiô", mode: "insensitive" } },
              { name: { contains: "Saída", mode: "insensitive" } },
              { name: { contains: "Praia", mode: "insensitive" } },
            ]
          },
          include: {
            products: {
              where: { isActive: true },
              include: {
                images: { orderBy: { order: "asc" } },
                category: true,
              },
            },
          },
        });
        
        products = beachCategories.flatMap(cat => cat.products);
        categoryName = slug === "moda-praia" ? "Moda Praia" : 
                     slug === "biquini" ? "Biquíni" : 
                     slug === "maio" ? "Maiô" : "Saídas de Praia";
        break;

      default:
        return NextResponse.json({
          success: false,
          error: "Category not found",
        }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      products,
      categoryName,
    });

  } catch (error) {
    console.error("Error fetching category products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
