import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Retornar promoções ativas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db: any = prisma as any;
    const promotions = await db.promotion.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

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
      return NextResponse.json(
        { success: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    // create slug
    const slug = (name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db: any = prisma as any;

      // Normalize incoming numeric value for percent comparisons
      const num = Number(value);
      let normalized = num;
      if (!isNaN(num) && num > 0 && num <= 1) normalized = num * 100;

      // Try to find an existing promotion with same discountType and value to avoid duplicate slugs
      try {
        const existing = await db.promotion.findFirst({
          where: {
            discountType,
            // if value provided is numeric, compare to that numeric value
            value: !isNaN(normalized) ? normalized : undefined,
          },
        });
        if (existing) {
          return NextResponse.json({ success: true, data: existing });
        }
      } catch (findErr) {
        // ignore find errors and proceed to create
        console.warn('Error finding existing promotion', findErr);
      }

      const created = await db.promotion.create({
        data: {
          name: name.trim(),
          slug,
          isActive: true,
          discountType,
          value: value,
          startAt: startAt ? new Date(startAt) : null,
          endAt: endAt ? new Date(endAt) : null,
        },
      });

      return NextResponse.json({ success: true, data: created }, { status: 201 });
    } catch (err) {
      console.error("Error creating promotion", err);
      return NextResponse.json({ success: false, error: "Failed to create" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in promotions POST", error);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
