import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST() {
  try {
    // Revalidar todas as páginas importantes
    revalidatePath("/");
    revalidatePath("/produtos");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/categories/[id]", "page");
    revalidatePath("/admin/products", "page");
    revalidatePath("/category/[slug]", "page");
    revalidatePath("/product/[id]", "page");

    console.log("🔄 Cache revalidado para todas as páginas");

    return NextResponse.json({
      success: true,
      message: "Cache limpo com sucesso - produtos atualizados",
    });
  } catch (error) {
    console.error("Erro ao limpar cache:", error);
    return NextResponse.json(
      { error: "Erro ao limpar cache" },
      { status: 500 }
    );
  }
}
