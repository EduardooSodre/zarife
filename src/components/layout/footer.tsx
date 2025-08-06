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
    <footer className="text-black" style={{ backgroundColor: '#f4f4f4' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-16 border-b border-gray-300">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-light mb-4 tracking-wider uppercase text-gray-800">
              VISITE A ZARIFE
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Rua dos Jacintos, Nº 48 | Herdade da Aroeira, Charneca da Caparica 2820-567 Charneca da Caparica, Portugal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h4 className="text-sm font-medium mb-2 uppercase tracking-widest text-gray-800">TROCA SIMPLIFICADA</h4>
            </div>

            <div>
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-sm font-medium mb-2 uppercase tracking-widest text-gray-800">SATISFAÇÃO GARANTIDA</h4>
            </div>

            <div>
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="text-sm font-medium mb-2 uppercase tracking-widest text-gray-800">SUPORTE AO CLIENTE</h4>
            </div>

            <div>
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-sm font-medium mb-2 uppercase tracking-widest text-gray-800">PAGAMENTO SEGURO</h4>
            </div>
          </div>
        </div>

        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company Info */}
            <div>
              <h4 className="text-lg font-medium mb-6 uppercase tracking-wider text-gray-800">ABOUT OUR STORE</h4>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Use this text area to tell your customers about your brand and vision. You can change it in the theme editor.
              </p>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-lg font-medium mb-6 uppercase tracking-wider text-gray-800">ASSINE NOSSA NEWSLETTER</h4>
              <p className="text-gray-600 mb-6 text-sm">
                Fique por dentro das últimas tendências e novidades.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="E-mail"
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-800 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-500"
                />
                <button className="w-full bg-gray-800 text-white px-6 py-3 text-sm uppercase tracking-wide hover:bg-gray-700 transition-colors">
                  ASSINAR
                </button>
              </div>
            </div>

            {/* Menu Principal */}
            <div>
              <h4 className="text-lg font-medium mb-6 uppercase tracking-wider text-gray-800">MENU PRINCIPAL</h4>
              <ul className="space-y-3">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link href={`/category/${category.slug}`} className="text-gray-600 hover:text-gray-800 transition-colors text-sm">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ajuda */}
            <div>
              <h4 className="text-lg font-medium mb-6 uppercase tracking-wider text-gray-800">AJUDA</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-gray-600 hover:text-gray-800 cursor-pointer transition-colors text-sm">WhatsApp</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 hover:text-gray-800 cursor-pointer transition-colors text-sm">E-mail</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 hover:text-gray-800 cursor-pointer transition-colors text-sm">Instagram</span>
                </div>
                <Link href="/contactos" className="text-gray-600 hover:text-gray-800 transition-colors text-sm">
                  Contactos
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-300 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Instagram className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer" />
            </div>
            <p className="text-gray-600 text-sm">
              © 2025 Zarife. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
