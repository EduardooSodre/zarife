import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageTransition } from "@/components/animations/page-effects";
import { FastProductCard } from "@/components/product/fast-product-card";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;

  // Get category
  const category = await prisma.category.findUnique({
    where: { 
      slug: resolvedParams.slug,
    },
    include: {
      products: {
        where: {
          isActive: true,
        },
        include: {
          images: {
            orderBy: { order: "asc" },
            take: 1,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  // Converter Decimal para number para evitar erro de serialização
  const serializedCategory = {
    ...category,
    products: category.products.map(product => ({
      ...product,
      price: Number(product.price),
      oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
    }))
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-black transition-colors">
            Início
          </Link>
          <span>/</span>
          <span className="text-black">{serializedCategory.name}</span>
        </nav>

        {/* Back Button */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-black transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Voltar
          </Link>
        </div>

        {/* Category Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-light text-black mb-4 tracking-wider uppercase">
            {serializedCategory.name}
          </h1>
          <div className="w-24 h-px bg-black mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Descubra nossa seleção cuidadosa de produtos em {serializedCategory.name.toLowerCase()}
          </p>
        </div>

        {/* Products Grid */}
        {serializedCategory.products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-2xl font-light text-gray-900 mb-4">Nenhum produto encontrado</h3>
            <p className="text-gray-600 mb-8">
              Esta categoria ainda não possui produtos disponíveis.
            </p>
            <Link href="/" className="inline-block bg-black text-white px-8 py-3 uppercase tracking-widest hover:bg-gray-800 transition-colors">
              Ver Todas as Categorias
            </Link>
          </div>
        ) : (
          <>
            {/* Products Count */}
            <div className="mb-8">
              <p className="text-gray-600">
                {serializedCategory.products.length} {serializedCategory.products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {serializedCategory.products.map((product) => (
                <FastProductCard 
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          </>
        )}
      </div>
      </div>
    </PageTransition>
  );
}
