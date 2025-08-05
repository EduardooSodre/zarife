import CategoryProductsPage from "@/components/category-products-page";

export default function VestidosPage() {
  return (
    <CategoryProductsPage
      title="VESTIDOS"
      categoryPatterns={["Vestido", "Dress"]}
      description="Encontre o vestido perfeito para qualquer ocasião especial."
      breadcrumb="Vestidos"
    />
  );
}
