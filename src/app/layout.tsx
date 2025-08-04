import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { UserSync } from "@/components/user-sync";
import { CartProvider } from "@/contexts/cart-context";
import { CartSheet } from "@/components/cart/cart-sheet";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair" 
});

export const metadata: Metadata = {
  title: "Zarife - Moda Moderna e Elegante",
  description: "Descubra as últimas tendências da moda com a coleção exclusiva da Zarife. Roupas femininas e masculinas de alta qualidade com estilo único.",
  keywords: "moda, roupas, feminino, masculino, tendências, estilo, elegante",
  authors: [{ name: "Zarife" }],
  creator: "Zarife",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://zarife.com.br",
    title: "Zarife - Moda Moderna e Elegante",
    description: "Descubra as últimas tendências da moda com a coleção exclusiva da Zarife.",
    siteName: "Zarife",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zarife - Moda Moderna e Elegante",
    description: "Descubra as últimas tendências da moda com a coleção exclusiva da Zarife.",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
        <body className={`${inter.className} antialiased`}>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <UserSync />
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <CartSheet />
            </div>
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
