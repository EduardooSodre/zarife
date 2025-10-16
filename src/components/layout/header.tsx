"use client"

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { UserButton, SignInButton, SignedIn, SignedOut, useUser } from '@clerk/nextjs'
import { ShoppingCart, User, Search, Menu, Heart, Package, Shield } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import { useFavorites } from '@/contexts/favorites-context'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface HeaderCategory {
  id: string;
  name: string;
  slug: string;
  href: string;
  children: {
    id: string;
    name: string;
    slug: string;
    href: string;
    children: {
      id: string;
      name: string;
      slug: string;
      href: string;
    }[];
  }[];
}

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState<HeaderCategory[]>([])
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const searchRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { user } = useUser()

  // Verificar se estamos na home page
  const isHomePage = pathname === '/'
  const { totalItems, setIsOpen } = useCart()
  const { favoritesCount } = useFavorites()

  // Carregar categorias do banco
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories/header')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      }
    }
    loadCategories()
  }, [])

  // Verificar se o usuário é admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        try {
          const response = await fetch('/api/auth/check-admin')
          if (response.ok) {
            const data = await response.json()
            setIsAdmin(data.isAdmin)
          }
        } catch (error) {
          console.error('Erro ao verificar admin:', error)
        }
      } else {
        setIsAdmin(false)
      }
    }
    checkAdmin()
  }, [user])

  // Controlar transparência do header baseado no scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isHomePage) {
        // Na home: Header transparente até finalizar a hero section (100vh - 2rem do top banner)
        const heroHeight = window.innerHeight - 32 // 32px = 2rem
        setIsScrolled(window.scrollY > heroHeight)
      } else {
        // Em outras páginas: Header sempre visível 
        setIsScrolled(true)
      }
    }

    // Executar imediatamente para definir o estado inicial
    handleScroll()

    if (isHomePage) {
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [isHomePage])

  // Fechar busca com ESC e ao clicar fora
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false)
        setSearchTerm('')
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node) && isSearchOpen) {
        setIsSearchOpen(false)
        setSearchTerm('')
      }
    }

    if (isSearchOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSearchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Navegar para página de produtos com busca
      window.location.href = `/produtos?search=${encodeURIComponent(searchTerm)}`
      setIsSearchOpen(false)
      setSearchTerm('')
      setIsMobileMenuOpen(false) // Fechar menu mobile também
    }
  }

  const handleCartClick = () => {
    setIsOpen(true)
  }

  const toggleCategory = (categorySlug: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categorySlug)) {
        newSet.delete(categorySlug)
      } else {
        newSet.add(categorySlug)
      }
      return newSet
    })
  }

  // Encontrar categorias específicas
  const roupasCategory = categories.find(cat => cat.slug === 'roupas')
  const vestidosCategory = categories.find(cat => cat.slug === 'vestidos')
  const conjuntosCategory = categories.find(cat => cat.slug === 'conjuntos')
  const modaPraiaCategory = categories.find(cat => cat.slug === 'moda-praia')
  const lookCompletoCategory = categories.find(cat => cat.slug === 'look-completo')

  return (
    <>
      {/* Top Banner */}
      <div className="bg-black text-white text-center py-1">
        <p className="text-xs uppercase tracking-widest">
          COMPRE ONLINE E NA NOSSA LOJA
        </p>
      </div>

      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-sm border-b border-gray-100' : 'bg-transparent'
          }`}
        style={{ top: (isScrolled || !isHomePage) ? '0' : '2rem' }}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile: User Button - Left */}
            <div className="md:hidden flex items-center">
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </SignedIn>
              <SignedOut>
                <SignInButton>
                  <button className="p-2 text-gray-900 hover:text-gray-600 hover:bg-gray-100/50 rounded-lg transition-colors" aria-label="Entrar">
                    <User className="w-6 h-6" />
                  </button>
                </SignInButton>
              </SignedOut>
            </div>

            {/* Desktop: Logo - Left / Mobile: Logo - Center */}
            <Link href="/" className="flex items-center md:relative absolute left-1/2 md:left-0 transform -translate-x-1/2 md:transform-none">
              <Image
                src="/ZARIFE_LOGO.png"
                alt="Zarife"
                width={120}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation - Fixed + Dynamic */}
            <div className="hidden md:flex items-center">
              {/* Fixed Menu Items */}
              <Menubar className="bg-transparent border-0 shadow-none h-auto p-0 gap-1 mr-6">
                {/* Menu ROUPAS */}
                {roupasCategory && (
                  <MenubarMenu>
                    <MenubarTrigger className="text-base font-semibold tracking-wide text-gray-900 hover:text-black bg-transparent hover:bg-gray-50/50 data-[state=open]:bg-gray-50 data-[state=open]:text-black px-6 py-3 rounded-none border-b-2 border-transparent hover:border-gray-200 data-[state=open]:border-black transition-all duration-300 ease-in-out">
                      {roupasCategory.name}
                    </MenubarTrigger>
                    <MenubarContent className="min-w-[240px] bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg mt-1 p-3">
                      {roupasCategory.children.map((item, index) => (
                        <div key={item.name} className={`${index > 0 ? 'mt-3' : ''}`}>
                          <MenubarItem asChild>
                            <Link href={item.href} className="group block text-base font-medium text-gray-900 tracking-wide hover:text-black transition-colors duration-200 pb-1">
                              {item.name}
                            </Link>
                          </MenubarItem>
                          {item.children && item.children.length > 0 && (
                            <div className="ml-2 mt-1 space-y-0.5">
                              {item.children.map((subcat) => (
                                <MenubarItem key={subcat.name} asChild>
                                  <Link href={subcat.href} className="block text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 transition-all duration-150">
                                    {subcat.name}
                                  </Link>
                                </MenubarItem>
                              ))}
                            </div>
                          )}
                          {index < roupasCategory.children.length - 1 && (
                            <MenubarSeparator className="my-2 bg-gray-200" />
                          )}
                        </div>
                      ))}
                    </MenubarContent>
                  </MenubarMenu>
                )}

                {/* Menu VESTIDOS */}
                {vestidosCategory && (
                  <MenubarMenu>
                    <MenubarTrigger className="text-base font-semibold tracking-wide text-gray-900 hover:text-black bg-transparent hover:bg-gray-50/50 data-[state=open]:bg-gray-50 data-[state=open]:text-black px-6 py-3 rounded-none border-b-2 border-transparent hover:border-gray-200 data-[state=open]:border-black transition-all duration-300 ease-in-out">
                      {vestidosCategory.name}
                    </MenubarTrigger>
                    <MenubarContent className="min-w-[240px] bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg mt-1 p-3">
                      {vestidosCategory.children.map((item, index) => (
                        <div key={item.name} className={`${index > 0 ? 'mt-3' : ''}`}>
                          <MenubarItem asChild>
                            <Link href={item.href} className="group block text-base font-medium text-gray-900 tracking-wide hover:text-black transition-colors duration-200 pb-1">
                              {item.name}
                            </Link>
                          </MenubarItem>
                          {item.children && item.children.length > 0 && (
                            <div className="ml-2 mt-1 space-y-0.5">
                              {item.children.map((subcat) => (
                                <MenubarItem key={subcat.name} asChild>
                                  <Link href={subcat.href} className="block text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 transition-all duration-150">
                                    {subcat.name}
                                  </Link>
                                </MenubarItem>
                              ))}
                            </div>
                          )}
                          {index < vestidosCategory.children.length - 1 && (
                            <MenubarSeparator className="my-2 bg-gray-200" />
                          )}
                        </div>
                      ))}
                    </MenubarContent>
                  </MenubarMenu>
                )}

                {/* Menu CONJUNTOS */}
                {conjuntosCategory && (
                  <MenubarMenu>
                    <MenubarTrigger className="text-base font-semibold tracking-wide text-gray-900 hover:text-black bg-transparent hover:bg-gray-50/50 data-[state=open]:bg-gray-50 data-[state=open]:text-black px-6 py-3 rounded-none border-b-2 border-transparent hover:border-gray-200 data-[state=open]:border-black transition-all duration-300 ease-in-out">
                      {conjuntosCategory.name}
                    </MenubarTrigger>
                    <MenubarContent className="min-w-[240px] bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg mt-1 p-3">
                      {conjuntosCategory.children.map((item, index) => (
                        <div key={item.name} className={`${index > 0 ? 'mt-3' : ''}`}>
                          <MenubarItem asChild>
                            <Link href={item.href} className="group block text-base font-medium text-gray-900 tracking-wide hover:text-black transition-colors duration-200 pb-1">
                              {item.name}
                            </Link>
                          </MenubarItem>
                          {item.children && item.children.length > 0 && (
                            <div className="ml-2 mt-1 space-y-0.5">
                              {item.children.map((subcat) => (
                                <MenubarItem key={subcat.name} asChild>
                                  <Link href={subcat.href} className="block text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 transition-all duration-150">
                                    {subcat.name}
                                  </Link>
                                </MenubarItem>
                              ))}
                            </div>
                          )}
                          {index < conjuntosCategory.children.length - 1 && (
                            <MenubarSeparator className="my-2 bg-gray-200" />
                          )}
                        </div>
                      ))}
                    </MenubarContent>
                  </MenubarMenu>
                )}

                {/* Menu MODA PRAIA */}
                {modaPraiaCategory && (
                  <MenubarMenu>
                    <MenubarTrigger className="text-base font-semibold tracking-wide text-gray-900 hover:text-black bg-transparent hover:bg-gray-50/50 data-[state=open]:bg-gray-50 data-[state=open]:text-black px-6 py-3 rounded-none border-b-2 border-transparent hover:border-gray-200 data-[state=open]:border-black transition-all duration-300 ease-in-out">
                      {modaPraiaCategory.name}
                    </MenubarTrigger>
                    <MenubarContent className="min-w-[240px] bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg mt-1 p-3">
                      {modaPraiaCategory.children.map((item, index) => (
                        <div key={item.name} className={`${index > 0 ? 'mt-3' : ''}`}>
                          <MenubarItem asChild>
                            <Link href={item.href} className="group block text-base font-medium text-gray-900 tracking-wide hover:text-black transition-colors duration-200 pb-1">
                              {item.name}
                            </Link>
                          </MenubarItem>
                          {item.children && item.children.length > 0 && (
                            <div className="ml-2 mt-1 space-y-0.5">
                              {item.children.map((subcat) => (
                                <MenubarItem key={subcat.name} asChild>
                                  <Link href={subcat.href} className="block text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 transition-all duration-150">
                                    {subcat.name}
                                  </Link>
                                </MenubarItem>
                              ))}
                            </div>
                          )}
                          {index < modaPraiaCategory.children.length - 1 && (
                            <MenubarSeparator className="my-2 bg-gray-200" />
                          )}
                        </div>
                      ))}
                    </MenubarContent>
                  </MenubarMenu>
                )}

                {/* Menu LOOK COMPLETO */}
                {lookCompletoCategory && (
                  <MenubarMenu>
                    <MenubarTrigger className="text-base font-semibold tracking-wide text-gray-900 hover:text-black bg-transparent hover:bg-gray-50/50 data-[state=open]:bg-gray-50 data-[state=open]:text-black px-6 py-3 rounded-none border-b-2 border-transparent hover:border-gray-200 data-[state=open]:border-black transition-all duration-300 ease-in-out">
                      {lookCompletoCategory.name}
                    </MenubarTrigger>
                    <MenubarContent className="min-w-[240px] bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg mt-1 p-3">
                      {lookCompletoCategory.children.map((item, index) => (
                        <div key={item.name} className={`${index > 0 ? 'mt-3' : ''}`}>
                          <MenubarItem asChild>
                            <Link href={item.href} className="group block text-base font-medium text-gray-900 tracking-wide hover:text-black transition-colors duration-200 pb-1">
                              {item.name}
                            </Link>
                          </MenubarItem>
                          {item.children && item.children.length > 0 && (
                            <div className="ml-2 mt-1 space-y-0.5">
                              {item.children.map((subcat) => (
                                <MenubarItem key={subcat.name} asChild>
                                  <Link href={subcat.href} className="block text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 transition-all duration-150">
                                    {subcat.name}
                                  </Link>
                                </MenubarItem>
                              ))}
                            </div>
                          )}
                          {index < lookCompletoCategory.children.length - 1 && (
                            <MenubarSeparator className="my-2 bg-gray-200" />
                          )}
                        </div>
                      ))}
                    </MenubarContent>
                  </MenubarMenu>
                )}
              </Menubar>
            </div>

            {/* Right side actions */}
            <div className="hidden md:flex items-center space-x-3">
              <TooltipProvider>
                {/* Search - Mais elegante e alinhado */}
                <div className="relative" ref={searchRef}>
                  {isSearchOpen ? (
                    <form onSubmit={handleSearch} className="flex items-center bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar produtos..."
                        className="w-64 px-3 py-2 text-sm bg-transparent focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label="Buscar"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setIsSearchOpen(true)}
                          className="p-2 text-gray-900 hover:text-gray-600 hover:bg-gray-100/50 rounded-lg transition-colors cursor-pointer"
                          aria-label="Abrir busca"
                        >
                          <Search className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Pesquisar</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>

                {/* User Authentication */}
                <SignedOut>
                  <SignInButton>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="p-2 text-gray-900 hover:text-gray-600 hover:bg-gray-100/50 rounded-lg transition-colors cursor-pointer" aria-label="Entrar">
                          <User className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Iniciar sessão</p>
                      </TooltipContent>
                    </Tooltip>
                  </SignInButton>
                </SignedOut>

                <SignedIn>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="p-2 hover:bg-gray-100/50 rounded-lg transition-colors cursor-pointer flex items-center" aria-label="Conta">
                        <UserButton
                          appearance={{
                            elements: {
                              avatarBox: "w-6 h-6"
                            }
                          }}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Conta</p>
                    </TooltipContent>
                  </Tooltip>
                </SignedIn>

                {/* Favorites - Only show when signed in */}
                <SignedIn>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/favoritos"
                        className="p-2 text-gray-900 hover:text-gray-600 hover:bg-gray-100/50 rounded-lg transition-colors relative"
                        aria-label="Favoritos"
                      >
                        <Heart className="w-5 h-5" />
                        {favoritesCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full leading-none font-medium">
                            {favoritesCount}
                          </span>
                        )}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Favoritos</p>
                    </TooltipContent>
                  </Tooltip>
                </SignedIn>

                {/* Meus Pedidos - Only show when signed in */}
                <SignedIn>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/meus-pedidos"
                        className="p-2 text-gray-900 hover:text-gray-600 hover:bg-gray-100/50 rounded-lg transition-colors relative"
                        aria-label="Meus Pedidos"
                      >
                        <Package className="w-5 h-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Os meus pedidos</p>
                    </TooltipContent>
                  </Tooltip>
                </SignedIn>

                {/* Admin - Only show when user is admin */}
                {isAdmin && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/admin"
                        className="p-2 text-gray-900 hover:text-gray-600 hover:bg-gray-100/50 rounded-lg transition-colors relative"
                        aria-label="Painel Admin"
                      >
                        <Shield className="w-5 h-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Painel de administração</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Shopping Cart */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleCartClick}
                      className="p-2 text-gray-900 hover:text-gray-600 hover:bg-gray-100/50 rounded-lg transition-colors relative cursor-pointer"
                      aria-label="Carrinho de compras"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full leading-none font-medium">
                          {totalItems}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Carrinho de compras</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Mobile Menu Button - Right side */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="p-2 text-gray-900 hover:text-gray-600 hover:bg-gray-100/50 rounded-lg transition-colors" aria-label="Abrir menu">
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0 flex flex-col max-h-screen">
                  <SheetHeader className="px-4 py-4 border-b border-gray-200 flex-shrink-0">
                    <SheetTitle className="text-left">Menu</SheetTitle>
                    <SheetDescription className="sr-only">
                      Menu de navegação
                    </SheetDescription>
                  </SheetHeader>

                  {/* Mobile Actions */}
                  <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0 space-y-3">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar produtos..."
                        className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Buscar"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </form>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <SignedIn>
                        <Link
                          href="/favoritos"
                          className="flex flex-col items-center gap-1 p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Heart className="w-5 h-5" />
                          <span className="text-xs">Favoritos</span>
                          {favoritesCount > 0 && (
                            <span className="text-xs font-medium text-red-500">({favoritesCount})</span>
                          )}
                        </Link>
                      </SignedIn>

                      <SignedIn>
                        <Link
                          href="/meus-pedidos"
                          className="flex flex-col items-center gap-1 p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Package className="w-5 h-5" />
                          <span className="text-xs">Pedidos</span>
                        </Link>
                      </SignedIn>

                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          handleCartClick()
                        }}
                        className="flex flex-col items-center gap-1 p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span className="text-xs">Carrinho</span>
                        {totalItems > 0 && (
                          <span className="text-xs font-medium text-black">({totalItems})</span>
                        )}
                      </button>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex flex-col items-center gap-1 p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Shield className="w-5 h-5" />
                          <span className="text-xs">Admin</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Scrollable Menu Items */}
                  <div className="flex-1 overflow-y-auto">
                    <nav className="py-1">
                      <div className="space-y-0">
                        {/* ROUPAS */}
                        {roupasCategory && (
                          <div className="border-b border-gray-100">
                            <button
                              onClick={() => toggleCategory(roupasCategory.slug)}
                              className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-bold text-gray-900 hover:bg-gray-50 tracking-wide transition-colors group"
                            >
                              <span>{roupasCategory.name}</span>
                              <svg
                                className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${expandedCategories.has(roupasCategory.slug) ? 'rotate-90' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            {expandedCategories.has(roupasCategory.slug) && (
                              <div className="bg-gradient-to-r from-gray-50 to-white">
                                {roupasCategory.children.map((item, idx) => (
                                  <div key={item.name} className={idx > 0 ? 'border-t border-gray-100/50' : ''}>
                                    <Link
                                      href={item.href}
                                      className="flex items-center justify-between px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-white hover:text-black transition-all duration-150 group"
                                      onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                      <span>{item.name}</span>
                                      {item.children && item.children.length > 0 && (
                                        <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      )}
                                    </Link>
                                    {item.children && item.children.length > 0 && (
                                      <div className="bg-gray-50/30 pl-4">
                                        {item.children.map((subcat) => (
                                          <Link
                                            key={subcat.name}
                                            href={subcat.href}
                                            className="flex items-center px-6 py-2 text-xs text-gray-600 hover:text-black hover:bg-white/80 transition-all duration-150"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                          >
                                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                            {subcat.name}
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* VESTIDOS */}
                        {vestidosCategory && (
                          <div className="border-b border-gray-100">
                            <button
                              onClick={() => toggleCategory(vestidosCategory.slug)}
                              className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-bold text-gray-900 hover:bg-gray-50 tracking-wide transition-colors group"
                            >
                              <span>{vestidosCategory.name}</span>
                              <svg
                                className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${expandedCategories.has(vestidosCategory.slug) ? 'rotate-90' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            {expandedCategories.has(vestidosCategory.slug) && (
                              <div className="bg-gradient-to-r from-gray-50 to-white">
                                {vestidosCategory.children.map((item, idx) => (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center justify-between px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-white hover:text-black transition-all duration-150 ${idx > 0 ? 'border-t border-gray-100/50' : ''}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    <span>{item.name}</span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* CONJUNTOS */}
                        {conjuntosCategory && (
                          <div className="border-b border-gray-100">
                            <button
                              onClick={() => toggleCategory(conjuntosCategory.slug)}
                              className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-bold text-gray-900 hover:bg-gray-50 tracking-wide transition-colors group"
                            >
                              <span>{conjuntosCategory.name}</span>
                              <svg
                                className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${expandedCategories.has(conjuntosCategory.slug) ? 'rotate-90' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            {expandedCategories.has(conjuntosCategory.slug) && (
                              <div className="bg-gradient-to-r from-gray-50 to-white">
                                {conjuntosCategory.children.map((item, idx) => (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center justify-between px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-white hover:text-black transition-all duration-150 ${idx > 0 ? 'border-t border-gray-100/50' : ''}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    <span>{item.name}</span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* MODA PRAIA */}
                        {modaPraiaCategory && (
                          <div className="border-b border-gray-100">
                            <button
                              onClick={() => toggleCategory(modaPraiaCategory.slug)}
                              className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-bold text-gray-900 hover:bg-gray-50 tracking-wide transition-colors group"
                            >
                              <span>{modaPraiaCategory.name}</span>
                              <svg
                                className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${expandedCategories.has(modaPraiaCategory.slug) ? 'rotate-90' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            {expandedCategories.has(modaPraiaCategory.slug) && (
                              <div className="bg-gradient-to-r from-gray-50 to-white">
                                {modaPraiaCategory.children.map((item, idx) => (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center justify-between px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-white hover:text-black transition-all duration-150 ${idx > 0 ? 'border-t border-gray-100/50' : ''}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    <span>{item.name}</span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* LOOK COMPLETO */}
                        {lookCompletoCategory && (
                          <div className="border-b border-gray-100">
                            <button
                              onClick={() => toggleCategory(lookCompletoCategory.slug)}
                              className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-bold text-gray-900 hover:bg-gray-50 tracking-wide transition-colors group"
                            >
                              <span>{lookCompletoCategory.name}</span>
                              <svg
                                className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${expandedCategories.has(lookCompletoCategory.slug) ? 'rotate-90' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            {expandedCategories.has(lookCompletoCategory.slug) && (
                              <div className="bg-gradient-to-r from-gray-50 to-white">
                                {lookCompletoCategory.children.map((item, idx) => (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center justify-between px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-white hover:text-black transition-all duration-150 ${idx > 0 ? 'border-t border-gray-100/50' : ''}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    <span>{item.name}</span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </nav>
                  </div>

                  {/* Footer do Mobile Menu */}
                  <div className="px-4 py-3 border-t border-gray-200 flex-shrink-0">
                    <Link
                      href="/produtos"
                      className="block w-full py-2 px-4 bg-black text-white text-center text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      VER TODOS OS PRODUTOS
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
