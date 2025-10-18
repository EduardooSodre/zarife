"use client"

import React, { useState, useCallback } from 'react'
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { ProductVariants } from "@/components/product/product-variants"
import { useFavorites } from "@/contexts/favorites-context"
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
    oldPrice?: number | null
    images: { url: string }[]
    stock: number
    category: {
      name: string
      slug: string
    } | null
  }
  variants: ProductVariant[]
}

export default function ProductClientWrapper({ product, variants }: ProductClientWrapperProps) {
  // Normalizar variantes e escolher uma variação inicial coerente com a UI de seleção
  const normalizedVariants = variants.map(v => ({
    id: v.id,
    size: v.size ? String(v.size).trim() : undefined,
    color: v.color ? String(v.color).trim() : undefined,
    stock: typeof v.stock === 'number' ? v.stock : parseInt(String(v.stock) || '0')
  }))

  const chooseInitial = () => {
    // Preferir combinação size+color em stock, depois size, depois color, depois qualquer com stock
    const both = normalizedVariants.find(v => v.stock > 0 && v.size && v.color)
    if (both) return { size: both.size, color: both.color, stock: both.stock }
    const onlySize = normalizedVariants.find(v => v.stock > 0 && v.size)
    if (onlySize) return { size: onlySize.size, color: onlySize.color, stock: onlySize.stock }
    const onlyColor = normalizedVariants.find(v => v.stock > 0 && v.color)
    if (onlyColor) return { size: onlyColor.size, color: onlyColor.color, stock: onlyColor.stock }
    const any = normalizedVariants.find(v => v.stock > 0)
    if (any) return { size: any.size, color: any.color, stock: any.stock }
    // Fallbacks
    if (normalizedVariants.length > 0) return { size: normalizedVariants[0].size, color: normalizedVariants[0].color, stock: normalizedVariants[0].stock }
    return { stock: product.stock }
  }

  const [selectedVariant, setSelectedVariant] = useState<{
    size?: string
    color?: string
    stock: number
  }>(chooseInitial())

  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const isWishlisted = isFavorite(product.id)

  const handleVariantChange = useCallback((variant: { size?: string; color?: string; stock: number }) => {
    try { console.debug('[ProductClientWrapper] handleVariantChange', variant) } catch {}
    setSelectedVariant(variant)
  }, []) // Função estável que não muda entre renderizações

  // Se a lista de variantes mudar (por exemplo, novo produto carregado), recalcular seleção inicial
  React.useEffect(() => {
    const initial = chooseInitial()
    try { console.debug('[ProductClientWrapper] variants changed, resetting selection to', initial) } catch {}
    setSelectedVariant(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variants.map(v => v.id).join(',' )])

  const handleToggleFavorite = () => {
    if (isWishlisted) {
      removeFromFavorites(product.id)
    } else {
      addToFavorites({
        id: product.id,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice || null,
        images: product.images,
        stock: product.stock,
        category: product.category,
        addedAt: new Date().toISOString(),
      })
    }
  }

  // Debug visual: mostrar variantes recebidas quando ?debugVariants=1 na URL
  let debugInfo: React.ReactNode = null
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('debugVariants') === '1') {
        debugInfo = (
          <pre className="text-xs bg-gray-100 p-2 rounded border text-left overflow-auto max-h-40">
            {JSON.stringify({ variants, selectedVariant }, null, 2)}
          </pre>
        )
      }
    }
  } catch {
    // ignore
  }

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
        {debugInfo}
        {selectedVariant.stock <= 0 && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm text-center">
            Este produto está esgotado no momento.
          </div>
        )}
        <AddToCartButton
          product={{
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0]?.url || '/placeholder-product.jpg',
            size: selectedVariant.size || undefined,
            color: selectedVariant.color || undefined,
            maxStock: selectedVariant.stock || product.stock
          }}
          disabled={selectedVariant.stock === 0}
          className="w-full bg-black text-white py-4 text-lg uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-none"
        />

        <div className="flex space-x-4">
          <Button
            variant="outline"
            className="flex-1 rounded-none"
            onClick={handleToggleFavorite}
          >
            <Heart className={`w-4 h-4 mr-2 transition-colors duration-200 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`} />
            {isWishlisted ? 'Remover' : 'Favoritar'}
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
