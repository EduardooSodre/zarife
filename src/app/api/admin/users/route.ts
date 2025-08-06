import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Listar todos os usuários com seus papéis
    const users = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ users, currentUserId: userId });
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { targetUserId, role } = await request.json();

    // Verificar se o usuário atual é admin ou se não há nenhum admin ainda
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" }
    });

    // Se não há admins, qualquer usuário pode criar o primeiro admin
    // Caso contrário, só admins podem alterar papéis
    if (adminCount > 0 && (!currentUser || currentUser.role !== "ADMIN")) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Atualizar o papel do usuário
    const updatedUser = await prisma.user.update({
      where: { clerkId: targetUserId },
      data: { role },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Erro ao atualizar papel do usuário:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
