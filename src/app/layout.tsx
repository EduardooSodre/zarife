import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { LayoutWrapper } from "@/components/layout-wrapper";
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
        <body className={`${playfair.className} antialiased`}>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
