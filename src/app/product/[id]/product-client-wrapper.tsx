"use client"

import React, { useState, useCallback } from 'react'
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { ProductVariants } from "@/components/product/product-variants"
import { Button } from "@/components/ui/button"
import { Heart, Share2 } from "lucide-react"

interface ProductVariant {
  id: string
  size?: string
  color?: string
  stock: number
}

interface ProductClientWrapperProps {
  product: {
    id: string
    name: string
    price: number
    images: { url: string }[]
  }
  variants: ProductVariant[]
}

export default function ProductClientWrapper({ product, variants }: ProductClientWrapperProps) {
  const [selectedVariant, setSelectedVariant] = useState<{
    size?: string
    color?: string
    stock: number
  }>({ stock: variants.length > 0 ? variants[0].stock : 0 })

  const handleVariantChange = useCallback((variant: { size?: string; color?: string; stock: number }) => {
    setSelectedVariant(variant)
  }, []) // Função estável que não muda entre renderizações

  return (
    <div className="space-y-6 pt-6">
      {/* Product Variants */}
      {variants.length > 0 && (
        <ProductVariants
          variants={variants}
          onVariantChange={handleVariantChange}
        />
      )}

      {/* Actions */}
      <div className="space-y-4">
        <AddToCartButton
          product={{
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0]?.url || '/placeholder-product.jpg',
            size: selectedVariant.size || undefined,
            color: selectedVariant.color || undefined
          }}
          disabled={selectedVariant.stock === 0}
          className="w-full bg-black text-white py-4 text-lg uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-none"
        />

        <div className="flex space-x-4">
          <Button variant="outline" className="flex-1 rounded-none">
            <Heart className="w-4 h-4 mr-2" />
            Favoritar
          </Button>
          <Button variant="outline" className="flex-1 rounded-none">
            <Share2 className="w-4 h-4 mr-2" />
            Partilhar
          </Button>
        </div>
      </div>
    </div>
  )
}
