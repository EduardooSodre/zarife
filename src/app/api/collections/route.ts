/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Retornar coleções ativas para uso em forms/admin
    const collections = await (prisma as any).collection
      .findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      })
      .catch(() => []);

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

    const created = await (prisma as any).collection
      .create({
        data: {
          name: name.trim(),
          description: description || null,
          isActive: true,
        },
      })
      .catch((err: any) => {
        console.error("Error creating collection", err);
        return null;
      });

    if (!created) {
      return NextResponse.json(
        { success: false, error: "Failed to create collection" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("Error in collections POST", error);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
