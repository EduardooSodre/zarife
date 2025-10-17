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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 ${className}`}
        >
            <div className="flex flex-col sm:flex-row gap-4 p-4">
                {/* Product Image */}
                <div className="relative flex-shrink-0 w-full sm:w-32 md:w-40 lg:w-48">
                    <Link href={`/product/${product.id}`}>
                        <div className="relative w-full aspect-square sm:aspect-[4/5] overflow-hidden bg-gray-50">
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

                            {/* Discount Badge */}
                            {discountPercentage && (
                                <div className="absolute top-2 left-2 bg-black text-white text-xs font-medium px-2 py-1">
                                    -{discountPercentage}%
                                </div>
                            )}

                            {/* Stock Badge */}
                            {totalStock === 0 && (
                                <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs font-medium px-2 py-1">
                                    ESGOTADO
                                </div>
                            )}
                        </div>
                    </Link>

                    {/* Wishlist Button */}
                    <button
                        onClick={handleToggleFavorite}
                        className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1 transition-all duration-200 z-10 cursor-pointer group"
                    >
                        <Heart
                            className={`h-5 w-5 transition-all duration-200 drop-shadow-sm ${isWishlisted
                                    ? 'fill-red-500 text-red-500 scale-110'
                                    : 'text-white hover:text-red-500 hover:fill-red-500 hover:scale-110 group-hover:drop-shadow-md'
                                }`}
                        />
                    </button>
                </div>

                {/* Product Info */}
                <div className="flex-1 flex flex-col justify-between min-h-0">
                    <div className="space-y-2">
                        {/* Category */}
                        {product.category && (
                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                                {product.category.name}
                            </span>
                        )}

                        {/* Product Name */}
                        <Link href={`/product/${product.id}`}>
                            <h3 className="text-base md:text-lg font-medium text-gray-900 hover:text-black transition-colors duration-200 line-clamp-2">
                                {product.name}
                            </h3>
                        </Link>

                        {/* Description - Hidden on mobile */}
                        {product.description && (
                            <p className="hidden sm:block text-sm text-gray-600 line-clamp-2">
                                {product.description}
                            </p>
                        )}
                    </div>

                    {/* Price and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-medium text-black">
                                    {formatPrice(product.price)}
                                </span>
                                {product.oldPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                        {formatPrice(product.oldPrice)}
                                    </span>
                                )}
                            </div>

                            {/* Stock Info */}
                            <span className={`text-xs ${totalStock > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {totalStock > 0
                                    ? `${totalStock} em estoque`
                                    : 'Fora de estoque'
                                }
                            </span>
                        </div>

                        {/* Add to Cart */}
                        <div className="flex-shrink-0">
                            <AddToCartButton
                                product={{
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.images[0]?.url || '',
                                }}
                                disabled={totalStock === 0}
                                className="w-full sm:w-auto min-w-[120px]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
