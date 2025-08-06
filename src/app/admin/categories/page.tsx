import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Eye } from 'lucide-react';

export default async function CategoriesPage() {
    // Query simplificada para evitar problemas de tipos
    const categories = await prisma.category.findMany({
        include: {
            _count: {
                select: { products: true }
            }
        },
        orderBy: { name: "asc" },
        take: 50, // Limitar a 50 categorias por vez
    });

    const totalProducts = categories.reduce((acc, cat) => acc + cat._count.products, 0);
    
    // Estatísticas simples - assumir todas ativas por enquanto
    const activeCategories = categories; // Simplificado
    const inactiveCategories: typeof categories = []; // Vazio por enquanto

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

                {/* Header */}
                <div className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-light text-black mb-4 tracking-wider uppercase">
                            Gestão de Categorias
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Gerir as categorias de produtos da Zarife
                        </p>
                    </div>
                    <Link href="/admin/categories/new" className="inline-block">
                        <Button className="bg-black hover:bg-gray-800 text-white w-auto cursor-pointer uppercase tracking-widest text-sm py-3 px-6">
                            + Nova Categoria
                        </Button>
                    </Link>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
                    <div className="bg-white p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="h-2 w-2 bg-blue-500 rounded-full mr-2 sm:mr-3"></div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Total</p>
                                <p className="text-lg sm:text-2xl font-light text-black">{categories.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="h-2 w-2 bg-green-500 rounded-full mr-2 sm:mr-3"></div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Ativas</p>
                                <p className="text-lg sm:text-2xl font-light text-black">{activeCategories.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="h-2 w-2 bg-red-500 rounded-full mr-2 sm:mr-3"></div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Inativas</p>
                                <p className="text-lg sm:text-2xl font-light text-black">{inactiveCategories.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="h-2 w-2 bg-purple-500 rounded-full mr-2 sm:mr-3"></div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">Produtos</p>
                                <p className="text-lg sm:text-2xl font-light text-black">{totalProducts}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Categorias */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Todas as Categorias</h2>
                    </div>
                    <div className="p-6">
                        {categories.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-lg mb-4">Nenhuma categoria encontrada.</p>
                                <Link href="/admin/categories/new" className="inline-block">
                                    <Button>Criar primeira categoria</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        {/* Imagem da categoria */}
                                        <div className="aspect-video bg-gray-100 relative">
                                            <div className="flex items-center justify-center h-full text-gray-400">
                                                <span className="text-sm">Categoria</span>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {category.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Slug: {category.slug}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 ml-2">
                                                    <Eye className="w-4 h-4 text-green-500" />
                                                    <Badge variant="secondary">
                                                        {category._count.products} produto{category._count.products !== 1 ? 's' : ''}
                                                    </Badge>
                                                </div>
                                            </div>
                                            
                                            {category.description && (
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {category.description}
                                                </p>
                                            )}
                                            
                                            <p className="text-xs text-gray-500 mb-4">
                                                Slug: {category.slug}
                                            </p>

                                            {/* Ações */}
                                            <div className="flex gap-2">
                                                <Link href={`/admin/categories/${category.id}`} className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Ver
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/categories/${category.id}/edit`} className="flex-1">
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <Edit className="w-4 h-4 mr-1" />
                                                        Editar
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
