import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
        pathname: "/**",
      },
    ],
    // Allowed quality values for next/image. Including 100 because some components request it.
    // Next.js 16 will require explicit configuration.
    qualities: [75, 85, 90, 100],
  },
  async redirects() {
    return [
      {
        source: "/roupas",
        destination: "/category/roupas",
        permanent: true,
      },
      {
        source: "/vestidos",
        destination: "/category/vestidos",
        permanent: true,
      },
      {
        source: "/conjuntos",
        destination: "/category/conjuntos",
        permanent: true,
      },
      {
        source: "/moda-praia",
        destination: "/category/moda-praia",
        permanent: true,
      },
      {
        source: "/looks-completos",
        destination: "/category/looks-completos",
        permanent: true,
      },
      // Redirecionamentos para subcategorias existentes
      {
        source: "/roupas/partes-de-cima",
        destination: "/category/partes-de-cima",
        permanent: true,
      },
      {
        source: "/roupas/partes-de-baixo",
        destination: "/category/partes-de-baixo",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
