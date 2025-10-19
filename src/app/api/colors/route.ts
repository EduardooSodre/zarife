import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const variants = await prisma.productVariant.findMany({
      where: { color: { not: null } },
      select: { color: true },
    });

    const colorsSet = new Set<string>();
    variants.forEach((v) => {
      if (v.color && v.color.trim()) colorsSet.add(v.color.trim());
    });

    const colors = Array.from(colorsSet).sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ data: colors });
  } catch (error) {
    console.error("Erro ao buscar cores:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
