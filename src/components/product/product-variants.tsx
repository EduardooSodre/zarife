"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ProductVariant {
  id: string
  size?: string
  color?: string
  stock: number
}

interface ProductVariantsProps {
  variants: ProductVariant[]
  onVariantChange: (variant: { size?: string; color?: string; stock: number }) => void
  className?: string
}


export function ProductVariants({ variants, onVariantChange, className }: ProductVariantsProps) {
  // Extrair tamanhos e cores únicos
  const sizes = useMemo(() => [...new Set(variants.map(v => v.size).filter(Boolean))] as string[], [variants])
  const colors = useMemo(() => [...new Set(variants.map(v => v.color).filter(Boolean))] as string[], [variants])

  // Função para encontrar a primeira combinação com estoque
  const findFirstAvailable = useCallback(() => {
    for (const size of sizes) {
      for (const color of colors) {
        const v = variants.find(v => v.size === size && v.color === color && v.stock > 0)
        if (v) return { size, color }
      }
    }
    // fallback: só tamanho
    for (const size of sizes) {
      const v = variants.find(v => v.size === size && v.stock > 0)
      if (v) return { size, color: '' }
    }
    // fallback: só cor
    for (const color of colors) {
      const v = variants.find(v => v.color === color && v.stock > 0)
      if (v) return { size: '', color }
    }
    // fallback: primeira variação
    if (variants.length > 0) {
      return { size: variants[0].size || '', color: variants[0].color || '' }
    }
    return { size: '', color: '' }
  }, [sizes, colors, variants])

  // Estado controlado
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')

  // Inicializar seleção na primeira combinação disponível
  useEffect(() => {
    const { size, color } = findFirstAvailable()
    setSelectedSize(size)
    setSelectedColor(color)
  }, [findFirstAvailable])

  // Atualizar seleção de cor ao trocar tamanho, se não houver estoque para a cor atual
  useEffect(() => {
    if (!selectedSize) return
    const hasStock = variants.some(v => v.size === selectedSize && (!selectedColor || v.color === selectedColor) && v.stock > 0)
    if (!hasStock) {
      // Seleciona a primeira cor disponível para o tamanho
      const available = colors.find(color => variants.some(v => v.size === selectedSize && v.color === color && v.stock > 0))
      if (available) setSelectedColor(available)
    }
  }, [selectedSize, selectedColor, colors, variants])

  // Atualizar seleção de tamanho ao trocar cor, se não houver estoque para o tamanho atual
  useEffect(() => {
    if (!selectedColor) return
    const hasStock = variants.some(v => v.color === selectedColor && (!selectedSize || v.size === selectedSize) && v.stock > 0)
    if (!hasStock) {
      // Seleciona o primeiro tamanho disponível para a cor
      const available = sizes.find(size => variants.some(v => v.size === size && v.color === selectedColor && v.stock > 0))
      if (available) setSelectedSize(available)
    }
  }, [selectedColor, selectedSize, sizes, variants])

  // Função para pegar a variante atual
  const getCurrentVariant = useCallback(() => {
    if (selectedSize && selectedColor) {
      return variants.find(v => v.size === selectedSize && v.color === selectedColor)
    } else if (selectedSize) {
      return variants.find(v => v.size === selectedSize)
    } else if (selectedColor) {
      return variants.find(v => v.color === selectedColor)
    }
    return variants[0] || null
  }, [selectedSize, selectedColor, variants])

  // Atualizar parent
  useEffect(() => {
    const currentVariant = getCurrentVariant()
    if (currentVariant) {
      onVariantChange({
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        stock: currentVariant.stock
      })
    }
  }, [selectedSize, selectedColor, getCurrentVariant, onVariantChange])

  // Checar se botão deve estar habilitado
  const isVariantAvailable = (type: 'size' | 'color', value: string) => {
    if (type === 'size') {
      if (selectedColor) {
        return variants.some(v => v.size === value && v.color === selectedColor && v.stock > 0)
      }
      return variants.some(v => v.size === value && v.stock > 0)
    } else {
      if (selectedSize) {
        return variants.some(v => v.color === value && v.size === selectedSize && v.stock > 0)
      }
      return variants.some(v => v.color === value && v.stock > 0)
    }
  }

  if (variants.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Size Selection */}
      {sizes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Tamanho {selectedSize && <span className="text-gray-600">- {selectedSize}</span>}
          </h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isAvailable = isVariantAvailable('size', size)
              const isSelected = selectedSize === size

              return (
                <Button
                  key={size}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSize(size)}
                  disabled={!isAvailable}
                  className={cn(
                    "min-w-[2.5rem] h-10 rounded-none",
                    isSelected && "bg-black text-white hover:bg-gray-800",
                    !isAvailable && "opacity-50 cursor-not-allowed line-through"
                  )}
                >
                  {size}
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {colors.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Cor {selectedColor && <span className="text-gray-600">- {selectedColor}</span>}
          </h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const isAvailable = isVariantAvailable('color', color)
              const isSelected = selectedColor === color

              return (
                <Button
                  key={color}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedColor(color)}
                  disabled={!isAvailable}
                  className={cn(
                    "min-w-[4rem] h-10 capitalize rounded-none",
                    isSelected && "bg-black text-white hover:bg-gray-800",
                    !isAvailable && "opacity-50 cursor-not-allowed line-through"
                  )}
                >
                  {color}
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Stock Info */}
      {(() => {
        const currentVariant = getCurrentVariant()
        if (currentVariant) {
          return (
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${currentVariant.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm font-medium ${currentVariant.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {currentVariant.stock > 0
                  ? `${currentVariant.stock} em stock`
                  : 'Esgotado'
                }
              </span>
            </div>
          )
        }
        return null
      })()}
    </div>
  )
}
