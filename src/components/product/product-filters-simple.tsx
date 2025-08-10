'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Search, X, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

interface FilterData {
    categories: Array<{ id: string; name: string; slug: string; count: number }>;
    brands: string[];
    materials: string[];
    seasons: string[];
    genders: string[];
    priceRange: { min: number; max: number };
}

export function ProductFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [filterData, setFilterData] = useState<FilterData | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Filter states
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        brand: searchParams.get('brand') || '',
        material: searchParams.get('material') || '',
        season: searchParams.get('season') || '',
        gender: searchParams.get('gender') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        inStock: searchParams.get('inStock') === 'true',
        onSale: searchParams.get('onSale') === 'true',
        sortBy: searchParams.get('sortBy') || 'newest'
    });

    // Load filter data
    useEffect(() => {
        const loadFilterData = async () => {
            try {
                const response = await fetch('/api/products/filters');
                const data = await response.json();
                setFilterData(data);
            } catch (error) {
                console.error('Erro ao carregar filtros:', error);
            }
        };
        loadFilterData();
    }, []);

    // Apply filters
    const applyFilters = () => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== '' && !(typeof value === 'boolean' && !value)) {
                params.set(key, value.toString());
            }
        });

        const newURL = `/produtos${params.toString() ? `?${params.toString()}` : ''}`;
        router.push(newURL);
        setIsSheetOpen(false);
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({
            search: '',
            category: '',
            brand: '',
            material: '',
            season: '',
            gender: '',
            minPrice: '',
            maxPrice: '',
            inStock: false,
            onSale: false,
            sortBy: 'newest'
        });
        router.push('/produtos');
        setIsSheetOpen(false);
    };

    const handleFilterChange = (key: string, value: string | boolean) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.category) count++;
        if (filters.brand) count++;
        if (filters.material) count++;
        if (filters.season) count++;
        if (filters.gender) count++;
        if (filters.minPrice) count++;
        if (filters.maxPrice) count++;
        if (filters.inStock) count++;
        if (filters.onSale) count++;
        return count;
    };

    return (
        <div className="mb-6">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white border border-gray-200 rounded-sm shadow-sm">
                <div className="flex items-center gap-4">
                    {/* Mobile Filter Button */}
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="relative border-gray-300 hover:border-black hover:text-black transition-all duration-300">
                                <Filter className="h-4 w-4 mr-2" />
                                Filtros
                                {getActiveFiltersCount() > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-black text-white text-xs h-5 w-5 flex items-center justify-center">
                                        {getActiveFiltersCount()}
                                    </span>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[90vw] sm:w-96 max-w-md overflow-y-auto p-0 bg-white">
                            <div className="h-full flex flex-col">
                                <SheetHeader className="px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                                    <SheetTitle className="flex items-center gap-3 text-lg font-medium tracking-wide text-black">
                                        <Filter className="h-5 w-5" />
                                        FILTROS DE PRODUTOS
                                    </SheetTitle>
                                    <SheetDescription className="text-sm text-gray-600 mt-1">
                                        Use os filtros para encontrar exatamente o que procura
                                    </SheetDescription>
                                </SheetHeader>

                                <div className="flex-1 px-6 py-6 space-y-8 bg-gray-50/30">
                                    {/* Search */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium text-black uppercase tracking-wider">Buscar</Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                type="text"
                                                placeholder="Buscar produtos..."
                                                value={filters.search}
                                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                                className="pl-10 border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200"
                                            />
                                            {filters.search && (
                                                <button
                                                    onClick={() => handleFilterChange('search', '')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-gray-100 p-1 transition-colors"
                                                >
                                                    <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Category */}
                                    {filterData && filterData.categories.length > 0 && (
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-black uppercase tracking-wider">Categoria</Label>
                                            <Select value={filters.category || 'all'} onValueChange={(value) => handleFilterChange('category', value === 'all' ? '' : value)}>
                                                <SelectTrigger className="border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200">
                                                    <SelectValue placeholder="Todas as categorias" />
                                                </SelectTrigger>
                                                <SelectContent className=" border-gray-200">
                                                    <SelectItem value="all" className="font-medium">Todas as categorias</SelectItem>
                                                    {filterData.categories.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.slug} className="flex justify-between">
                                                            <span>{cat.name}</span>
                                                            <span className="text-xs text-gray-400 ml-2">({cat.count})</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Price Range */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium text-black uppercase tracking-wider">Faixa de Preço</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-xs text-gray-500">Mínimo</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="R$ 0"
                                                    value={filters.minPrice}
                                                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                                    className="border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 "
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-gray-500">Máximo</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="R$ 999"
                                                    value={filters.maxPrice}
                                                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                                    className="border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 "
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Brand */}
                                    {filterData && filterData.brands.length > 0 && (
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-black uppercase tracking-wider">Marca</Label>
                                            <Select value={filters.brand || 'all'} onValueChange={(value) => handleFilterChange('brand', value === 'all' ? '' : value)}>
                                                <SelectTrigger className="border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 ">
                                                    <SelectValue placeholder="Todas as marcas" />
                                                </SelectTrigger>
                                                <SelectContent className=" border-gray-200">
                                                    <SelectItem value="all" className="font-medium">Todas as marcas</SelectItem>
                                                    {filterData.brands.map((brand) => (
                                                        <SelectItem key={brand} value={brand}>
                                                            {brand}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Material */}
                                    {filterData && filterData.materials.length > 0 && (
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-black uppercase tracking-wider">Material</Label>
                                            <Select value={filters.material || 'all'} onValueChange={(value) => handleFilterChange('material', value === 'all' ? '' : value)}>
                                                <SelectTrigger className="border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 ">
                                                    <SelectValue placeholder="Todos os materiais" />
                                                </SelectTrigger>
                                                <SelectContent className=" border-gray-200">
                                                    <SelectItem value="all" className="font-medium">Todos os materiais</SelectItem>
                                                    {filterData.materials.map((material) => (
                                                        <SelectItem key={material} value={material}>
                                                            {material}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Season & Gender */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Season */}
                                        {filterData && filterData.seasons.length > 0 && (
                                            <div className="space-y-3">
                                                <Label className="text-sm font-medium text-black uppercase tracking-wider">Estação</Label>
                                                <Select value={filters.season || 'all'} onValueChange={(value) => handleFilterChange('season', value === 'all' ? '' : value)}>
                                                    <SelectTrigger className="border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 ">
                                                        <SelectValue placeholder="Todas" />
                                                    </SelectTrigger>
                                                    <SelectContent className=" border-gray-200">
                                                        <SelectItem value="all" className="font-medium">Todas</SelectItem>
                                                        {filterData.seasons.map((season) => (
                                                            <SelectItem key={season} value={season}>
                                                                {season}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {/* Gender */}
                                        {filterData && filterData.genders.length > 0 && (
                                            <div className="space-y-3">
                                                <Label className="text-sm font-medium text-black uppercase tracking-wider">Gênero</Label>
                                                <Select value={filters.gender || 'all'} onValueChange={(value) => handleFilterChange('gender', value === 'all' ? '' : value)}>
                                                    <SelectTrigger className="border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 ">
                                                        <SelectValue placeholder="Todos" />
                                                    </SelectTrigger>
                                                    <SelectContent className=" border-gray-200">
                                                        <SelectItem value="all" className="font-medium">Todos</SelectItem>
                                                        {filterData.genders.map((gender) => (
                                                            <SelectItem key={gender} value={gender}>
                                                                {gender}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Filters */}
                                    <div className="space-y-4">
                                        <Label className="text-sm font-medium text-black uppercase tracking-wider">Filtros Rápidos</Label>
                                        <div className="space-y-4">
                                            <label className="flex items-center space-x-3 cursor-pointer group">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.inStock}
                                                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-5 h-5 border-2 transition-all duration-200 ${filters.inStock
                                                        ? 'bg-black border-black'
                                                        : 'border-gray-300 group-hover:border-gray-400'
                                                        }`}>
                                                        {filters.inStock && (
                                                            <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-700 group-hover:text-black transition-colors">Apenas em estoque</span>
                                            </label>
                                            <label className="flex items-center space-x-3 cursor-pointer group">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.onSale}
                                                        onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-5 h-5 border-2 transition-all duration-200 ${filters.onSale
                                                        ? 'bg-black border-black'
                                                        : 'border-gray-300 group-hover:border-gray-400'
                                                        }`}>
                                                        {filters.onSale && (
                                                            <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-700 group-hover:text-black transition-colors">Em promoção</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Sort */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium text-black uppercase tracking-wider">Ordenar por</Label>
                                        <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                                            <SelectTrigger className="border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 ">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className=" border-gray-200">
                                                <SelectItem value="newest">Mais recentes</SelectItem>
                                                <SelectItem value="price-asc">Menor preço</SelectItem>
                                                <SelectItem value="price-desc">Maior preço</SelectItem>
                                                <SelectItem value="name">Nome A-Z</SelectItem>
                                                <SelectItem value="popular">Mais populares</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Action Buttons - Fixed at bottom */}
                                <div className="px-6 py-4 bg-white border-t border-gray-100 sticky bottom-0 space-y-3">
                                    <Button
                                        onClick={applyFilters}
                                        className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 tracking-wider uppercase transition-all duration-300 transform hover:scale-[1.02] "
                                    >
                                        Aplicar Filtros
                                    </Button>
                                    {getActiveFiltersCount() > 0 && (
                                        <Button
                                            onClick={clearFilters}
                                            variant="outline"
                                            className="w-full border-gray-300 hover:border-black hover:text-black transition-all duration-300 "
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Limpar Filtros ({getActiveFiltersCount()})
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Quick Search - Desktop */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Buscar produtos..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="pl-10 w-64 border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 "
                                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                            />
                        </div>
                        <Button onClick={applyFilters} size="sm" className="bg-black hover:bg-gray-800 ">
                            Buscar
                        </Button>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="bg-black hover:bg-gray-800 border-black "
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="bg-black hover:bg-gray-800 border-black "
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
