"use client"

import { useCart } from '@/contexts/cart-context'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export function CartSheet() {
  const router = useRouter()
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeItem,
    totalItems,
    totalPrice
  } = useCart()

  // Shipping: fixed €8 for Portugal (server enforces Portugal-only)
  const shipping = 8.0
  const total = totalPrice + shipping

  const handleViewFullCart = () => {
    setIsOpen(false)
    // Navigation will happen via Link
  }

  const handleCheckout = () => {
    setIsOpen(false)
    router.push('/checkout')
  }

  const handleContinueShopping = () => {
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="w-full sm:w-96 bg-white p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-gray-200">
          <SheetTitle className="flex items-center text-lg font-medium tracking-wide uppercase">
            <ShoppingBag className="w-5 h-5 mr-3" />
            Carrinho ({totalItems})
          </SheetTitle>
          <SheetDescription className="sr-only">
            Carrinho de compras
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-100  flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Carrinho Vazio
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Adicione produtos ao seu carrinho para continuar
                </p>
                <Button
                  onClick={handleContinueShopping}
                  className="bg-primary hover:bg-primary/90 text-white uppercase tracking-widest text-sm"
                >
                  Continuar Compras
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-200  overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-500">IMG</span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 mb-1 truncate">
                        {item.name}
                      </h4>

                      {(item.size || item.color) && (
                        <div className="text-xs text-gray-600 mb-2">
                          {item.size && <span>Tamanho: {item.size}</span>}
                          {item.size && item.color && <span className="mx-1">•</span>}
                          {item.color && <span>Cor: {item.color}</span>}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary">
                          €{item.price.toFixed(2)}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                            className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 text-gray-600"
                            aria-label="Diminuir quantidade"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <span className="w-8 text-center text-sm font-medium text-gray-900">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                            className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 text-gray-600"
                            aria-label="Aumentar quantidade"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id, item.size, item.color)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remover produto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary & Actions */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 space-y-4">
              {/* Price Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">€{totalPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envio</span>
                  <span className="font-medium">€{shipping.toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-base font-medium">
                    <span>Total</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3 uppercase tracking-widest text-sm"
                >
                  Finalizar Compra
                </Button>

                <Link href="/cart" onClick={handleViewFullCart} className="block">
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-white py-2 uppercase tracking-widest text-sm"
                  >
                    Ver Carrinho Completo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  onClick={handleContinueShopping}
                  className="w-full text-gray-600 hover:text-primary py-2 uppercase tracking-wide text-xs"
                >
                  Continuar Compras
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
