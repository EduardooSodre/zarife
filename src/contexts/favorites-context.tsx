'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface FavoriteProduct {
  id: string;
  name: string;
  price: number;
  oldPrice: number | null;
  images: { url: string }[];
  stock: number;
  category: {
    name: string;
    slug: string;
  } | null;
  addedAt: string;
}

interface FavoritesContextType {
  favorites: FavoriteProduct[];
  addToFavorites: (product: FavoriteProduct) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  favoritesCount: number;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoaded } = useUser();

  // Load favorites when user is loaded
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/favorites');
        if (response.ok) {
          const data = await response.json();
          const rawFavorites = data.favorites || [];

          // Refresh each favorite with the latest product data (stock/variants)
          const refreshed = await Promise.all(
            rawFavorites.map(async (fRaw: unknown) => {
              const f = fRaw as Record<string, unknown>;
              try {
                const res = await fetch(`/api/products/${f.id}`);
                if (!res.ok) return f;
                const latest = await res.json();
                return {
                  ...f,
                  price: latest.price ?? f.price,
                  oldPrice: latest.oldPrice ?? f.oldPrice,
                  images: latest.images ?? f.images,
                  variants: latest.variants ?? f.variants,
                  stock: typeof latest.stock === 'number' ? latest.stock : f.stock,
                };
              } catch (err) {
                console.warn('Failed to refresh favorite', f.id, err);
                return f;
              }
            })
          );

          setFavorites(refreshed);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded && user) {
      loadFavorites();
    } else if (isLoaded && !user) {
      setFavorites([]);
      setIsLoading(false);
    }
  }, [user, isLoaded]);

  const addToFavorites = async (product: FavoriteProduct) => {
    if (!user) return;

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product }),
      });

      if (response.ok) {
        setFavorites(prev => [...prev, { ...product, addedAt: new Date().toISOString() }]);
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const removeFromFavorites = async (productId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/favorites/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(item => item.id !== productId));
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const isFavorite = (productId: string) => {
    return favorites.some(item => item.id === productId);
  };

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    favoritesCount: favorites.length,
    isLoading,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
