import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Retornar promoções ativas
    const promotions = await (prisma as any).promotion.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []);

    return NextResponse.json({ success: true, data: promotions });
  } catch (error) {
    console.error('Error fetching promotions', error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
