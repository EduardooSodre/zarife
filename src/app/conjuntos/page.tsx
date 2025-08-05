import CategoryProductsPage from "@/components/category-products-page";

export default function ConjuntosPage() {
  return (
    <CategoryProductsPage
      title="CONJUNTOS"
      categoryPatterns={["Conjunto", "Set", "Combinado", "Coordenado"]}
      description="Descubra nossa coleção de conjuntos elegantes e coordenados para qualquer ocasião."
      breadcrumb="Conjuntos"
    />
  );
}
