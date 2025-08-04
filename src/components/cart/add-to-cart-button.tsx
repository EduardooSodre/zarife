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
  }
  className?: string
}

export function AddToCartButton({ product, className = "" }: AddToCartButtonProps) {
  const { addItem, setIsOpen } = useCart()

  const handleAddToCart = () => {
    addItem(product)
    setIsOpen(true)
  }

  return (
    <Button 
      onClick={handleAddToCart}
      className={`bg-primary hover:bg-primary/90 text-white transition-all ${className}`}
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      Adicionar ao Carrinho
    </Button>
  )
}
