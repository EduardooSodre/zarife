import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdminAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await context.params;

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        products: {
          where: { isActive: true },
          include: {
            images: {
              orderBy: { order: "asc" },
              take: 1,
            },
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await context.params;
    const { isAdmin } = await checkAdminAuth();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { name, description, image, isActive, parentId } =
      await request.json();

    console.log("📝 Dados recebidos para atualizar categoria:", {
      categoryId,
      name,
      description,
      image: image ? "Imagem fornecida" : "Sem imagem",
      imageLength: image?.length,
      isActive,
      parentId,
    });

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    // Generate new slug
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Check if another category with same name exists
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name: name.trim(),
        id: { not: categoryId },
      },
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { error: "Uma categoria com este nome já existe" },
        { status: 400 }
      );
    }

    console.log("💾 Executando SQL para atualizar categoria:", {
      categoryId,
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      image: image?.trim() || null,
      isActive: isActive !== undefined ? isActive : true,
      parentId: parentId || null,
    });

    // Atualizar usando raw SQL para garantir que funciona
    await prisma.$executeRaw`
      UPDATE categories 
      SET 
        name = ${name.trim()},
        slug = ${slug},
        description = ${description?.trim() || null},
        image = ${image?.trim() || null},
        is_active = ${isActive !== undefined ? isActive : true},
        parent_id = ${parentId || null},
        updated_at = NOW()
      WHERE id = ${categoryId}
    `;

    console.log("✅ SQL executado com sucesso");

    // Buscar a categoria atualizada usando raw SQL também
    const updatedCategory = (await prisma.$queryRaw`
      SELECT id, name, slug, description, image, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
      FROM categories 
      WHERE id = ${categoryId}
    `) as Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      image: string | null;
      isActive: boolean;
      createdAt: Date | null;
      updatedAt: Date | null;
    }>;

    console.log("📋 Categoria após atualização:", updatedCategory[0]);

    // Revalidar cache das páginas relacionadas
    revalidatePath("/");
    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${categoryId}`);
    revalidatePath(`/category/${updatedCategory[0].slug}`);

    console.log("🔄 Cache revalidado para páginas de categorias");

    return NextResponse.json({
      success: true,
      data: updatedCategory[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await context.params;

    const { isAdmin } = await checkAdminAuth();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { error: "Não é possível deletar uma categoria que possui produtos" },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({
      success: true,
      message: "Categoria deletada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar categoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
