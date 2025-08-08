import Link from "next/link";
import Image from "next/image";
import { HomeAddToCartButton } from "@/components/cart/home-add-to-cart-button";
import { MotionCard } from "@/components/animations/motion-wrapper";
import { Decimal } from "@prisma/client/runtime/library";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number | Decimal;
    oldPrice?: number | Decimal | null;
    images?: { url: string }[] | null;
    category?: { name: string; slug: string } | null;
  };
  index?: number;
  delay?: number;
  className?: string;
}

export function ProductCard({ 
  product, 
  index = 0, 
  delay, 
  className = "" 
}: ProductCardProps) {
  // Delay muito menor para aparecer mais rápido
  const cardDelay = delay !== undefined ? delay : Math.min(index * 0.02, 0.3);

  return (
    <MotionCard 
      key={product.id} 
      delay={cardDelay} 
      className={`bg-white border border-gray-200 group hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square bg-gray-200 overflow-hidden cursor-pointer">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              width={300}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
              <span className="text-sm text-center px-2">{product.name}</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-2 md:p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm md:text-base font-medium text-gray-900 mb-2 hover:text-black transition-colors cursor-pointer h-10 md:h-12 overflow-hidden">
            {product.name}
          </h3>
        </Link>
        {product.category && (
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
            {product.category.name}
          </p>
        )}
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <span className="text-sm md:text-lg font-medium text-black">€{Number(product.price).toFixed(2)}</span>
          {product.oldPrice && Number(product.oldPrice) > Number(product.price) && (
            <span className="text-xs md:text-sm text-gray-500 line-through">€{Number(product.oldPrice).toFixed(2)}</span>
          )}
        </div>
        <HomeAddToCartButton
          product={{
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.images?.[0]?.url || '/placeholder-product.jpg',
          }}
        />
      </div>
    </MotionCard>
  );
}
