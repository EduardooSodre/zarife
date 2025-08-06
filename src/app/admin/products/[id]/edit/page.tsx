'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, ArrowLeft, Palette, Ruler } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUpload } from '@/components/ui/image-upload';
import { ImageUploadGuide } from '@/components/ui/image-upload-guide';

interface ImageData {
  id: string;
  url: string;
  file?: File;
  order: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductVariant {
  size?: string;
  color?: string;
  stock: number;
}

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    oldPrice: '',
    stock: '',
    categoryId: '',
    isFeatured: false,
    isActive: true,
    material: '',
    brand: '',
    season: '',
    gender: '',
  });

  const [images, setImages] = useState<ImageData[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  
  // Opções predefinidas para loja de roupas
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '34', '36', '38', '40', '42', '44'];
  const colorOptions = ['Preto', 'Branco', 'Azul', 'Vermelho', 'Verde', 'Rosa', 'Amarelo', 'Roxo', 'Cinza', 'Bege', 'Laranja'];
  const seasonOptions = ['Primavera/Verão', 'Outono/Inverno', 'Todo o Ano'];
  const genderOptions = ['Feminino', 'Masculino', 'Unissex'];

  // Carregar categorias e produto
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar categorias
        const categoriesResponse = await fetch('/api/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }

        // Carregar produto
        const productResponse = await fetch(`/api/products/${resolvedParams.id}`);
        if (productResponse.ok) {
          const productData = await productResponse.json();
          const product = productData.data;
          
          setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            oldPrice: product.oldPrice?.toString() || '',
            stock: product.stock?.toString() || '',
            categoryId: product.categoryId || '',
            isFeatured: product.isFeatured || false,
            isActive: product.isActive !== false,
            material: product.material || '',
            brand: product.brand || '',
            season: product.season || '',
            gender: product.gender || '',
          });

          // Converter imagens para o formato esperado
          const productImages = product.images?.map((img: { id?: string; url: string; order?: number }, index: number) => ({
            id: img.id || Math.random().toString(36).substr(2, 9),
            url: img.url,
            order: img.order !== undefined ? img.order : index,
          })) || [];
          setImages(productImages);

          // Carregar variações
          setVariants(product.variants || []);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoadingProduct(false);
      }
    };
    loadData();
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const imagesData = images.map((img, index) => ({
        url: img.url,
        order: index,
      }));

      const response = await fetch(`/api/products/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
          stock: parseInt(formData.stock),
          images: imagesData,
          variants: variants,
        }),
      });

      if (response.ok) {
        router.push('/admin/products');
        router.refresh();
      } else {
        throw new Error('Erro ao atualizar produto');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao atualizar produto. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addVariant = () => {
    setVariants(prev => [...prev, { size: '', color: '', stock: 0 }]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ));
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>Carregando produto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Editar Produto</h1>
            <p className="text-sm sm:text-base text-gray-600">Atualizar informações do produto</p>
          </div>
          <Link href={`/admin/products/${resolvedParams.id}`} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors gap-2 cursor-pointer w-auto">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Produto
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Informações Básicas */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Produto *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                      placeholder="Ex: Bikini Tropical"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                      rows={4}
                      placeholder="Descrição detalhada do produto..."
                    />
                  </div>

                  <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria *
                    </label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                        Marca
                      </label>
                      <input
                        type="text"
                        id="brand"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                        placeholder="Ex: Zarife Fashion"
                      />
                    </div>

                    <div>
                      <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-2">
                        Material
                      </label>
                      <input
                        type="text"
                        id="material"
                        name="material"
                        value={formData.material}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                        placeholder="Ex: Poliéster, Algodão"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-2">
                        Temporada
                      </label>
                      <Select
                        value={formData.season}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, season: value }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione uma temporada" />
                        </SelectTrigger>
                        <SelectContent>
                          {seasonOptions.map(season => (
                            <SelectItem key={season} value={season}>
                              {season}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                        Público
                      </label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o público" />
                        </SelectTrigger>
                        <SelectContent>
                          {genderOptions.map(gender => (
                            <SelectItem key={gender} value={gender}>
                              {gender}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preços e Stock */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preços e Stock</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                        Preço Atual (€) *
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="oldPrice" className="block text-sm font-medium text-gray-700 mb-2">
                        Preço Antigo (€)
                      </label>
                      <input
                        type="number"
                        id="oldPrice"
                        name="oldPrice"
                        value={formData.oldPrice}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Base *
                      <span className="text-xs text-gray-500 ml-1">(usado se não há variações)</span>
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Variações de Produto */}
          <div className="mt-8 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Variações de Produto</h3>
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Variação
                </button>
              </div>
              
              {variants.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="flex flex-col items-center text-gray-500">
                    <div className="flex space-x-2 mb-2">
                      <Ruler className="w-6 h-6" />
                      <Palette className="w-6 h-6" />
                    </div>
                    <p className="text-sm">Nenhuma variação adicionada</p>
                    <p className="text-xs">Adicione tamanhos e cores para diferentes variações do produto</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {variants.map((variant, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Tamanho
                        </label>
                        <Select
                          value={variant.size || ''}
                          onValueChange={(value) => updateVariant(index, 'size', value)}
                        >
                          <SelectTrigger className="w-full h-8">
                            <SelectValue placeholder="Selecionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {sizeOptions.map(size => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Cor
                        </label>
                        <Select
                          value={variant.color || ''}
                          onValueChange={(value) => updateVariant(index, 'color', value)}
                        >
                          <SelectTrigger className="w-full h-8">
                            <SelectValue placeholder="Selecionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map(color => (
                              <SelectItem key={color} value={color}>
                                {color}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Stock
                        </label>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 h-8 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-transparent"
                          min="0"
                          placeholder="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Ação
                        </label>
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="w-full h-8 px-3 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Imagens do Produto */}
          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Imagens do Produto</h3>
              <ImageUploadGuide />
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                maxImages={6}
              />
            </div>
          </div>

          {/* Configurações */}
          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isFeatured: !!checked }))
                    }
                  />
                  <label 
                    htmlFor="isFeatured"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Produto em Destaque
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isActive: !!checked }))
                    }
                  />
                  <label 
                    htmlFor="isActive"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Produto Ativo
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
              <Link href={`/admin/products/${resolvedParams.id}`} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </Link>
              <button 
                type="submit" 
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'A Atualizar...' : 'Atualizar Produto'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
