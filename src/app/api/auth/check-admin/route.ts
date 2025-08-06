import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ isAdmin: false, error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, email: true }
    });

    if (!user) {
      return NextResponse.json({ isAdmin: false, error: "Usuário não encontrado" }, { status: 404 });
    }

    const isAdmin = user.role === "ADMIN";
    
    return NextResponse.json({ 
      isAdmin,
      userRole: user.role,
      email: user.email
    });
  } catch (error) {
    console.error("Erro ao verificar status de admin:", error);
    return NextResponse.json({ isAdmin: false, error: "Erro interno" }, { status: 500 });
  }
}
