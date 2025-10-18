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
  // Normalizar variantes (trim, null/undefined -> undefined)
  const normalizedVariants = useMemo(() => {
    return variants.map(v => ({
      id: v.id,
      size: v.size ? String(v.size).trim() : undefined,
      color: v.color ? String(v.color).trim() : undefined,
      stock: typeof v.stock === 'number' ? v.stock : parseInt(String(v.stock) || '0')
    }))
  }, [variants])

  // Extrair tamanhos e cores únicos a partir das variantes normalizadas
  const sizes = useMemo(() => [...new Set(normalizedVariants.map(v => v.size).filter(Boolean))] as string[], [normalizedVariants])
  const colors = useMemo(() => [...new Set(normalizedVariants.map(v => v.color).filter(Boolean))] as string[], [normalizedVariants])

  // Função para encontrar a primeira combinação com estoque
  const findFirstAvailable = useCallback(() => {
    for (const size of sizes) {
      for (const color of colors) {
        const v = normalizedVariants.find(v => v.size === size && v.color === color && v.stock > 0)
        if (v) return { size, color }
      }
    }
    // fallback: só tamanho
    for (const size of sizes) {
      const v = normalizedVariants.find(v => v.size === size && v.stock > 0)
      if (v) return { size, color: undefined }
    }
    // fallback: só cor
    for (const color of colors) {
      const v = normalizedVariants.find(v => v.color === color && v.stock > 0)
      if (v) return { size: undefined, color }
    }
    // fallback: primeira variação
    if (normalizedVariants.length > 0) {
      return { size: normalizedVariants[0].size || undefined, color: normalizedVariants[0].color || undefined }
    }
    return { size: undefined, color: undefined }
  }, [sizes, colors, normalizedVariants])

  // Estado controlado: inicialize a seleção com a primeira combinação disponível
  const initial = findFirstAvailable()
  const [selectedSize, setSelectedSize] = useState<string | undefined>(initial.size)
  const [selectedColor, setSelectedColor] = useState<string | undefined>(initial.color)

  // Se as variantes mudarem (conteúdo), recalcule a seleção inicial de forma controlada
  useEffect(() => {
    const { size, color } = findFirstAvailable()
    try { console.debug('[ProductVariants] variants changed, reset selection if needed', { size, color }) } catch {}
    if (selectedSize !== size) setSelectedSize(size)
    if (selectedColor !== color) setSelectedColor(color)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedVariants.map(v => v.id).join(','), sizes.join(','), colors.join(',')])

  // NOTE: We deliberately avoid cross-updating selectedSize/selectedColor in effects
  // because that can create toggling loops. Instead, clicks will update both
  // dimensions atomically to a coherent in-stock combination when needed.

  // Função para pegar a variante atual
  const getCurrentVariant = useCallback(() => {
    if (selectedSize && selectedColor) {
      return normalizedVariants.find(v => v.size === selectedSize && v.color === selectedColor)
    } else if (selectedSize) {
      return normalizedVariants.find(v => v.size === selectedSize)
    } else if (selectedColor) {
      return normalizedVariants.find(v => v.color === selectedColor)
    }
    return normalizedVariants[0] || null
  }, [selectedSize, selectedColor, normalizedVariants])

  // Atualizar parent
  // Report variant change to parent but avoid calling onVariantChange repeatedly if nothing changed
  const lastReportedRef = React.useRef<{ size?: string; color?: string; stock?: number } | null>(null)
  useEffect(() => {
    const currentVariant = getCurrentVariant()
    if (!currentVariant) return

    const payload = {
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      stock: currentVariant.stock
    }

    const last = lastReportedRef.current
    const changed = !last || last.size !== payload.size || last.color !== payload.color || last.stock !== payload.stock
    if (changed) {
      lastReportedRef.current = payload
      try {
        onVariantChange(payload)
      } catch (e) {
        // swallow to avoid breaking UI if parent throws
        try { console.error('[ProductVariants] onVariantChange threw', e) } catch {}
      }
    }
  }, [selectedSize, selectedColor, getCurrentVariant, onVariantChange])

  // Checar se botão deve estar habilitado
  const isVariantAvailable = (type: 'size' | 'color', value: string) => {
    // Enable a size/color button if there exists any variant with that size/color and stock > 0.
    // Clicking will then update the other dimension to a matching value if needed.
    if (type === 'size') {
      return normalizedVariants.some(v => v.size === value && v.stock > 0)
    }
    return normalizedVariants.some(v => v.color === value && v.stock > 0)
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
                  onClick={() => {
                    try { console.debug('[ProductVariants] size click', { size, isAvailable, selectedColor }) } catch {}
                    if (!isAvailable) return
                    // If current selectedColor doesn't have stock for this size, pick a color that does
                    const colorHasStock = selectedColor && normalizedVariants.some(v => v.size === size && v.color === selectedColor && v.stock > 0)
                    if (colorHasStock) {
                      setSelectedSize(size)
                    } else {
                      const availableColor = colors.find(c => normalizedVariants.some(v => v.size === size && v.color === c && v.stock > 0))
                      setSelectedSize(size)
                      setSelectedColor(availableColor)
                    }
                  }}
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
                  onClick={() => {
                    try { console.debug('[ProductVariants] color click', { color, isAvailable, selectedSize }) } catch {}
                    if (!isAvailable) return
                    const sizeHasStock = selectedSize && normalizedVariants.some(v => v.color === color && v.size === selectedSize && v.stock > 0)
                    if (sizeHasStock) {
                      setSelectedColor(color)
                    } else {
                      const availableSize = sizes.find(s => normalizedVariants.some(v => v.color === color && v.size === s && v.stock > 0))
                      setSelectedColor(color)
                      setSelectedSize(availableSize)
                    }
                  }}
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
