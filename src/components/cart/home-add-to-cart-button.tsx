'use client';


import { useCart } from '@/contexts/cart-context';
import { calculateProductStock, hasStock } from '@/lib/products';

interface HomeAddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    stock?: number;
    variants?: { stock: number }[];
  };
}


export function HomeAddToCartButton({ product }: HomeAddToCartButtonProps) {
  const { addItem, setIsOpen } = useCart();
  // Se houver variantes, considerar o estoque delas
  const totalStock = product.variants ? calculateProductStock(product) : (product.stock ?? 0);
  const isOutOfStock = product.variants ? !hasStock(product) : (product.stock !== undefined && product.stock <= 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    // If variants exist, pick the first in-stock variant to create a variant-specific cart item
    if (product.variants && product.variants.length > 0) {
      const firstAvailable = product.variants.find(
        (v) => (typeof v.stock === 'number' ? v.stock : parseInt(String(v.stock) || '0')) > 0
      );
      if (firstAvailable) {
        type PV = { size?: string | null; color?: string | null; stock: number };
        const fv = firstAvailable as unknown as PV;
        addItem({
          ...product,
          size: fv.size ?? undefined,
          color: fv.color ?? undefined,
          maxStock: fv.stock ?? totalStock,
        });
        setIsOpen(true);
        return;
      }
    }

    // Fallback for simple products without variants
    addItem({
      ...product,
      size: "Único",
      color: "Padrão",
      maxStock: totalStock,
    });

    setIsOpen(true);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isOutOfStock}
      className={`w-full border text-xs py-2 md:py-3 px-2 md:px-4 font-medium tracking-wider transition-all duration-300 ${isOutOfStock
        ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
        : 'bg-transparent border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
        }`}
    >
      <span className="md:hidden">{isOutOfStock ? 'ESGOTADO' : 'CARRINHO'}</span>
      <span className="hidden md:inline cursor-pointer">{isOutOfStock ? 'PRODUTO ESGOTADO' : 'ADICIONAR AO CARRINHO'}</span>
    </button>
  );
}
