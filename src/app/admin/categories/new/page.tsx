'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewCategoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/categories');
        router.refresh();
      } else {
        throw new Error('Erro ao criar categoria');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao criar categoria. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/categories">
              <Button variant="outline">← Voltar</Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Nova Categoria</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criar Nova Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Categoria
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Bikinis, Maiôs, Acessórios..."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Escolha um nome descritivo para a categoria
                </p>
              </div>

              <div className="flex gap-4 pt-6">
                <Link href="/admin/categories">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isLoading || !formData.name.trim()}
                >
                  {isLoading ? 'Criando...' : 'Criar Categoria'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
