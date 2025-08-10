import CategoryProductsPage from "@/components/category-products-page";

export default function LooksCompletosPage() {
  return (
    <CategoryProductsPage 
      title="Looks Completos"
      categoryPatterns={["look-completo", "conjunto", "looks"]}
      description="Coleção completa de looks para todas as ocasiões"
    />
  );
}
