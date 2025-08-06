import CategoryProductsPage from "@/components/category-products-page";

export default function PartesDecimaPage() {
  return (
    <CategoryProductsPage
      title="Partes de Cima"
      categoryPatterns={["Blusa", "Camisa", "Top", "Camiseta", "Regata"]}
      description="Encontre as melhores blusas, camisas, tops e regatas para completar seu look."
      breadcrumb="Roupas"
    />
  );
}