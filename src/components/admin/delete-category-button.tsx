'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


interface DeleteCategoryButtonProps {
  categoryId: string;
  categoryName: string;
  hasProducts: boolean;
  onDeleted?: () => void;
}

export function DeleteCategoryButton({ categoryId, categoryName, hasProducts, onDeleted }: DeleteCategoryButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (hasProducts) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (onDeleted) {
          onDeleted();
        } else {
          router.refresh();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar categoria');
      }
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (hasProducts) {
    return (
      <div
        className="flex items-center justify-center w-12 h-9 rounded-md border border-border bg-background text-gray-400 cursor-not-allowed"
        title="Categoria possui produtos"
      >
        <Trash2 className="w-4 h-4" />
      </div>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="flex items-center justify-center w-12 h-9 rounded-md border border-border bg-background text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
          disabled={isDeleting}
          title="Deletar categoria"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deletar Categoria</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja deletar a categoria &quot;{categoryName}&quot;? Esta ação não é possível reverter.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='cursor-pointer'>Cancelar</AlertDialogCancel>
          <AlertDialogAction className='cursor-pointer' onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deletando...' : 'Deletar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
