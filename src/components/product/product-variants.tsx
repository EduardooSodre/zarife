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
  // Calcular valores iniciais apenas uma vez
  const initialSizes = useMemo(() =>
    [...new Set(variants.map(v => v.size).filter(Boolean))] as string[],
    [variants]
  )

  const initialColors = useMemo(() =>
    [...new Set(variants.map(v => v.color).filter(Boolean))] as string[],
    [variants]
  )

  const [selectedSize, setSelectedSize] = useState<string>(() => initialSizes[0] || '')
  const [selectedColor, setSelectedColor] = useState<string>(() => initialColors[0] || '')

  // Extract unique sizes and colors from variants usando useMemo
  const sizes = useMemo(() =>
    [...new Set(variants.map(v => v.size).filter(Boolean))] as string[],
    [variants]
  )

  const colors = useMemo(() =>
    [...new Set(variants.map(v => v.color).filter(Boolean))] as string[],
    [variants]
  )

  // Get current variant stock
  const getCurrentVariant = useCallback(() => {
    if (selectedSize && selectedColor) {
      return variants.find(v => v.size === selectedSize && v.color === selectedColor)
    } else if (selectedSize) {
      return variants.find(v => v.size === selectedSize && !v.color)
    } else if (selectedColor) {
      return variants.find(v => v.color === selectedColor && !v.size)
    }
    return variants[0] || null
  }, [selectedSize, selectedColor, variants])

  // Update parent component when selection changes
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
