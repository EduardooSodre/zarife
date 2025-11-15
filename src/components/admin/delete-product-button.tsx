'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, Archive } from 'lucide-react';
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

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
  onDeleted?: () => void;
}

interface DeleteError {
  error: string;
  details?: {
    totalOrders: number;
    pendingOrders: number;
    message: string;
  };
}

export function DeleteProductButton({ productId, productName, onDeleted }: DeleteProductButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorInfo, setErrorInfo] = useState<DeleteError | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorInfo(null);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        if (data.softDelete) {
          // Produto foi movido para deletados
          alert('✅ ' + data.message);
        }
        router.refresh();
        if (onDeleted) {
          onDeleted();
        }
      } else {
        // Erro - mostrar dialog com detalhes
        setErrorInfo(data);
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      setErrorInfo({
        error: 'Erro ao conectar com o servidor',
      });
      setShowErrorDialog(true);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Dialog de confirmação de deleção */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className="inline-flex items-center justify-center h-7 sm:h-8 w-7 sm:w-8 rounded-md border border-border bg-white hover:bg-red-50 hover:text-red-600 text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50 shadow-lg"
            disabled={isDeleting}
            title="Deletar produto"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o produto &quot;{productName}&quot;?
              {/* Se não houver pedidos, deletar permanentemente. Se houver pedidos concluídos, mover para deletados */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de erro com detalhes */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
              <AlertDialogTitle>Não é Possível Deletar</AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-4">
                <p className="text-gray-700 font-medium">
                  {errorInfo?.error}
                </p>

                {errorInfo?.details && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total de pedidos:</span>
                      <span className="font-semibold text-gray-900">{errorInfo.details.totalOrders}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Pedidos pendentes:</span>
                      <span className="font-semibold text-amber-700">{errorInfo.details.pendingOrders}</span>
                    </div>
                    <p className="text-xs text-gray-600 pt-2 border-t border-amber-200">
                      {errorInfo.details.message}
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Archive className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Sugestão</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Aguarde todos os pedidos serem concluídos (status DELIVERED) para poder deletar este produto.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
