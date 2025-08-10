'use client';

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/favorites-context";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { motion } from "framer-motion";

interface FavoriteProduct {
  id: string;
  name: string;
  price: number;
  oldPrice: number | null;
  images: { url: string }[];
  stock: number;
  category: {
    name: string;
    slug: string;
  } | null;
  addedAt: string;
}

interface FavoriteProductCardProps {
  product: FavoriteProduct;
  className?: string;
}

export function FavoriteProductCard({ product, className = "" }: FavoriteProductCardProps) {
  const { removeFromFavorites } = useFavorites();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const discountPercentage = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  const isOutOfStock = product.stock === 0;

  const handleRemoveFromFavorites = () => {
    removeFromFavorites(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 ${
        isOutOfStock ? 'opacity-60' : ''
      } ${className}`}
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
                  className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                    isOutOfStock ? 'grayscale' : ''
                  }`}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Sem imagem</span>
                </div>
              )}

              {/* Discount Badge */}
              {discountPercentage && !isOutOfStock && (
                <div className="absolute top-2 left-2 bg-black text-white text-xs font-medium px-2 py-1">
                  -{discountPercentage}%
                </div>
              )}

              {/* Stock Badge */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="bg-white text-black text-sm font-medium px-3 py-1">
                    ESGOTADO
                  </div>
                </div>
              )}
            </div>
          </Link>
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
              <h3 className={`text-base md:text-lg font-medium hover:text-black transition-colors duration-200 line-clamp-2 ${
                isOutOfStock ? 'text-gray-500' : 'text-gray-900'
              }`}>
                {product.name}
              </h3>
            </Link>

            {/* Added Date */}
            <p className="text-xs text-gray-400">
              Adicionado em {new Date(product.addedAt).toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Price and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`text-lg font-medium ${
                  isOutOfStock ? 'text-gray-500' : 'text-black'
                }`}>
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && !isOutOfStock && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>
              
              {/* Stock Info */}
              <span className={`text-xs ${
                product.stock > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {product.stock > 0
                  ? `${product.stock} em estoque`
                  : 'Fora de estoque'
                }
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Remove from favorites */}
              <button
                onClick={handleRemoveFromFavorites}
                className="p-2 text-red-500 hover:bg-red-50 transition-colors duration-200"
                title="Remover dos favoritos"
              >
                <Heart className="h-4 w-4 fill-current" />
              </button>

              {/* Add to Cart */}
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.images[0]?.url || '',
                }}
                disabled={isOutOfStock}
                className="min-w-[120px]"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
