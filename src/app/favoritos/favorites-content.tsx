'use client';

import { useFavorites } from '@/contexts/favorites-context';
import { FavoriteProductCard } from '@/components/favorites/favorite-product-card';
import { Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export function FavoritesContent() {
  const { favorites, isLoading } = useFavorites();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando favoritos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-medium text-gray-900 mb-2">
              Meus Favoritos
            </h1>
            <p className="text-gray-600">
              Produtos que você salvou para comprar depois
            </p>
          </div>

          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <div className="mb-6">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-medium text-gray-900 mb-2">
                  Nenhum favorito ainda
                </h2>
                <p className="text-gray-600 mb-6">
                  Explore nossos produtos e adicione seus favoritos clicando no ícone de coração
                </p>
              </div>
              
              <Link
                href="/produtos"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors duration-200"
              >
                <ShoppingBag className="h-4 w-4" />
                Explorar Produtos
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-medium text-gray-900 mb-2">
            Meus Favoritos
          </h1>
          <p className="text-gray-600">
            {favorites.length} {favorites.length === 1 ? 'produto salvo' : 'produtos salvos'}
          </p>
        </div>

        <div className="grid gap-4">
          {favorites.map((product) => (
            <FavoriteProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
