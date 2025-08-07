"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
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
    setItems(currentItems => {
      // Criar um ID único para o item incluindo variações
      const itemKey = `${newItem.id}-${newItem.size || 'no-size'}-${newItem.color || 'no-color'}`
      const existingItemIndex = currentItems.findIndex(item => {
        const existingKey = `${item.id}-${item.size || 'no-size'}-${item.color || 'no-color'}`
        return existingKey === itemKey
      })

      if (existingItemIndex !== -1) {
        return currentItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...currentItems, { ...newItem, quantity: 1 }]
    })
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

    setItems(currentItems =>
      currentItems.map(item => {
        if (size !== undefined || color !== undefined) {
          // Atualizar item específico com variações
          const itemKey = `${id}-${size || 'no-size'}-${color || 'no-color'}`
          const existingKey = `${item.id}-${item.size || 'no-size'}-${item.color || 'no-color'}`
          return existingKey === itemKey ? { ...item, quantity } : item
        } else {
          // Atualizar por ID apenas (compatibilidade)
          return item.id === id ? { ...item, quantity } : item
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
