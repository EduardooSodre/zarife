'use client';


import React from 'react'
import { useCart } from '@/contexts/cart-context';
import { calculateProductStock, hasStock } from '@/lib/products';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ProductVariants } from '@/components/product/product-variants'

interface HomeAddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    stock?: number;
    variants?: { size?: string | null; color?: string | null; stock: number }[];
  };
}

export function HomeAddToCartButton({ product }: HomeAddToCartButtonProps) {
  const { addItem, setIsOpen } = useCart();
  // Se houver variantes, considerar o estoque delas
  const totalStock = product.variants ? calculateProductStock(product) : (product.stock ?? 0);
  const isOutOfStock = product.variants ? !hasStock(product) : (product.stock !== undefined && product.stock <= 0);

  // If there are variants we will open a sheet to let user pick
  const hasVariants = !!(product.variants && product.variants.length > 0)
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<{ size?: string; color?: string; stock: number } | null>(null)

  // When variants change, reset selected to first available
  React.useEffect(() => {
    const pv = product.variants || []
    if (pv.length === 0) return
    const first = pv.find(v => (typeof v.stock === 'number' ? v.stock : parseInt(String(v.stock) || '0')) > 0)
    if (first) setSelected({ size: first.size ?? undefined, color: first.color ?? undefined, stock: first.stock })
  }, [product.variants])

  const handleConfirmAdd = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isOutOfStock) return

    if (hasVariants) {
      if (!selected) return
      addItem({
        ...product,
        size: selected.size ?? undefined,
        color: selected.color ?? undefined,
        maxStock: selected.stock ?? totalStock
      })
      setIsOpen(true)
      setOpen(false)
      return
    }

    // Fallback for simple products without variants
    addItem({
      ...product,
      size: "Único",
      color: "Padrão",
      maxStock: totalStock,
    })
    setIsOpen(true)
  }

  // If no variants, behave as simple add button
  if (!hasVariants) {
    return (
      <button
        onClick={handleConfirmAdd}
        disabled={isOutOfStock}
        className={`w-full border text-xs py-2 md:py-3 px-2 md:px-4 font-medium tracking-wider transition-all duration-300 ${isOutOfStock
          ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-transparent border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
          }`}
      >
        <span className="md:hidden">{isOutOfStock ? 'ESGOTADO' : 'CARRINHO'}</span>
        <span className="hidden md:inline cursor-pointer">{isOutOfStock ? 'PRODUTO ESGOTADO' : 'ADICIONAR AO CARRINHO'}</span>
      </button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setOpen(true)
          }}
          disabled={isOutOfStock}
          className={`w-full border text-xs py-2 md:py-3 px-2 md:px-4 font-medium tracking-wider transition-all duration-300 ${isOutOfStock
            ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-transparent border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
            }`}
        >
          <span className="md:hidden">{isOutOfStock ? 'ESGOTADO' : 'CARRINHO'}</span>
          <span className="hidden md:inline cursor-pointer">{isOutOfStock ? 'PRODUTO ESGOTADO' : 'ADICIONAR AO CARRINHO'}</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Escolha a variação</DialogTitle>
        </DialogHeader>

        <div className="px-4">
          <ProductVariants
            variants={(product.variants || []).map((v: { size?: string | null; color?: string | null; stock: number; id?: string | number }, i) => ({ id: String(v.id ?? i), size: v.size ?? undefined, color: v.color ?? undefined, stock: v.stock }))}
            onVariantChange={(v) => setSelected(v as { size?: string; color?: string; stock: number })}
          />
        </div>

        <div className="px-4 pt-4">
          <div className="w-full flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              className="flex-1"
              onClick={handleConfirmAdd}
              disabled={!selected || (selected && selected.stock <= 0)}
            >
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
