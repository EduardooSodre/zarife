'use client';

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { motion } from "framer-motion";

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
        gender: string | null;
        images: { url: string }[];
        stock: number;
        category: {
            name: string;
            slug: string;
        } | null;
    };
    className?: string;
}

export function ProductListCard({ product, className = "" }: ProductListCardProps) {
    const [isWishlisted, setIsWishlisted] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    const discountPercentage = product.oldPrice
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg ${className}`}
        >
            <div className="flex gap-6 p-6">
                {/* Product Image */}
                <div className="relative flex-shrink-0 w-48 h-48">
                    <Link href={`/product/${product.id}`}>
                        <div className="relative w-full h-full overflow-hidden bg-gray-50 ">
                            {product.images && product.images.length > 0 ? (
                                <Image
                                    src={product.images[0].url}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400 text-sm">Sem imagem</span>
                                </div>
                            )}

                            {/* Discount Badge */}
                            {discountPercentage && (
                                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                    -{discountPercentage}%
                                </div>
                            )}

                            {/* Stock Badge */}
                            {product.stock === 0 && (
                                <div className="absolute top-3 right-3 bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded">
                                    ESGOTADO
                                </div>
                            )}
                        </div>
                    </Link>

                    {/* Wishlist Button */}
                    <button
                        onClick={() => setIsWishlisted(!isWishlisted)}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 z-10"
                    >
                        <Heart
                            className={`h-4 w-4 transition-colors duration-200 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
                                }`}
                        />
                    </button>
                </div>

                {/* Product Info */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                {/* Category */}
                                {product.category && (
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                                        {product.category.name}
                                    </span>
                                )}

                                {/* Product Name */}
                                <Link href={`/product/${product.id}`}>
                                    <h3 className="text-lg font-medium text-gray-900 hover:text-black transition-colors duration-200 mt-1">
                                        {product.name}
                                    </h3>
                                </Link>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                            {product.brand && (
                                <span className="flex items-center gap-1">
                                    <strong>Marca:</strong> {product.brand}
                                </span>
                            )}
                            {product.material && (
                                <span className="flex items-center gap-1">
                                    <strong>Material:</strong> {product.material}
                                </span>
                            )}
                            {product.season && (
                                <span className="flex items-center gap-1">
                                    <strong>Estação:</strong> {product.season}
                                </span>
                            )}
                            {product.gender && (
                                <span className="flex items-center gap-1">
                                    <strong>Gênero:</strong> {product.gender}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className={`text-lg font-semibold ${product.oldPrice ? 'text-red-600' : 'text-gray-900'
                                    }`}>
                                    {formatPrice(product.price)}
                                </span>
                                {product.oldPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                        {formatPrice(product.oldPrice)}
                                    </span>
                                )}
                            </div>

                            {/* Stock Info */}
                            <span className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {product.stock > 0
                                    ? `${product.stock} em estoque`
                                    : 'Fora de estoque'
                                }
                            </span>
                        </div>

                        {/* Add to Cart */}
                        <div className="flex items-center gap-2">
                            <AddToCartButton
                                product={{
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.images[0]?.url || '',
                                }}
                                disabled={product.stock === 0}
                                className="min-w-[120px] rounded-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
