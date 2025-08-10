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
                            <Button variant="outline" className="relative">
                                <Filter className="h-4 w-4 mr-2" />
                                Filtros
                                {getActiveFiltersCount() > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-black text-white text-xs h-5 w-5 flex items-center justify-center">
                                        {getActiveFiltersCount()}
                                    </span>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-80 overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    Filtros de Produtos
                                </SheetTitle>
                                <SheetDescription>
                                    Use os filtros para encontrar exatamente o que procura
                                </SheetDescription>
                            </SheetHeader>

                            <div className="mt-6 space-y-6">
                                {/* Search */}
                                <div className="space-y-2">
                                    <Label>Buscar</Label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Buscar produtos..."
                                            value={filters.search}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                            className="pr-10"
                                        />
                                        {filters.search && (
                                            <button
                                                onClick={() => handleFilterChange('search', '')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                            >
                                                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Category */}
                                {filterData && filterData.categories.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Categoria</Label>
                                        <Select value={filters.category || 'all'} onValueChange={(value) => handleFilterChange('category', value === 'all' ? '' : value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Todas as categorias" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas as categorias</SelectItem>
                                                {filterData.categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.slug}>
                                                        {cat.name} ({cat.count})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Price Range */}
                                <div className="space-y-2">
                                    <Label>Faixa de Preço</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.minPrice}
                                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.maxPrice}
                                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Brand */}
                                {filterData && filterData.brands.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Marca</Label>
                                        <Select value={filters.brand || 'all'} onValueChange={(value) => handleFilterChange('brand', value === 'all' ? '' : value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Todas as marcas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas as marcas</SelectItem>
                                                {filterData.brands.map((brand) => (
                                                    <SelectItem key={brand} value={brand}>
                                                        {brand}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Quick Filters */}
                                <div className="space-y-3">
                                    <Label>Filtros Rápidos</Label>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={filters.inStock}
                                                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                                                className="rounded-sm"
                                            />
                                            <span className="text-sm">Apenas em estoque</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={filters.onSale}
                                                onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                                                className="rounded-sm"
                                            />
                                            <span className="text-sm">Em promoção</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Sort */}
                                <div className="space-y-2">
                                    <Label>Ordenar por</Label>
                                    <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="newest">Mais recentes</SelectItem>
                                            <SelectItem value="price-asc">Menor preço</SelectItem>
                                            <SelectItem value="price-desc">Maior preço</SelectItem>
                                            <SelectItem value="name">Nome A-Z</SelectItem>
                                            <SelectItem value="popular">Mais populares</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2 pt-4">
                                    <Button onClick={applyFilters} className="w-full bg-black hover:bg-gray-800">
                                        Aplicar Filtros
                                    </Button>
                                    {getActiveFiltersCount() > 0 && (
                                        <Button onClick={clearFilters} variant="outline" className="w-full">
                                            Limpar Filtros
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
                                className="pl-10 w-64"
                                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                            />
                        </div>
                        <Button onClick={applyFilters} size="sm">
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
                        className="bg-black hover:bg-gray-800 border-black"
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="bg-black hover:bg-gray-800 border-black"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
