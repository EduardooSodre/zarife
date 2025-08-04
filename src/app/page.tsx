"use client"

import Link from "next/link";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section with fashion imagery */}
      <section className="relative h-screen bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-4xl">
              <h1 className="text-5xl md:text-7xl font-light text-black mb-6 tracking-wider">
                COLEÇÃO EXCLUSIVA
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 font-light">
                Elegância e sofisticação para a mulher moderna
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/look-completo/vestidos" className="bg-black text-white px-12 py-4 text-sm uppercase tracking-widest hover:bg-gray-800 transition-all duration-300 font-medium">
                  DESCOBRIR COLEÇÃO
                </Link>
                <Link href="/look-completo" className="border border-black text-black px-12 py-4 text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300 font-medium">
                  LOOKS COMPLETOS
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-black mb-4 tracking-wider">
              NOSSAS CATEGORIAS
            </h2>
            <div className="w-24 h-px bg-accent mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Roupas */}
            <Link href="/roupas" className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-xl font-medium">ROUPAS</h3>
                  <p className="text-sm">PARTES DE CIMA E BAIXO</p>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-black mb-2 tracking-wide">ROUPAS</h3>
                <p className="text-gray-600 text-sm">Blusas, camisas, shorts, saias e calças</p>
              </div>
            </Link>

            {/* Look Completo */}
            <Link href="/look-completo" className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-xl font-medium">LOOK COMPLETO</h3>
                  <p className="text-sm">VESTIDOS E CONJUNTOS</p>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-black mb-2 tracking-wide">LOOK COMPLETO</h3>
                <p className="text-gray-600 text-sm">Vestidos e conjuntos coordenados</p>
              </div>
            </Link>

            {/* Moda Praia */}
            <Link href="/moda-praia" className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-xl font-medium">MODA PRAIA</h3>
                  <p className="text-sm">BIQUÍNI, MAIÔ E SAÍDAS</p>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-black mb-2 tracking-wide">MODA PRAIA</h3>
                <p className="text-gray-600 text-sm">Biquíni, maiô e saídas de praia</p>
              </div>
            </Link>

            {/* Novidades */}
            <Link href="/novidades" className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-xl font-medium">NOVIDADES</h3>
                  <p className="text-sm">ÚLTIMOS LANÇAMENTOS</p>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-black mb-2 tracking-wide">NOVIDADES</h3>
                <p className="text-gray-600 text-sm">Últimos lançamentos da coleção</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-black mb-4 tracking-wider">
              PRODUTOS EM DESTAQUE
            </h2>
            <div className="w-24 h-px bg-accent mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Product 1 */}
            <div className="bg-white border border-gray-200 group hover:shadow-lg transition-all duration-300">
              <div className="aspect-square bg-gray-200 overflow-hidden">
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                  <span className="text-sm">Vestido Elegante</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Vestido Elegante Preto
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Vestido sofisticado para ocasiões especiais
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-medium text-primary">€89.99</span>
                  <span className="text-sm text-gray-500 line-through">€119.99</span>
                </div>
                <AddToCartButton
                  product={{
                    id: "featured-1",
                    name: "Vestido Elegante Preto",
                    price: 89.99,
                    image: "/placeholder-product.jpg",
                    size: "M",
                    color: "Preto"
                  }}
                  className="w-full uppercase tracking-widest text-sm"
                />
              </div>
            </div>

            {/* Product 2 */}
            <div className="bg-white border border-gray-200 group hover:shadow-lg transition-all duration-300">
              <div className="aspect-square bg-gray-200 overflow-hidden">
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                  <span className="text-sm">Blusa Sofisticada</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Blusa Sofisticada Branca
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Blusa elegante para o dia a dia
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-medium text-primary">€59.99</span>
                </div>
                <AddToCartButton
                  product={{
                    id: "featured-2",
                    name: "Blusa Sofisticada Branca",
                    price: 59.99,
                    image: "/placeholder-product.jpg",
                    size: "S",
                    color: "Branco"
                  }}
                  className="w-full uppercase tracking-widest text-sm"
                />
              </div>
            </div>

            {/* Product 3 */}
            <div className="bg-white border border-gray-200 group hover:shadow-lg transition-all duration-300">
              <div className="aspect-square bg-gray-200 overflow-hidden">
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                  <span className="text-sm">Conjunto Executivo</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Conjunto Executivo
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Conjunto completo para ambiente profissional
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-medium text-primary">€149.99</span>
                </div>
                <AddToCartButton
                  product={{
                    id: "featured-3",
                    name: "Conjunto Executivo",
                    price: 149.99,
                    image: "/placeholder-product.jpg",
                    size: "M",
                    color: "Azul Marinho"
                  }}
                  className="w-full uppercase tracking-widest text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
