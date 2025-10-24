import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Retornar promoções ativas
    const promotions = await (prisma as any).promotion
      .findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      })
      .catch(() => []);

    return NextResponse.json({ success: true, data: promotions });
  } catch (error) {
    console.error("Error fetching promotions", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, discountType, value, startAt, endAt } = body;
    if (!name || !discountType || value === undefined || value === null) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    // create slug
    const slug = (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const created = await (prisma as any).promotion.create({
      data: {
        name: name.trim(),
        slug,
        isActive: true,
        discountType,
        value: value,
        startAt: startAt ? new Date(startAt) : null,
        endAt: endAt ? new Date(endAt) : null,
      },
    }).catch((err: any) => {
      console.error('Error creating promotion', err);
      return null;
    });

    if (!created) return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Error in promotions POST', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
