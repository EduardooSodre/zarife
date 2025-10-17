"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Edit, Loader2, Tag, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  description?: string | null;
  additionalDescriptions?: Array<{ title: string; content: string }> | null;
  price: number;
  stock: number;
  categoryId: string;
  isActive: boolean;
  isOnSale: boolean;
  salePercentage?: number | null;
  material?: string | null;
  brand?: string | null;
  season?: string | null;
}

interface EditProductDialogProps {
  product: Product;
  onUpdated?: () => void;
}

export function EditProductDialog({ product, onUpdated }: EditProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    price: product.price.toString(),
    stock: product.stock.toString(),
    categoryId: product.categoryId,
    isActive: product.isActive,
    isOnSale: product.isOnSale,
    salePercentage: product.salePercentage?.toString() || '',
    material: product.material || '',
    brand: product.brand || '',
    season: product.season || '',
  });

  const [additionalDescriptions, setAdditionalDescriptions] = useState<Array<{ title: string; content: string }>>(
    product.additionalDescriptions || []
  );
  const [newDescTitle, setNewDescTitle] = useState('');
  const [newDescContent, setNewDescContent] = useState('');

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      // Buscar categorias
      const categoriesResponse = await fetch('/api/categories/for-products');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.all || []);
      }

      // Buscar estações
      const seasonsResponse = await fetch('/api/seasons');
      if (seasonsResponse.ok) {
        const seasonsData = await seasonsResponse.json();
        setSeasons(seasonsData.data.map((s: { name: string }) => s.name));
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAddDescription = () => {
    if (newDescTitle.trim() && newDescContent.trim()) {
      setAdditionalDescriptions([...additionalDescriptions, {
        title: newDescTitle.trim(),
        content: newDescContent.trim()
      }]);
      setNewDescTitle('');
      setNewDescContent('');
    }
  };

  const handleRemoveDescription = (index: number) => {
    setAdditionalDescriptions(additionalDescriptions.filter((_, i) => i !== index));
  };

  const salePrice = formData.isOnSale && formData.price && formData.salePercentage
    ? (parseFloat(formData.price) * (1 - parseInt(formData.salePercentage) / 100)).toFixed(2)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.categoryId) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "Preencha todos os campos obrigatórios",
      });
      return;
    }

    if (formData.isOnSale && (!formData.salePercentage || parseInt(formData.salePercentage) < 1 || parseInt(formData.salePercentage) > 99)) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "Porcentagem de desconto deve estar entre 1 e 99",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
          salePercentage: formData.isOnSale && formData.salePercentage ? parseInt(formData.salePercentage) : null,
          material: formData.material || null,
          brand: formData.brand || null,
          season: formData.season || null,
          additionalDescriptions: additionalDescriptions.length > 0 ? additionalDescriptions : null,
        }),
      });

      if (response.ok) {
        toast({
          title: "Produto atualizado",
          description: "As alterações foram salvas com sucesso.",
        });
        setOpen(false);
        onUpdated?.();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar produto');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 px-2 cursor-pointer">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Informações Básicas
            </h3>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Nome do Produto *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Vestido Elegante de Festa"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Descrição Geral</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descreva o produto..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Descrições Adicionais */}
            <div className="space-y-3 border-t pt-4">
              <div>
                <Label className="text-sm font-medium">Descrições Adicionais (Opcional)</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Ideal para conjuntos: adicione descrição específica para cada peça
                </p>
              </div>

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                <div className="space-y-2">
                  <Label htmlFor="descTitle" className="text-xs font-medium">Título da Seção</Label>
                  <Input
                    id="descTitle"
                    value={newDescTitle}
                    onChange={(e) => setNewDescTitle(e.target.value)}
                    placeholder="Ex: DESCRIÇÃO DA BLUSA"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descContent" className="text-xs font-medium">Conteúdo</Label>
                  <Textarea
                    id="descContent"
                    value={newDescContent}
                    onChange={(e) => setNewDescContent(e.target.value)}
                    placeholder="Descreva os detalhes..."
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddDescription}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Descrição
                </Button>
              </div>

              {additionalDescriptions.length > 0 && (
                <div className="space-y-3">
                  {additionalDescriptions.map((desc, index) => (
                    <div
                      key={index}
                      className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          <h4 className="font-semibold text-sm text-gray-900 uppercase">
                            {desc.title}
                          </h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {desc.content}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0 ml-2"
                          onClick={() => handleRemoveDescription(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Categoria e Estação */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId" className="text-sm font-medium">Categoria *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger className="h-11 border-2 border-gray-300 bg-white focus:border-black">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter(cat => !cat.slug.includes('/'))
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((category) => (
                        <div key={category.id}>
                          <SelectItem value={category.id} className="font-semibold">
                            {category.name}
                          </SelectItem>
                          {categories
                            .filter(sub => sub.slug.startsWith(`${category.slug}/`))
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((subcategory) => (
                              <SelectItem key={subcategory.id} value={subcategory.id} className="ml-4 text-gray-700">
                                └─ {subcategory.name}
                              </SelectItem>
                            ))}
                        </div>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="season" className="text-sm font-medium">Estação</Label>
                <Select value={formData.season} onValueChange={(value) => setFormData({ ...formData, season: value })}>
                  <SelectTrigger className="h-11 bg-white border-2 border-gray-300 focus:border-black">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem key={season} value={season}>
                        {season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Marca e Material */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand" className="text-sm font-medium">Marca/Coleção</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Ex: Vestido Lara..."
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="material" className="text-sm font-medium">Material/Composição</Label>
                <Input
                  id="material"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  placeholder="Ex: 100% Algodão..."
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Preços e Promoções */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Preços e Promoções</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">Preço Base *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="€ 0,00"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock" className="text-sm font-medium">Estoque</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  className="h-11"
                />
              </div>

              <div className="space-y-2 flex items-end">
                <div className="flex items-center gap-2 h-11">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive" className="text-sm cursor-pointer">Produto Ativo</Label>
                </div>
              </div>
            </div>

            {/* Promoção */}
            <div className="border-2 border-amber-200 rounded-lg p-4 space-y-4 bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="isOnSale" className="text-base font-semibold text-amber-900 cursor-pointer">
                      Produto em Promoção
                    </Label>
                    <p className="text-xs text-amber-700">Ativar desconto especial</p>
                  </div>
                </div>
                <Switch
                  id="isOnSale"
                  checked={formData.isOnSale}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    isOnSale: checked,
                    salePercentage: checked ? formData.salePercentage : ''
                  })}
                  className="data-[state=checked]:bg-amber-600"
                />
              </div>

              {formData.isOnSale && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-amber-200">
                  <div className="space-y-2">
                    <Label htmlFor="salePercentage" className="text-sm font-medium text-amber-900">Desconto (%)</Label>
                    <Input
                      id="salePercentage"
                      name="salePercentage"
                      type="number"
                      min="1"
                      max="99"
                      value={formData.salePercentage}
                      onChange={(e) => {
                        const value = e.target.value;
                        const percentage = parseInt(value);
                        if (value === '' || (percentage >= 1 && percentage <= 99)) {
                          handleChange(e);
                        }
                      }}
                      placeholder="Ex: 20 para 20% de desconto"
                      required={formData.isOnSale}
                      className="h-11"
                    />
                  </div>
                  {salePrice && formData.price && (
                    <div className="flex items-center">
                      <div className="text-sm w-full bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-600">Preço Original:</span>
                            <span className="line-through text-gray-500 font-medium">
                              € {parseFloat(formData.price).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-green-200">
                            <span className="font-bold text-green-900">Preço Final:</span>
                            <span className="text-xl font-bold text-green-700">
                              € {salePrice}
                            </span>
                          </div>
                          <p className="text-xs text-green-600 text-center pt-1">
                            Economia de {formData.salePercentage}% (€ {(parseFloat(formData.price) - parseFloat(salePrice)).toFixed(2)})
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
