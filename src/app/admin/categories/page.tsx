import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

export default async function CategoriesPage() {
    const categories = await prisma.category.findMany({
        include: {
            _count: {
                select: { products: true }
            }
        },
        orderBy: { name: "asc" },
    });

    const totalProducts = categories.reduce((acc, cat) => acc + cat._count.products, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {/* Botão de retorno */}
                <div className="mb-6">
                    <Link href="/admin" className="inline-block">
                        <Button variant="outline" className="flex items-center gap-2 cursor-pointer w-auto">
                            <ArrowLeft className="w-4 h-4" />
                            Voltar ao Painel
                        </Button>
                    </Link>
                </div>

                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-3xl font-bold text-gray-900">Gestão de Categorias</h1>
                    <Link href="/admin/categories/new" className="inline-block">
                        <Button className="cursor-pointer w-auto">+ Nova Categoria</Button>
                    </Link>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-medium text-gray-700">Total de Categorias</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">{categories.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-medium text-gray-700">Total de Produtos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{totalProducts}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Lista de Categorias */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-gray-900">Todas as Categorias</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {categories.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>Nenhuma categoria encontrada.</p>
                                <Link href="/admin/categories/new" className="inline-block mt-4">
                                    <Button>Criar primeira categoria</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {category.name}
                                                </h3>
                                                <Badge variant="secondary">
                                                    {category._count.products} produto{category._count.products !== 1 ? 's' : ''}
                                                </Badge>
                                            </div>
                                            
                                            {category.description && (
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {category.description}
                                                </p>
                                            )}
                                            
                                            <p className="text-xs text-gray-500">
                                                Slug: {category.slug}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/categories/${category.id}`}>
                                                <Button variant="outline" size="sm">
                                                    Ver
                                                </Button>
                                            </Link>
                                            <Link href={`/admin/categories/${category.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    Editar
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
