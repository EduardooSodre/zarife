"use client"

import Link from 'next/link'
import { Minus, Plus, Trash2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import Image from 'next/image'

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart()

  // Shipping: fixed €8 for Portugal (server enforces Portugal-only)
  const shipping = 8.0
  const total = totalPrice + shipping

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-light text-primary mb-4 tracking-wider uppercase">Carrinho Vazio</h1>
            <p className="text-gray-600 mb-8">Não tem produtos no seu carrinho</p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-white uppercase tracking-widest">Continuar Compras</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/produtos" className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
            <Button variant="ghost" className="inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continuar Compras
            </Button>
          </Link>
          <h1 className="max-md:text-center text-3xl md:text-4xl font-light text-black tracking-wider">Carrinho de Compras</h1>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="bg-white border border-gray-200 rounded-md p-2 sm:p-4 flex flex-row items-center gap-3 w-full shadow-sm"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={96} height={96} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-500">IMG</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900 mb-0.5 truncate">{item.name}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      {item.size && <p>Tamanho: {item.size}</p>}
                      {item.color && <p>Cor: {item.color}</p>}
                    </div>
                    <p className="text-base md:text-lg font-medium text-primary mt-1">€{item.price.toFixed(2)}</p>
                  </div>

                  {/* Actions */}
                  <div className="ml-auto flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                      className="inline-flex items-center justify-center rounded-lg bg-gray-900 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary w-8 h-8 sm:w-8 sm:h-8"
                      aria-label={`Diminuir quantidade de ${item.name}`}
                      title={`Diminuir quantidade de ${item.name}`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="text-center px-2">
                      <span className="text-sm font-medium text-gray-900">{item.quantity}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                      className="inline-flex items-center justify-center rounded-lg bg-gray-900 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary w-8 h-8 sm:w-8 sm:h-8"
                      aria-label={`Aumentar quantidade de ${item.name}`}
                      title={`Aumentar quantidade de ${item.name}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id, item.size, item.color)}
                      className="ml-2 inline-flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-300"
                      aria-label={`Remover ${item.name} do carrinho`}
                      title={`Remover ${item.name} do carrinho`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 ">
            <div className="bg-white border border-gray-200 p-8 sticky top-8 rounded-sm shadow-sm">
              <h2 className="text-xl font-medium text-gray-900 mb-6 uppercase tracking-wide">Resumo do Pedido</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>€{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envio</span>
                  <span>€{shipping.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-medium text-gray-900">
                    <span>Total</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 uppercase tracking-widest">Finalizar Compra</Button>
              </Link>

              <div className="mt-6 text-center">
                <Link href="/" className="text-sm text-gray-600 hover:text-primary uppercase tracking-wide">Continuar Compras</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

