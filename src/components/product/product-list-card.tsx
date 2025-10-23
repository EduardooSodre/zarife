'use client';

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { useFavorites } from "@/contexts/favorites-context";
import { motion } from "framer-motion";
import { calculateProductStock } from "@/lib/products";

interface ProductListCardProps {
    product: {
        id: string;
        name: string;
        description: string | null;
        price: number;
        oldPrice: number | null;
        brand: string | null;
        material: string | null;
        season: string | null;
        images: { url: string }[];
        variants?: { stock: number }[];
        category: {
            name: string;
            slug: string;
        } | null;
    };
    className?: string;
}

export function ProductListCard({ product, className = "" }: ProductListCardProps) {
    const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
    const isWishlisted = isFavorite(product.id);
    const totalStock = calculateProductStock(product);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    const discountPercentage = product.oldPrice
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
        : null;

    const handleToggleFavorite = () => {
        if (isWishlisted) {
            removeFromFavorites(product.id);
        } else {
            addToFavorites({
                id: product.id,
                name: product.name,
                price: product.price,
                oldPrice: product.oldPrice,
                images: product.images,
                stock: totalStock,
                category: product.category,
                addedAt: new Date().toISOString(),
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 ${className} relative overflow-hidden`}
        >
            <div className="flex flex-col md:flex-row gap-4 p-4 items-stretch">
                {/* Image column */}
                <div className="flex-shrink-0 w-full md:w-40 lg:w-48">
                    <Link href={`/product/${product.id}`}>
                        <div className="relative w-full aspect-[4/5] overflow-hidden rounded-md bg-gray-50">
                            {product.images && product.images.length > 0 ? (
                                <Image
                                    src={product.images[0].url}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400 text-sm">Sem imagem</span>
                                </div>
                            )}

                            {discountPercentage && (
                                <div className="absolute top-2 left-2 bg-black text-white text-xs font-medium px-2 py-1 rounded">
                                    -{discountPercentage}%
                                </div>
                            )}
                        </div>
                    </Link>
                </div>

                {/* Content column */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                        <div className="flex items-start justify-between">
                            <div className="space-y-1 pr-4">
                                {product.category && (
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                                        {product.category.name}
                                    </span>
                                )}

                                <Link href={`/product/${product.id}`}>
                                    <h3 className="text-lg font-semibold text-gray-900 hover:text-black transition-colors duration-200 line-clamp-2">
                                        {product.name}
                                    </h3>
                                </Link>

                                {product.description && (
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">{product.description}</p>
                                )}
                            </div>

                            {/* Wishlist button in card corner */}
                            <div className="flex-shrink-0 ml-2">
                                <button
                                    onClick={handleToggleFavorite}
                                    className="p-2 rounded-full bg-white border shadow-sm hover:shadow-md transition-shadow text-gray-600"
                                    title={isWishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                    aria-label={isWishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                >
                                    <Heart className={`h-5 w-5 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-4">
                        <div>
                            <div className="flex items-baseline gap-3">
                                <span className="text-xl font-bold text-gray-900">
                                    {formatPrice(product.price)}
                                </span>
                                {product.oldPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                        {formatPrice(product.oldPrice)}
                                    </span>
                                )}
                            </div>

                            <div className={`text-sm mt-1 ${totalStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {totalStock > 0 ? `${totalStock} em estoque` : 'Fora de estoque'}
                            </div>
                        </div>

                        <div className="flex-shrink-0">
                            <AddToCartButton
                                product={{
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.images[0]?.url || '',
                                    variants: product.variants || [],
                                }}
                                disabled={totalStock === 0}
                                className="min-w-[140px]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
