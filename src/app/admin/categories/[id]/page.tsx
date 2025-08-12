'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Package, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  products: {
    id: string;
    name: string;
    price: number;
    stock: number;
    images: {
      url: string;
      order: number;
    }[];
  }[];
}

interface CategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories/${resolvedParams.id}`);
        if (response.ok) {
          const data = await response.json();
          setCategory(data.data);
        } else if (response.status === 404) {
          router.push('/admin/categories');
        }
      } catch (error) {
        console.error('Erro ao carregar categoria:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [resolvedParams.id, router]);

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/categories/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/categories');
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao excluir categoria');
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      alert('Erro ao excluir categoria. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>Carregando categoria...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Categoria não encontrada</h1>
          <Link href="/admin/categories">
            <Button>Voltar às Categorias</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/categories" className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{category.name}</h1>
              <p className="text-sm sm:text-base text-gray-600">Detalhes da categoria</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Dialog de edição removido pois dependia de arquivo deletado */}
            <Button
              variant="outline"
              size="sm"
              className="w-auto h-8 px-2 text-red-600 border-red-300 hover:bg-red-50 flex items-center justify-center"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Excluir categoria"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Category Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Informações da Categoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nome</label>
                  <p className="mt-1 text-gray-900">{category.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Slug</label>
                  <p className="mt-1 text-gray-600 font-mono text-sm">{category.slug}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Data de Criação</label>
                  <p className="mt-1 text-gray-600 text-sm">
                    {new Date(category.createdAt).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Última Atualização</label>
                  <p className="mt-1 text-gray-600 text-sm">
                    {new Date(category.updatedAt).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {category.products.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    {category.products.length === 1 ? 'Produto' : 'Produtos'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products in Category */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Produtos nesta Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {category.products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum produto encontrado
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Esta categoria ainda não possui produtos.
                    </p>
                    <Link href="/admin/products/new">
                      <Button>Adicionar Produto</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {category.products.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <Image
                                src={product.images[0].url}
                                alt={product.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {product.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              €{Number(product.price).toFixed(2)}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                                {product.stock > 0 ? `${product.stock} em stock` : 'Esgotado'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0">
                            <Link href={`/admin/products/${product.id}`}>
                              <Button size="sm" variant="outline">
                                Ver
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
