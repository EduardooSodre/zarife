'use client'

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { HomeAddToCartButton } from "@/components/cart/home-add-to-cart-button";
import { useFavorites } from "@/contexts/favorites-context";
import { Decimal } from "@prisma/client/runtime/library";

interface FastProductCardProps {
  product: {
    id: string;
    name: string;
    price: number | Decimal;
    oldPrice?: number | Decimal | null;
    images?: { url: string }[] | null;
    category?: { name: string; slug: string } | null;
    stock: number;
  };
  className?: string;
}

export function FastProductCard({
  product,
  className = ""
}: FastProductCardProps) {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const isWishlisted = isFavorite(product.id);

  const handleToggleFavorite = () => {
    if (isWishlisted) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
        images: product.images || [],
        stock: product.stock,
        category: product.category || null,
        addedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className={`bg-white border border-gray-200 group hover:shadow-lg transition-all duration-300 relative ${className}`}>
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square bg-gray-200 overflow-hidden cursor-pointer">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              width={300}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
              <span className="text-sm text-center px-2">{product.name}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Wishlist Button */}
      <button
        onClick={handleToggleFavorite}
        aria-label={isWishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        className="absolute top-2 right-2 p-1 transition-all duration-200 z-10 cursor-pointer group"
      >
        <Heart
          className={`h-5 w-5 transition-all duration-200 drop-shadow-sm ${isWishlisted
              ? 'fill-red-500 text-red-500 scale-110'
              : 'text-white hover:text-red-500 hover:fill-red-500 hover:scale-110 group-hover:drop-shadow-md'
            }`}
        />
      </button>
      <div className="p-2 md:p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm md:text-base font-medium text-gray-900 mb-2 hover:text-black transition-colors cursor-pointer h-10 md:h-12 overflow-hidden">
            {product.name}
          </h3>
        </Link>
        {product.category && (
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
            {product.category.name}
          </p>
        )}
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <span className="text-sm md:text-lg font-medium text-black">€{Number(product.price).toFixed(2)}</span>
          {product.oldPrice && Number(product.oldPrice) > Number(product.price) && (
            <span className="text-xs md:text-sm text-gray-500 line-through">€{Number(product.oldPrice).toFixed(2)}</span>
          )}
        </div>
        <HomeAddToCartButton
          product={{
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.images?.[0]?.url || '/placeholder-product.jpg',
            stock: product.stock,
          }}
        />
      </div>
    </div>
  );
}
