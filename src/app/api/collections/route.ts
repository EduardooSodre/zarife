import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Retornar coleções ativas para uso em forms/admin
    const collections = await (prisma as any).collection.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }).catch(() => []);

    return NextResponse.json({ success: true, data: collections });
  } catch (error) {
    console.error('Error fetching collections', error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
