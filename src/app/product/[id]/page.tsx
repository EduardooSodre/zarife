import { notFound } from "next/navigation";
import type { Metadata } from 'next'
import { prisma } from "@/lib/db";
import { calculateProductStock } from "@/lib/products";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/product-card";
import { ArrowLeft } from "lucide-react";
import ProductImageGallery from "./product-image-gallery";
import ProductClientWrapper from "./product-client-wrapper";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

const SITE_URL = 'https://zarife.vercel.app'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = params.id
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { order: 'asc' }, take: 1 } }
  })

  if (!product) {
    return {
      title: 'Produto - Zarife',
      description: 'Zarife — loja de moda de luxo em Portugal. Enviamos para todo o território nacional.'
    }
  }

  const title = `${product.name} | Zarife`
  const description = product.description ? product.description.replace(/\n+/g, ' ').slice(0, 160) : 'Produto de moda de luxo disponível na Zarife.'
  const imagePath = product.images && product.images.length > 0 ? product.images[0].url : '/ZARIFE_LOGO.png'
  const imageUrl = imagePath.startsWith('http') ? imagePath : SITE_URL + (imagePath.startsWith('/') ? imagePath : `/${imagePath}`)
  const url = `${SITE_URL}/product/${id}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [
        {
          url: imageUrl,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;

  // Get product
  const product = await prisma.product.findUnique({
    where: {
      id: resolvedParams.id,
      isActive: true
    },
    include: {
      category: true,
      images: {
        orderBy: { order: "asc" },
      },
      variants: {
        include: {
          images: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: [
          { size: "asc" },
          { color: "asc" }
        ]
      }
    },
  });

  if (!product) {
    notFound();
  }

  // Calcular estoque total das variantes
  const totalStock = calculateProductStock(product);

  // Extrair descrições adicionais com type safety
  const additionalDescriptions = 'additionalDescriptions' in product && product.additionalDescriptions
    ? (product.additionalDescriptions as Array<{ title: string; content: string }>)
    : [];

  // Get related products from the same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      isActive: true,
      id: {
        not: product.id,
      },
    },
    include: {
      images: {
        orderBy: { order: "asc" },
        take: 1,
      },
      category: true,
      variants: true,
    },
    take: 4,
  });

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-0">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link href="/" className="hover:text-black transition-colors">
            Início
          </Link>
          <span>/</span>
          <Link href={`/category/${product.category.slug}`} className="hover:text-black transition-colors">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </nav>

        {/* Back Button */}
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-2">
          {/* Product Images + Descriptions (moved descriptions below images) */}
          <div className="space-y-4">
            <ProductImageGallery images={product.images} productName={product.name} />

            {/* Descriptions as Accordion (desktop visible) */}
            <div className="mt-4 hidden md:block">
              <Accordion type="single" collapsible>
                {product.description && (
                  <AccordionItem value="description">
                    <AccordionTrigger>Descrição</AccordionTrigger>
                    <AccordionContent>
                      <div className="prose prose-gray max-w-none">
                        {product.description.split('\n').map((line, idx) => (
                          <p key={idx} className="text-gray-700 leading-relaxed">
                            {line}
                          </p>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {additionalDescriptions.length > 0 && additionalDescriptions.map((desc, index) => (
                  <AccordionItem key={index} value={`additional-${index}`}>
                    <AccordionTrigger>{desc.title}</AccordionTrigger>
                    <AccordionContent>
                      {desc.content.split('\n').map((line, idx) => (
                        <p key={idx} className="text-gray-700 leading-relaxed">{line}</p>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Category Badge */}
            <div>
              <Badge asChild variant="outline" className="mb-4 cursor-pointer hover:bg-gray-50">
                <Link href={`/category/${product.category.slug}`}>
                  {product.category.name}
                </Link>
              </Badge>
            </div>

            {/* Product Name */}
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-black mb-2 tracking-wide">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-gray-600">por {product.brand}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-medium text-black">
                €{Number(product.price).toFixed(2)}
              </span>
              {product.oldPrice && Number(product.oldPrice) > Number(product.price) && (
                <span className="text-xl text-gray-500 line-through">
                  €{Number(product.oldPrice).toFixed(2)}
                </span>
              )}
            </div>




            {/* Product Details (desktop/tablet) - hide on small screens so mobile shows after actions */}
            <div className="space-y-4 hidden md:block">
              {product.material && (
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-900 w-24 text-sm md:text-base lg:text-lg">Material:</span>
                  <span className="text-gray-700 text-sm md:text-base">{product.material}</span>
                </div>
              )}
              {product.season && (
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-900 w-24 text-sm md:text-base lg:text-lg">Temporada:</span>
                  <span className="text-gray-700 text-sm md:text-base">{product.season}</span>
                </div>
              )}
            </div>

            {/* Product Variants and Actions */}
            <ProductClientWrapper
              product={{
                id: product.id,
                name: product.name,
                price: Number(product.price),
                oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
                images: product.images || [],
                stock: totalStock,
                category: product.category
              }}
              variants={
                (product.variants || []).map(v => ({
                  ...v,
                  size: v.size === null ? undefined : v.size,
                  color: v.color === null ? undefined : v.color,
                }))
              }
              description={product.description}
              additionalDescriptions={additionalDescriptions}
              material={product.material}
              season={product.season}
            />
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-28 ">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light text-black mb-4 tracking-wider">
                PRODUTOS RELACIONADOS
              </h2>
              <div className="w-24 h-px bg-black mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={{
                    id: relatedProduct.id,
                    name: relatedProduct.name,
                    price: Number(relatedProduct.price),
                    oldPrice: relatedProduct.oldPrice ? Number(relatedProduct.oldPrice) : null,
                    images: relatedProduct.images?.map(img => ({ url: img.url })) || [],
                    category: relatedProduct.category ? {
                      name: relatedProduct.category.name,
                      slug: relatedProduct.category.slug
                    } : null,
                    variants: relatedProduct.variants || [],
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
