import CategoryProductsPage from "@/components/category-products-page";

export default function PartesDeBaixoPage() {
  return (
    <CategoryProductsPage
      title="Partes de Baixo"
      categoryPatterns={["Short", "Saia", "Calça", "Legging", "Bermuda"]}
      description="Descubra nossa coleção de shorts, saias, calças e leggings para todos os momentos."
      breadcrumb="Roupas"
    />
  );
}
