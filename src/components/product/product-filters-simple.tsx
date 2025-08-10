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
    
    // Get viewMode from URL or default to grid
    const currentViewMode = (searchParams.get('viewMode') as 'grid' | 'list') || 'grid';
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(currentViewMode);

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

        // Add viewMode to params
        if (viewMode !== 'grid') {
            params.set('viewMode', viewMode);
        }

        const newURL = `/produtos${params.toString() ? `?${params.toString()}` : ''}`;
        router.push(newURL);
        setIsSheetOpen(false);
    };

    // Handle view mode change
    const handleViewModeChange = (newViewMode: 'grid' | 'list') => {
        setViewMode(newViewMode);
        const params = new URLSearchParams(searchParams.toString());
        
        // Update all current filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== '' && !(typeof value === 'boolean' && !value)) {
                params.set(key, value.toString());
            }
        });

        // Add viewMode to params
        if (newViewMode !== 'grid') {
            params.set('viewMode', newViewMode);
        } else {
            params.delete('viewMode');
        }

        const newURL = `/produtos${params.toString() ? `?${params.toString()}` : ''}`;
        router.push(newURL);
    };    // Clear filters
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
                                    <span className="absolute -top-2 -right-2 bg-black text-white text-xs h-5 w-5 flex items-center justify-center rounded-full ">
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

                                <div className="flex-1 px-6 py-4 space-y-6 bg-white">
                                    {/* Search */}
                                    <div className="space-y-3 pb-4 border-b border-gray-100">
                                        <Label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Buscar Produtos</Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                type="text"
                                                placeholder="Digite o nome do produto..."
                                                value={filters.search}
                                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                                className="pl-10 pr-10 border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 rounded-lg h-11"
                                            />
                                            {filters.search && (
                                                <button
                                                    onClick={() => handleFilterChange('search', '')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-gray-100 rounded-full p-1.5 transition-colors"
                                                >
                                                    <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Category */}
                                    {filterData && filterData.categories.length > 0 && (
                                        <div className="space-y-3 pb-4 border-b border-gray-100">
                                            <Label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Categoria</Label>
                                            <Select value={filters.category || 'all'} onValueChange={(value) => handleFilterChange('category', value === 'all' ? '' : value)}>
                                                <SelectTrigger className="border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 rounded-lg h-11">
                                                    <SelectValue placeholder="Selecione uma categoria" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-lg border-gray-200">
                                                    <SelectItem value="all" className="font-medium text-gray-900">Todas as categorias</SelectItem>
                                                    {filterData.categories.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.slug}>
                                                            <div className="flex items-center justify-between w-full">
                                                                <span>{cat.name}</span>
                                                                <span className="text-xs text-gray-400 ml-2">({cat.count})</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Price Range */}
                                    <div className="space-y-3 pb-4 border-b border-gray-100">
                                        <Label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Faixa de Preço</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-gray-500 font-medium">Valor Mínimo</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="R$ 0"
                                                    value={filters.minPrice}
                                                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                                    className="border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 rounded-lg h-11"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs text-gray-500 font-medium">Valor Máximo</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="R$ 999"
                                                    value={filters.maxPrice}
                                                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                                    className="border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 rounded-lg h-11"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Filters Grid */}
                                    <div className="space-y-4">
                                        {/* Brand */}
                                        {filterData && filterData.brands.length > 0 && (
                                            <div className="space-y-3">
                                                <Label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Marca</Label>
                                                <Select value={filters.brand || 'all'} onValueChange={(value) => handleFilterChange('brand', value === 'all' ? '' : value)}>
                                                    <SelectTrigger className="border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 rounded-lg h-11">
                                                        <SelectValue placeholder="Selecione uma marca" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-lg border-gray-200">
                                                        <SelectItem value="all" className="font-medium text-gray-900">Todas as marcas</SelectItem>
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
                                                <Label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Material</Label>
                                                <Select value={filters.material || 'all'} onValueChange={(value) => handleFilterChange('material', value === 'all' ? '' : value)}>
                                                    <SelectTrigger className="border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 rounded-lg h-11">
                                                        <SelectValue placeholder="Selecione um material" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-lg border-gray-200">
                                                        <SelectItem value="all" className="font-medium text-gray-900">Todos os materiais</SelectItem>
                                                        {filterData.materials.map((material) => (
                                                            <SelectItem key={material} value={material}>
                                                                {material}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {/* Season & Gender Grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Season */}
                                            {filterData && filterData.seasons.length > 0 && (
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Estação</Label>
                                                    <Select value={filters.season || 'all'} onValueChange={(value) => handleFilterChange('season', value === 'all' ? '' : value)}>
                                                        <SelectTrigger className="border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 rounded-lg h-10 text-sm">
                                                            <SelectValue placeholder="Todas" />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-lg border-gray-200">
                                                            <SelectItem value="all" className="font-medium text-gray-900">Todas</SelectItem>
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
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Gênero</Label>
                                                    <Select value={filters.gender || 'all'} onValueChange={(value) => handleFilterChange('gender', value === 'all' ? '' : value)}>
                                                        <SelectTrigger className="border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 rounded-lg h-10 text-sm">
                                                            <SelectValue placeholder="Todos" />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-lg border-gray-200">
                                                            <SelectItem value="all" className="font-medium text-gray-900">Todos</SelectItem>
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
                                    </div>

                                    {/* Quick Filters */}
                                    <div className="space-y-3 pb-4 border-b border-gray-100">
                                        <Label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Filtros Rápidos</Label>
                                        <div className="space-y-2">
                                            <label className="flex items-center space-x-3 cursor-pointer group hover:bg-gray-50 p-3 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.inStock}
                                                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all duration-200 ${
                                                        filters.inStock
                                                            ? 'bg-black border-black'
                                                            : 'border-gray-300 group-hover:border-gray-400'
                                                    }`}>
                                                        {filters.inStock && (
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-700 group-hover:text-black transition-colors font-medium">Apenas em estoque</span>
                                            </label>
                                            <label className="flex items-center space-x-3 cursor-pointer group hover:bg-gray-50 p-3 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.onSale}
                                                        onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all duration-200 ${
                                                        filters.onSale
                                                            ? 'bg-black border-black'
                                                            : 'border-gray-300 group-hover:border-gray-400'
                                                    }`}>
                                                        {filters.onSale && (
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-700 group-hover:text-black transition-colors font-medium">Em promoção</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Sort */}
                                    <div className="space-y-3">
                                        <Label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Ordenar por</Label>
                                        <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                                            <SelectTrigger className="border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 rounded-lg h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg border-gray-200">
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
                                        className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 tracking-wider uppercase transition-all duration-300 transform hover:scale-[1.02] rounded-lg shadow-lg hover:shadow-xl"
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
                        onClick={() => handleViewModeChange('grid')}
                        className={viewMode === 'grid' 
                            ? "bg-black hover:bg-gray-800 border-black text-white" 
                            : "border-gray-300 hover:border-black hover:text-black"
                        }
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleViewModeChange('list')}
                        className={viewMode === 'list' 
                            ? "bg-black hover:bg-gray-800 border-black text-white" 
                            : "border-gray-300 hover:border-black hover:text-black"
                        }
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
