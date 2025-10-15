'use client';

import { useCart } from '@/contexts/cart-context';

interface HomeAddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    stock?: number;
  };
}

export function HomeAddToCartButton({ product }: HomeAddToCartButtonProps) {
  const { addItem, setIsOpen } = useCart();
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addItem({
      ...product,
      size: "Único",
      color: "Padrão",
      maxStock: product.stock || 0
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
