import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar se o usuário já existe na base de dados
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (existingUser) {
      return NextResponse.json({ 
        message: "Usuário já existe na base de dados", 
        user: existingUser 
      });
    }

    // Criar o usuário na base de dados
    const newUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
        image: user.imageUrl || null,
      },
    });

    return NextResponse.json({ 
      message: "Usuário sincronizado com sucesso", 
      user: newUser 
    });

  } catch (error) {
    console.error("Erro ao sincronizar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao sincronizar usuário" }, 
      { status: 500 }
    );
  }
}
