import { prisma } from '@/lib/db';
import { ProductCard } from '@/components/product/product-card';
import { Tag } from 'lucide-react';

export const revalidate = 60; // Revalidar a cada 60 segundos

async function getPromotions() {
    const products = await prisma.product.findMany({
        where: {
            isActive: true,
            isOnSale: true,
        },
        include: {
            category: true,
            images: {
                orderBy: { order: 'asc' },
                take: 1,
            },
            variants: true,
        },
        orderBy: {
            salePercentage: 'desc', // Maiores descontos primeiro
        },
    });

    // Normalizar campos para os componentes cliente
    return products.map(p => ({
        ...p,
        price: Number(p.price),
        oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
        variants: p.variants || [],
    }));
}

export default async function PromocoesPage() {
    const products = await getPromotions();

    return (
        <div className="min-h-screen bg-white pt-16 md:pt-20">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Tag className="w-10 h-10" />
                        <h1 className="text-5xl font-bold">SALDOS</h1>
                    </div>
                    <p className="text-center text-xl">
                        Aproveite os nossos melhores descontos!
                    </p>
                </div>
            </div>

            {/* Products Grid */}
            <div className="container mx-auto px-4 py-12">
                {products.length === 0 ? (
                    <div className="text-center py-20">
                        <Tag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                            Nenhum saldo no momento
                        </h2>
                        <p className="text-gray-500">
                            Fique atento! Em breve teremos novidades.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <p className="text-lg text-gray-600">
                                {products.length} {products.length === 1 ? 'produto' : 'produtos'} em saldo
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={{ ...product, variants: product.variants || [] }} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
