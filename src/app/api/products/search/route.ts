import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parâmetros de filtro
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const brand = searchParams.get('brand') || '';
    const material = searchParams.get('material') || '';
    const season = searchParams.get('season') || '';
    const gender = searchParams.get('gender') || '';
    const inStock = searchParams.get('inStock') === 'true';
    const onSale = searchParams.get('onSale') === 'true';
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '16');

    // Construir o where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    // Filtro por busca de texto
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { material: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Filtro por categoria
    if (category) {
      where.category = {
        slug: category,
      };
    }

    // Filtro por preço
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Filtros por campos específicos
    if (brand) where.brand = { contains: brand, mode: 'insensitive' };
    if (material) where.material = { contains: material, mode: 'insensitive' };
    if (season) where.season = season;
    if (gender) where.gender = gender;

    // Filtro por estoque
    if (inStock) {
      where.stock = { gt: 0 };
    }

    // Filtro por saldo
    if (onSale) {
      where.oldPrice = { not: null };
    }

    // Configurar ordenação
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sortBy) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'popular':
        orderBy = { isFeatured: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Buscar produtos e contagem total
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: {
            take: 1,
            orderBy: { order: 'asc' },
          },
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
          variants: {
            select: {
              size: true,
              color: true,
              stock: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
