import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST() {
  try {
    // Revalidar todas as páginas relacionadas a categorias
    revalidatePath("/");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/categories/[id]", "page");
    revalidatePath("/category/[slug]", "page");

    console.log("🔄 Cache revalidado para páginas de categorias");

    return NextResponse.json({
      success: true,
      message: "Cache limpo com sucesso",
    });
  } catch (error) {
    console.error("Erro ao limpar cache:", error);
    return NextResponse.json(
      { error: "Erro ao limpar cache" },
      { status: 500 }
    );
  }
}
