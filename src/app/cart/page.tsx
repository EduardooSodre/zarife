"use client"

import Link from 'next/link'
import { Minus, Plus, Trash2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import Image from 'next/image'

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart()

  const shipping = totalPrice > 50 ? 0 : 9.99
  const total = totalPrice + shipping

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white" style={{ paddingTop: '100px' }}>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-light text-primary mb-4 tracking-wider uppercase">
              Carrinho Vazio
            </h1>
            <p className="text-gray-600 mb-8">
              Não tem produtos no seu carrinho
            </p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-white uppercase tracking-widest">
                Continuar Compras
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: '100px' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm uppercase tracking-widest">Continuar Compras</span>
          </Link>
          <h1 className="text-4xl font-light text-primary mb-4 tracking-wider uppercase">
            Carrinho de Compras
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 p-8">
              <div className="space-y-8">
                {items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex items-center space-x-6 pb-8 border-b border-gray-200 last:border-b-0">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-500">IMG</span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {item.name}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        {item.size && <p>Tamanho: {item.size}</p>}
                        {item.color && <p>Cor: {item.color}</p>}
                      </div>
                      <p className="text-lg font-medium text-primary mt-2">
                        €{item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                        className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-gray-900 font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                        className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id, item.size, item.color)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 p-8 sticky top-8">
              <h2 className="text-xl font-medium text-gray-900 mb-6 uppercase tracking-wide">
                Resumo do Pedido
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>€{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envio</span>
                  <span>{shipping === 0 ? 'Grátis' : `€${shipping.toFixed(2)}`}</span>
                </div>
                {shipping === 0 && (
                  <p className="text-sm text-green-600">
                    ✓ Envio grátis em compras acima de €50
                  </p>
                )}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-medium text-gray-900">
                    <span>Total</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 uppercase tracking-widest">
                  Finalizar Compra
                </Button>
              </Link>

              <div className="mt-6 text-center">
                <Link href="/" className="text-sm text-gray-600 hover:text-primary uppercase tracking-wide">
                  Continuar Compras
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
