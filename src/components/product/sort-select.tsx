'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SortSelectProps {
  currentSortBy: string;
}

export function SortSelect({ currentSortBy }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === 'newest') {
      params.delete('sortBy');
    } else {
      params.set('sortBy', value);
    }

    router.push(`/produtos?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Ordenar por</Label>
      <Select value={currentSortBy} onValueChange={handleSortChange}>
        <SelectTrigger className="border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all duration-200 rounded-lg h-9 w-36">
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
  );
}
