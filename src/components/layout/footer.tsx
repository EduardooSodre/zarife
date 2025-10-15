'use client'

import Link from "next/link";
import {
  Instagram
} from "lucide-react";
import { useEffect, useState } from 'react'

interface Category {
  id: string
  name: string
  slug: string
  parent?: { id: string; name: string; slug: string }
}

interface HeaderCategory {
  id: string
  name: string
  slug: string
  parent?: { id: string; name: string; slug: string }
  children?: HeaderCategory[]
}

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories/header')
        const data = await response.json()
        // Pega apenas as categorias principais (sem parent)
        const mainCategories = data
          .filter((category: HeaderCategory) => !category.parent)
          .map((category: HeaderCategory) => ({
            id: category.id,
            name: category.name,
            slug: category.slug
          }))
        setCategories(mainCategories)
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      }
    }

    fetchCategories()
  }, [])

  return (
    <footer className="bg-gray-50 text-gray-800 border-t border-gray-200">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Newsletter Section - Prioritized */}
        <div className="py-8 md:py-16 text-center border-b border-gray-200">
          <h3 className="text-xl md:text-3xl font-light mb-2 md:mb-3 text-gray-900">
            Fique por dentro das novidades
          </h3>
          <p className="text-gray-600 mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base px-4 md:px-0">
            Receba em primeira mão os nossos lançamentos e ofertas exclusivas
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 px-4 md:px-0">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-none bg-white text-gray-800 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <button className="bg-gray-900 text-white px-4 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium uppercase tracking-wide hover:bg-gray-800 transition-colors rounded-none cursor-pointer">
              Assinar
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="py-8 md:py-16 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            <div className="space-y-2 md:space-y-3">
              <div className="mx-auto flex items-center justify-center">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-700 hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-xs md:text-sm mb-0 md:mb-1">Trocas Fáceis</h4>
                <p className="text-xs text-gray-600 hidden md:block">Processo simplificado</p>
              </div>
            </div>

            <div className="space-y-2 md:space-y-3">
              <div className="mx-auto flex items-center justify-center">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-700 hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-xs md:text-sm mb-0 md:mb-1">Qualidade Garantida</h4>
                <p className="text-xs text-gray-600 hidden md:block">Produtos selecionados</p>
              </div>
            </div>

            <div className="space-y-2 md:space-y-3">
              <div className="mx-auto flex items-center justify-center">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-700 hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-xs md:text-sm mb-0 md:mb-1">Atendimento</h4>
                <p className="text-xs text-gray-600 hidden md:block">Suporte personalizado</p>
              </div>
            </div>

            <div className="space-y-2 md:space-y-3">
              <div className="mx-auto flex items-center justify-center">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-700 hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-xs md:text-sm mb-0 md:mb-1">Pagamento Seguro</h4>
                <p className="text-xs text-gray-600 hidden md:block">Compra protegida</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-8 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-12">

            {/* About */}
            <div>
              <h4 className="text-base md:text-lg font-medium mb-3 md:mb-6 text-gray-900">Sobre a Zarife</h4>
              <p className="text-gray-600 mb-3 md:mb-6 text-sm leading-relaxed">
                Moda feminina contemporânea com foco em qualidade, estilo e sustentabilidade.
                Criamos peças únicas para mulheres modernas e autênticas.
              </p>
              <div className="space-y-1 md:space-y-2">
                <p className="text-xs text-gray-500 font-medium">Visite a nossa loja:</p>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                  Rua dos Jacintos, Nº 48<br />
                  Herdade da Aroeira<br />
                  2820-567 Charneca da Caparica<br />
                  Portugal
                </p>
              </div>
            </div>

            {/* Mobile: Three columns layout */}
            <div className="grid grid-cols-3 gap-3 md:hidden col-span-1">
              {/* Links Úteis */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-gray-900">Links</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/sobre" className="text-gray-600 hover:text-gray-900 transition-colors text-xs">
                      Sobre
                    </Link>
                  </li>
                  <li>
                    <Link href="/size-guide" className="text-gray-600 hover:text-gray-900 transition-colors text-xs">
                      Tamanhos
                    </Link>
                  </li>
                  <li>
                    <Link href="/shipping" className="text-gray-600 hover:text-gray-900 transition-colors text-xs">
                      Envios
                    </Link>
                  </li>
                  <li>
                    <Link href="/care" className="text-gray-600 hover:text-gray-900 transition-colors text-xs">
                      Cuidados
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Categorias */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-gray-900">Categorias</h4>
                <ul className="space-y-2">
                  {categories.slice(0, 4).map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/category/${category.slug}`}
                        className="text-gray-600 hover:text-gray-900 transition-colors text-xs"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suporte */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-gray-900">Suporte</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors text-xs">
                    WhatsApp
                  </a>
                  <a href="mailto:contato@zarife.com" className="block text-gray-600 hover:text-gray-900 transition-colors text-xs">
                    E-mail
                  </a>
                  <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors text-xs">
                    Instagram
                  </a>
                  <Link href="/contactos" className="block text-gray-600 hover:text-gray-900 transition-colors text-xs">
                    Contactos
                  </Link>
                </div>
              </div>
            </div>

            {/* Links Úteis - Desktop */}
            <div className="hidden md:block">
              <h4 className="text-lg font-medium mb-6 text-gray-900">Links Úteis</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/sobre" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    Sobre Nós
                  </Link>
                </li>
                <li>
                  <Link href="/size-guide" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    Guia de Tamanhos
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    Envios e Devoluções
                  </Link>
                </li>
                <li>
                  <Link href="/care" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    Cuidados das Peças
                  </Link>
                </li>
              </ul>
            </div>

            {/* Desktop: Categorias */}
            <div className="hidden md:block">
              <h4 className="text-lg font-medium mb-6 text-gray-900">Categorias</h4>
              <ul className="space-y-3">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.slug}`}
                      className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Desktop: Suporte */}
            <div className="hidden md:block">
              <h4 className="text-lg font-medium mb-6 text-gray-900">Suporte</h4>
              <div className="space-y-3">
                <Link
                  href="https://wa.me/351966106212?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20os%20produtos%20da%20Zarife."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  WhatsApp: +351 966 106 212
                </Link>
                <Link href="mailto:contato@zarife.com" className="block text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  contato@zarife.com
                </Link>
                <Link
                  href="https://www.instagram.com/zarife.shop/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  @zarife_official
                </Link>
                <Link
                  href="/contactos" target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  Formulário de Contacto
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom */}
        {/* Bottom Section */}
        <div className="border-t border-gray-200 py-6 md:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <div className="flex items-center space-x-3 md:space-x-4">
              <Link
                href="https://www.instagram.com/zarife.shop/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Instagram className="w-6 h-6 md:w-7 md:h-7" />
              </Link>
              <div className="text-xs md:text-sm text-gray-600">
                <p>Siga-nos:
                  <Link
                    href="https://www.instagram.com/zarife.shop/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:underline"
                  >
                    @zarife.shop
                  </Link>
                </p>
              </div>
            </div>

            <div className="text-center md:text-right text-xs md:text-sm text-gray-600">
              <p>© 2025 Zarife. Todos os direitos reservados.</p>
              <div className="flex justify-center md:justify-end space-x-3 md:space-x-4 mt-1 md:mt-2">
                <Link
                  href="/privacy"
                  className="hover:text-gray-900 transition-colors"
                >
                  Privacidade
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-gray-900 transition-colors"
                >
                  Termos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
