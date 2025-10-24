import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Retornar coleções ativas para uso em forms/admin
    // Use a local any-typed reference if the generated client doesn't expose the model in some environments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db: any = prisma as any;
    const collections = await db.collection.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: collections });
  } catch (error) {
    console.error("Error fetching collections", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db: any = prisma as any;
      const created = await db.collection.create({
        data: {
          name: name.trim(),
          description: description || null,
          isActive: true,
        },
      });

      return NextResponse.json({ success: true, data: created }, { status: 201 });
    } catch (err) {
      console.error("Error creating collection", err);
      return NextResponse.json(
        { success: false, error: "Failed to create collection" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in collections POST", error);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
