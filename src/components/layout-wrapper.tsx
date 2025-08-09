'use client'

import { usePathname } from "next/navigation";
import Header from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { UserSync } from "@/components/user-sync";
import { CartProvider } from "@/contexts/cart-context";
import { CartSheet } from "@/components/cart/cart-sheet";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const isHomePage = pathname === '/';

  if (isAdminPage) {
    // Layout limpo para páginas admin
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
      <div className="min-h-screen flex flex-col relative">
        <UserSync />
        <Header />
        <main className={`flex-1 ${!isHomePage ? 'pt-24' : ''}`}>
          {children}
        </main>
        <Footer />
        <CartSheet />
      </div>
    </CartProvider>
  );
}
