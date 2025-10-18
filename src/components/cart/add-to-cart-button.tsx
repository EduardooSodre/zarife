"use client"

import { useCart } from '@/contexts/cart-context'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    image: string
    size?: string
    color?: string
    maxStock?: number
    variants?: { size?: string | null; color?: string | null; stock: number }[]
  }
  className?: string
  disabled?: boolean
}

export function AddToCartButton({ product, className = "", disabled = false }: AddToCartButtonProps) {
  const { addItem, setIsOpen } = useCart()

  const handleAddToCart = () => {
    if (disabled) return
    // If a size/color is explicitly provided, try to find the matching variant and use its stock
    if (product.variants && product.variants.length > 0) {
  const asNum = (s: number | string | undefined) => (typeof s === 'number' ? s : parseInt(String(s || '0')))

      // If both provided, prefer exact match
      if (product.size || product.color) {
        const match = product.variants.find(v => {
          const sameSize = product.size ? String(v.size).trim() === String(product.size).trim() : true
          const sameColor = product.color ? String(v.color).trim() === String(product.color).trim() : true
          return sameSize && sameColor
        })
        if (match) {
          addItem({ ...product, size: product.size, color: product.color, maxStock: asNum(match.stock) })
          setIsOpen(true)
          return
        }
      }

      // Otherwise, if no explicit selection, pick first in-stock variant
      if (!product.size && !product.color) {
        const firstAvailable = product.variants.find(v => asNum(v.stock) > 0)
        if (firstAvailable) {
          type PV = { size?: string | null; color?: string | null; stock: number }
          const fv = firstAvailable as unknown as PV
          addItem({ ...product, size: fv.size ?? undefined, color: fv.color ?? undefined, maxStock: fv.stock })
          setIsOpen(true)
          return
        }
      }
    }

    // Fallback: add product as-is (may include size/color/maxStock)
    addItem(product)
    setIsOpen(true)
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled}
      className={`bg-primary hover:bg-primary/90 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <ShoppingCart className="w-4 h-4 mr-2 cursor-pointer" />
      {disabled ? 'Indisponível' : 'Adicionar ao Carrinho'}
    </Button>
  )
}
