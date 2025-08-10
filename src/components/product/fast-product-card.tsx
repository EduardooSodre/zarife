'use client'

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useState } from "react";
import { HomeAddToCartButton } from "@/components/cart/home-add-to-cart-button";
import { Decimal } from "@prisma/client/runtime/library";

interface FastProductCardProps {
  product: {
    id: string;
    name: string;
    price: number | Decimal;
    oldPrice?: number | Decimal | null;
    images?: { url: string }[] | null;
    category?: { name: string; slug: string } | null;
  };
  className?: string;
}

export function FastProductCard({ 
  product, 
  className = "" 
}: FastProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

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
        onClick={() => setIsWishlisted(!isWishlisted)}
        className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white transition-all duration-200 z-10"
      >
        <Heart
          className={`h-4 w-4 transition-colors duration-200 ${
            isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
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
          }}
        />
      </div>
    </div>
  );
}
