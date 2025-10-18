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
    variants?: { stock: number }[]
  }
  className?: string
  disabled?: boolean
}

export function AddToCartButton({ product, className = "", disabled = false }: AddToCartButtonProps) {
  const { addItem, setIsOpen } = useCart()

  const handleAddToCart = () => {
    if (disabled) return
    // If variants are provided but no specific size/color, pick first in-stock variant
    if ((product.variants && product.variants.length > 0) && !product.size && !product.color) {
      const firstAvailable = product.variants.find(v => (typeof v.stock === 'number' ? v.stock : parseInt(String(v.stock) || '0')) > 0)
      if (firstAvailable) {
        type PV = { size?: string | null; color?: string | null; stock: number }
        const fv = firstAvailable as unknown as PV
        addItem({ ...product, size: fv.size ?? undefined, color: fv.color ?? undefined, maxStock: fv.stock })
        setIsOpen(true)
        return
      }
    }

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
