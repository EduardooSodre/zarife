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
  }
  className?: string
  disabled?: boolean
}

export function AddToCartButton({ product, className = "", disabled = false }: AddToCartButtonProps) {
  const { addItem, setIsOpen } = useCart()

  const handleAddToCart = () => {
    if (disabled) return
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
