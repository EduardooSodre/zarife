import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      products: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Categorias</h1>
          <Link href="/admin/categories/new">
            <Button>+ Nova Categoria</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
              <div className="text-sm text-gray-600">Total de Categorias</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">
                {categories.reduce((acc, cat) => acc + cat.products.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total de Produtos</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">
                {categories.filter(cat => cat.products.length > 0).length}
              </div>
              <div className="text-sm text-gray-600">Categorias Ativas</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  {category.products.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        {category.products.length} produto(s)
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {category.products.slice(0, 3).map((product) => (
                          <div
                            key={product.id}
                            className="bg-gray-100 rounded p-2 text-xs text-center"
                          >
                            {product.name.length > 15 
                              ? `${product.name.substring(0, 15)}...` 
                              : product.name
                            }
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <span className="text-gray-500">Nenhum produto nesta categoria</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/admin/categories/${category.id}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      Ver Detalhes
                    </Button>
                  </Link>
                  <Link href={`/admin/categories/${category.id}/edit`}>
                    <Button size="sm" className="flex-1">
                      Editar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏷️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma categoria encontrada</h3>
            <p className="text-gray-600 mb-6">Comece por criar categorias para organizar os seus produtos.</p>
            <Link href="/admin/categories/new">
              <Button>Criar Primeira Categoria</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
