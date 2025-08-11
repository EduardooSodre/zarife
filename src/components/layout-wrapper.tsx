'use client'

import { usePathname } from "next/navigation";
import Header from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { UserSync } from "@/components/user-sync";
import { CartProvider } from "@/contexts/cart-context";
import { FavoritesProvider } from "@/contexts/favorites-context";
import { CartSheet } from "@/components/cart/cart-sheet";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const isAuthPage = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');

  if (isAdminPage || isAuthPage) {
    // Layout limpo para páginas admin e auth
    return (
      <div className="min-h-screen">
        <UserSync />
        {children}
      </div>
    );
  }

  // Layout padrão com header, footer e carrinho
  return (
    <CartProvider>
      <FavoritesProvider>
        <div className="min-h-screen flex flex-col relative bg-white">
          <UserSync />
          <Header />
          <main className="flex-1 bg-white">
            {children}
          </main>
          <Footer />
          <CartSheet />
        </div>
      </FavoritesProvider>
    </CartProvider>
  );
}
