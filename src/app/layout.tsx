import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair"
});

export const metadata: Metadata = {
  title: {
    default: "Zarife - Moda Moderna e Elegante",
    template: "%s | Zarife",
  },
  description: "Zarife — loja de moda de luxo em Portugal. Enviamos para todo o território nacional. Roupas femininas e masculinas com design e qualidade.",
  keywords: ["moda", "roupas", "luxo", "Portugal", "Zarife", "vestidos", "conjuntos"],
  authors: [{ name: "Zarife" }],
  creator: "Zarife",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: "https://zarife.vercel.app",
    title: "Zarife - Moda Moderna e Elegante",
    description: "Zarife — loja de moda de luxo em Portugal. Enviamos para todo o território nacional.",
    siteName: "Zarife",
    images: [
      {
        url: "https://zarife.vercel.app/ZARIFE_LOGO.png",
        width: 1200,
        height: 630,
        alt: "Zarife logo",
      },
    ],
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
    <html lang="pt-PT" className={`${inter.variable} ${playfair.variable}`}>
      <body className={`${playfair.className} antialiased`}>
        <ClerkProvider>
          <LayoutWrapper>
            {children}
            {/* Structured data for SEO: Organization + WebSite + SearchAction */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "name": "Zarife",
                  "url": "https://zarife.vercel.app",
                  "logo": "https://zarife.vercel.app/ZARIFE_LOGO.png",
                  "address": {
                    "@type": "PostalAddress",
                    "addressCountry": "PT",
                    "addressLocality": "Portugal"
                  },
                  "sameAs": []
                },
                {
                  "@type": "WebSite",
                  "url": "https://zarife.vercel.app",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://zarife.vercel.app/produtos?search={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                }
              ]
            }) }} />
          </LayoutWrapper>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
