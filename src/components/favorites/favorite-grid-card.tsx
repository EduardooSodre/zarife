'use client';

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/contexts/favorites-context";
import { HomeAddToCartButton } from "@/components/cart/home-add-to-cart-button";

interface FavoriteProduct {
  id: string;
  name: string;
  price: number;
  oldPrice: number | null;
  images: { url: string }[];
  stock: number;
  variants?: {
    size?: string | null;
    color?: string | null;
    stock: number;
  }[];
  category: {
    name: string;
    slug: string;
  } | null;
  addedAt: string;
}

interface FavoriteGridCardProps {
  product: FavoriteProduct;
  className?: string;
}

export function FavoriteGridCard({ product, className = "" }: FavoriteGridCardProps) {
  const { removeFromFavorites } = useFavorites();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const discountPercentage = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  // Only treat product as out of stock when it has variants (real SKU-level stock).
  // Some products without variants are considered always available in the catalogue.
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const isOutOfStock = hasVariants ? product.stock === 0 : false;

  const handleRemoveFromFavorites = () => {
    removeFromFavorites(product.id);
  };

  return (
    <div className={`bg-white border border-gray-200 group hover:shadow-lg transition-all duration-300 relative ${isOutOfStock ? 'opacity-60' : ''} ${className}`}>
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square bg-gray-200 overflow-hidden cursor-pointer">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              width={300}
              height={300}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'grayscale' : ''
                }`}
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
              <span className="text-sm text-center px-2">{product.name}</span>
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

      {/* Remove from Favorites Button */}
      <button
        onClick={handleRemoveFromFavorites}
        className="absolute top-2 right-2 p-1 transition-all duration-200 z-10 cursor-pointer group"
        title="Remover dos favoritos"
      >
        <Heart className="h-5 w-5 fill-red-500 text-red-500 hover:scale-110 transition-all duration-200 drop-shadow-sm" />
      </button>

      <div className="p-3 md:p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className={`text-sm md:text-base font-medium mb-2 hover:text-black transition-colors cursor-pointer h-10 md:h-12 overflow-hidden ${isOutOfStock ? 'text-gray-500' : 'text-gray-900'
            }`}>
            {product.name}
          </h3>
        </Link>

        {product.category && (
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
            {product.category.name}
          </p>
        )}

        <div className="flex items-center justify-between mb-2 md:mb-3">
          <span className={`text-base md:text-lg font-semibold ${isOutOfStock ? 'text-gray-500' : 'text-black'
            }`}>
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && !isOutOfStock && (
            <span className="text-xs md:text-sm text-gray-500 line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        <HomeAddToCartButton
          product={{
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0]?.url || '/placeholder-product.jpg',
            stock: product.stock,
            variants: product.variants || [],
          }}
        />
      </div>
    </div>
  );
}
