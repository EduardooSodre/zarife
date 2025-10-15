"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
  maxStock?: number // Adicionar informação de estoque máximo
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string, size?: string, color?: string) => void
  updateQuantity: (id: string, quantity: number, size?: string, color?: string) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('zarife-cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('zarife-cart', JSON.stringify(items))
  }, [items])

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    // Criar um ID único para o item incluindo variações
    const itemKey = `${newItem.id}-${newItem.size || 'no-size'}-${newItem.color || 'no-color'}`
    const existingItemIndex = items.findIndex(item => {
      const existingKey = `${item.id}-${item.size || 'no-size'}-${item.color || 'no-color'}`
      return existingKey === itemKey
    })

    if (existingItemIndex !== -1) {
      const existingItem = items[existingItemIndex]
      const newQuantity = existingItem.quantity + 1

      // Verificar se há estoque suficiente
      if (existingItem.maxStock && newQuantity > existingItem.maxStock) {
        toast({
          variant: "destructive",
          title: "Estoque insuficiente",
          description: `Desculpe, temos apenas ${existingItem.maxStock} unidade(s) disponível(eis) para ${existingItem.name}${existingItem.size ? ` (Tamanho: ${existingItem.size})` : ''}${existingItem.color ? ` (Cor: ${existingItem.color})` : ''}`,
        })
        return
      }

      setItems(currentItems =>
        currentItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: newQuantity }
            : item
        )
      )
      return
    }

    // Verificar estoque ao adicionar novo item
    if (newItem.maxStock && newItem.maxStock < 1) {
      toast({
        variant: "destructive",
        title: "Produto esgotado",
        description: "Desculpe, este produto está fora de estoque.",
      })
      return
    }

    setItems(currentItems => [...currentItems, { ...newItem, quantity: 1 }])
  }

  const removeItem = (id: string, size?: string, color?: string) => {
    setItems(currentItems => {
      if (size !== undefined || color !== undefined) {
        // Remove item específico com variações
        const itemKey = `${id}-${size || 'no-size'}-${color || 'no-color'}`
        return currentItems.filter(item => {
          const existingKey = `${item.id}-${item.size || 'no-size'}-${item.color || 'no-color'}`
          return existingKey !== itemKey
        })
      } else {
        // Remove todos os itens com o mesmo ID (compatibilidade)
        return currentItems.filter(item => item.id !== id)
      }
    })
  }

  const updateQuantity = (id: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeItem(id, size, color)
      return
    }

    // Encontrar o item atual para validar estoque
    const itemKey = `${id}-${size || 'no-size'}-${color || 'no-color'}`
    const currentItem = items.find(item => {
      if (size !== undefined || color !== undefined) {
        const existingKey = `${item.id}-${item.size || 'no-size'}-${item.color || 'no-color'}`
        return existingKey === itemKey
      }
      return item.id === id
    })

    if (currentItem) {
      // Verificar se a nova quantidade excede o estoque
      if (currentItem.maxStock && quantity > currentItem.maxStock) {
        toast({
          variant: "destructive",
          title: "Estoque insuficiente",
          description: `Desculpe, temos apenas ${currentItem.maxStock} unidade(s) disponível(eis) para ${currentItem.name}${currentItem.size ? ` (Tamanho: ${currentItem.size})` : ''}${currentItem.color ? ` (Cor: ${currentItem.color})` : ''}`,
        })
        return
      }
    }

    setItems(currentItems =>
      currentItems.map(item => {
        if (size !== undefined || color !== undefined) {
          // Atualizar item específico com variações
          const itemKey = `${id}-${size || 'no-size'}-${color || 'no-color'}`
          const existingKey = `${item.id}-${item.size || 'no-size'}-${item.color || 'no-color'}`

          if (existingKey === itemKey) {
            return { ...item, quantity }
          }
          return item
        } else {
          // Atualizar por ID apenas (compatibilidade)
          if (item.id === id) {
            return { ...item, quantity }
          }
          return item
        }
      })
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <CartContext.Provider value={{
      items,
      isOpen,
      setIsOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
