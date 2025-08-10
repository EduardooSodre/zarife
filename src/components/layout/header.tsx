"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
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
  const pathname = usePathname()

  // Verificar se estamos na home page
  const isHomePage = pathname === '/'
  const { totalItems, setIsOpen } = useCart()

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

  // Controlar transparência do header baseado no scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isHomePage) {
        // Na home: Header transparente até finalizar a hero section (100vh - 2rem do top banner)
        const heroHeight = window.innerHeight - 32 // 32px = 2rem
        setIsScrolled(window.scrollY > heroHeight)
      } else {
        // Em outras páginas: Header sempre visível (não transparente)
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Navegar para página de busca
      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`
      setIsSearchOpen(false)
      setSearchTerm('')
    }
  }

  const handleCartClick = () => {
    setIsOpen(true)
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
          COMPRE ONLINE E EM NOSSA LOJA
        </p>
      </div>

      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-sm border-b border-gray-100' : 'bg-transparent'
          }`}
        style={{ top: (isScrolled || !isHomePage) ? '0' : '2rem' }}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden p-2 text-gray-900 hover:text-gray-600 hover:bg-gray-100/50 transition-colors">
                  <Menu className="w-6 h-6" />
                  <span className="sr-only">Abrir menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 flex flex-col">
                <SheetHeader className="px-4 py-6 border-b border-gray-200">
                  <SheetTitle className="text-left">
                    <Image
                      src="/ZARIFE_LOGO.png"
                      alt="Zarife"
                      width={100}
                      height={50}
                      className="h-8 w-auto"
                    />
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Menu de navegação
                  </SheetDescription>
                </SheetHeader>


                {/* Fixed Menu Items */}
                <nav className="border-b border-gray-200 pb-4 mb-4">
                  <div className="space-y-1">
                    {/* ROUPAS */}
                    {/* ROUPAS */}
                    {roupasCategory && (
                      <div>
                        <Link
                          href={roupasCategory.href}
                          className="flex items-center px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 uppercase tracking-wide"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {roupasCategory.name}
                        </Link>
                        <div className="bg-gray-50">
                          {roupasCategory.children.map((item) => (
                            <div key={item.name}>
                              <Link
                                href={item.href}
                                className="flex items-center px-8 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 uppercase tracking-wide"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {item.name}
                              </Link>
                              {item.children && item.children.length > 0 && (
                                <div>
                                  {item.children.map((subcat) => (
                                    <Link
                                      key={subcat.name}
                                      href={subcat.href}
                                      className="flex items-center px-12 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                      onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                      {subcat.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* VESTIDOS */}
                    {vestidosCategory && (
                      <div>
                        <Link
                          href={vestidosCategory.href}
                          className="flex items-center px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 uppercase tracking-wide"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {vestidosCategory.name}
                        </Link>
                        <div className="bg-gray-50">
                          {vestidosCategory.children.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center px-8 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CONJUNTOS */}
                    {conjuntosCategory && (
                      <div>
                        <Link
                          href={conjuntosCategory.href}
                          className="flex items-center px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 uppercase tracking-wide"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {conjuntosCategory.name}
                        </Link>
                        <div className="bg-gray-50">
                          {conjuntosCategory.children.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center px-8 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* MODA PRAIA */}
                    {modaPraiaCategory && (
                      <div>
                        <Link
                          href={modaPraiaCategory.href}
                          className="flex items-center px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 uppercase tracking-wide"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {modaPraiaCategory.name}
                        </Link>
                        <div className="bg-gray-50">
                          {modaPraiaCategory.children.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center px-8 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* LOOK COMPLETO */}
                    {lookCompletoCategory && (
                      <div>
                        <Link
                          href={lookCompletoCategory.href}
                          className="flex items-center px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 uppercase tracking-wide"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {lookCompletoCategory.name}
                        </Link>
                        <div className="bg-gray-50">
                          {lookCompletoCategory.children.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center px-8 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center">
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
                    <MenubarTrigger className="text-sm font-semibold uppercase tracking-[0.1em] text-gray-900 hover:text-black bg-transparent hover:bg-gray-50/50 data-[state=open]:bg-gray-50 data-[state=open]:text-black px-6 py-3 rounded-none border-b-2 border-transparent hover:border-gray-200 data-[state=open]:border-black transition-all duration-300 ease-in-out">
                      {roupasCategory.name}
                    </MenubarTrigger>
                    <MenubarContent className="min-w-[240px] bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg mt-1 p-3">
                      {roupasCategory.children.map((item, index) => (
                        <div key={item.name} className={`${index > 0 ? 'mt-3' : ''}`}>
                          <MenubarItem asChild>
                            <Link href={item.href} className="group block text-sm font-medium text-gray-900 uppercase tracking-wide hover:text-black transition-colors duration-200 pb-1">
                              {item.name}
                            </Link>
                          </MenubarItem>
                          {item.children && item.children.length > 0 && (
                            <div className="ml-2 mt-1 space-y-0.5">
                              {item.children.map((subcat) => (
                                <MenubarItem key={subcat.name} asChild>
                                  <Link href={subcat.href} className="block text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1 transition-all duration-150">
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
                    <MenubarTrigger className="text-sm font-semibold uppercase tracking-[0.1em] text-gray-900 hover:text-black bg-transparent hover:bg-gray-50/50 data-[state=open]:bg-gray-50 data-[state=open]:text-black px-6 py-3 rounded-none border-b-2 border-transparent hover:border-gray-200 data-[state=open]:border-black transition-all duration-300 ease-in-out">
                      {vestidosCategory.name}
                    </MenubarTrigger>
                    <MenubarContent className="min-w-[140px] bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg mt-1 p-2">
                      {vestidosCategory.children.map((item) => (
                        <MenubarItem key={item.name} asChild>
                          <Link href={item.href} className="block text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 px-2 py-1.5 transition-all duration-150 uppercase tracking-wide">
                            {item.name}
                          </Link>
                        </MenubarItem>
                      ))}
                    </MenubarContent>
                  </MenubarMenu>
                )}

                {/* Menu CONJUNTOS */}
                {conjuntosCategory && (
                  <MenubarMenu>
                    <MenubarTrigger className="text-sm font-semibold uppercase tracking-[0.1em] text-gray-900 hover:text-black bg-transparent hover:bg-gray-50/50 data-[state=open]:bg-gray-50 data-[state=open]:text-black px-6 py-3 rounded-none border-b-2 border-transparent hover:border-gray-200 data-[state=open]:border-black transition-all duration-300 ease-in-out">
                      {conjuntosCategory.name}
                    </MenubarTrigger>
                    <MenubarContent className="min-w-[140px] bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg mt-1 p-2">
                      {conjuntosCategory.children.map((item) => (
                        <MenubarItem key={item.name} asChild>
                          <Link href={item.href} className="block text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 px-2 py-1.5 rounded transition-all duration-150 uppercase tracking-wide">
                            {item.name}
                          </Link>
                        </MenubarItem>
                      ))}
                    </MenubarContent>
                  </MenubarMenu>
                )}

                {/* Menu MODA PRAIA */}
                {modaPraiaCategory && (
                  <MenubarMenu>
                    <MenubarTrigger className="text-sm font-semibold uppercase tracking-[0.1em] text-gray-900 hover:text-black bg-transparent hover:bg-gray-50/50 data-[state=open]:bg-gray-50 data-[state=open]:text-black px-6 py-3 rounded-none border-b-2 border-transparent hover:border-gray-200 data-[state=open]:border-black transition-all duration-300 ease-in-out">
                      {modaPraiaCategory.name}
                    </MenubarTrigger>
                    <MenubarContent className="min-w-[160px] bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg mt-1 p-2">
                      {modaPraiaCategory.children.map((item) => (
                        <MenubarItem key={item.name} asChild>
                          <Link href={item.href} className="block text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 px-2 py-1.5 transition-all duration-150 uppercase tracking-wide">
                            {item.name}
                          </Link>
                        </MenubarItem>
                      ))}
                    </MenubarContent>
                  </MenubarMenu>
                )}

                {/* Menu LOOK COMPLETO */}
                {lookCompletoCategory && (
                  <MenubarMenu>
                    <MenubarTrigger className="text-sm font-semibold uppercase tracking-[0.1em] text-gray-900 hover:text-black bg-transparent hover:bg-gray-50/50 data-[state=open]:bg-gray-50 data-[state=open]:text-black px-6 py-3 rounded-none border-b-2 border-transparent hover:border-gray-200 data-[state=open]:border-black transition-all duration-300 ease-in-out">
                      {lookCompletoCategory.name}
                    </MenubarTrigger>
                    <MenubarContent className="min-w-[140px] bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg mt-1 p-2">
                      {lookCompletoCategory.children.map((item) => (
                        <MenubarItem key={item.name} asChild>
                          <Link href={item.href} className="block text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 px-2 py-1.5 transition-all duration-150 uppercase tracking-wide">
                            {item.name}
                          </Link>
                        </MenubarItem>
                      ))}
                    </MenubarContent>
                  </MenubarMenu>
                )}
              </Menubar>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                {isSearchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar..."
                      className="w-64 px-4 py-2 text-sm border border-gray-300 focus:outline-none focus:border-gray-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="ml-2 p-2 text-gray-900 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* User Authentication */}
              <SignedOut>
                <SignInButton>
                  <button className="p-2 text-gray-900 hover:text-gray-600 transition-colors">
                    <User className="w-5 h-5" />
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-6 h-6"
                    }
                  }}
                />
              </SignedIn>

              {/* Shopping Cart */}
              <button
                onClick={handleCartClick}
                className="p-2 text-gray-900 hover:text-gray-600 transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {/* Cart count badge */}
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
