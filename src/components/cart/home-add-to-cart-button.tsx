'use client';

import { useCart } from '@/contexts/cart-context';

interface HomeAddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

export function HomeAddToCartButton({ product }: HomeAddToCartButtonProps) {
  const { addItem, setIsOpen } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      ...product,
      size: "Único",
      color: "Padrão"
    });
    
    setIsOpen(true);
  };

  return (
    <button
      onClick={handleAddToCart}
      className="w-full bg-transparent border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 text-xs py-2 md:py-3 px-2 md:px-4 font-medium tracking-wider"
    >
      <span className="md:hidden">CARRINHO</span>
      <span className="hidden md:inline">ADICIONAR AO CARRINHO</span>
    </button>
  );
}
