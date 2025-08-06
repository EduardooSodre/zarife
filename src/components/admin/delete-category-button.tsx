'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteCategoryButtonProps {
  categoryId: string;
  categoryName: string;
  hasProducts: boolean;
}

export function DeleteCategoryButton({ categoryId, categoryName, hasProducts }: DeleteCategoryButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (hasProducts) {
      alert('Não é possível deletar uma categoria que possui produtos. Remova os produtos primeiro.');
      return;
    }

    if (!confirm(`Tem certeza que deseja deletar a categoria "${categoryName}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar categoria');
      }
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      alert('Erro ao deletar categoria. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-12 text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={handleDelete}
      disabled={isDeleting}
      title={hasProducts ? 'Categoria possui produtos' : 'Deletar categoria'}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
