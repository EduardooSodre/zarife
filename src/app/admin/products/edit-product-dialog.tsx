"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, Tag, X, Trash2, Edit, FolderPlus } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ImageItem {
  id: string;
  url?: string;
  file: File;
  preview: string;
  order: number;
}

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  images: ImageItem[];
}

interface VariantData {
  id: string;
  size: string;
  color: string;
  stock: number;
  images: Array<{ id: string; url: string; order: number }>;
}

interface Product {
  id: string;
  name: string;
  description?: string | null;
  additionalDescriptions?: Array<{ title: string; content: string }> | null;
  price: number;
  categoryId: string;
  isActive: boolean;
  isFeatured?: boolean;
  isOnSale: boolean;
  salePercentage?: number | null;
  material?: string | null;
  brand?: string | null;
  season?: string | null;
  variants?: VariantData[];
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
  const [sizes, setSizes] = useState<string[]>([]);
  const [collections, setCollections] = useState<Array<{ id: string; name: string }>>([]);
  const [promotions, setPromotions] = useState<Array<{ id: string; name: string }>>([]);
  const [showNewCollectionDialog, setShowNewCollectionDialog] = useState(false);
  const [newCollectionForm, setNewCollectionForm] = useState({ name: '', description: '' });
  const [activeVariantTab, setActiveVariantTab] = useState<string>("0");

  const [additionalDescriptions, setAdditionalDescriptions] = useState<Array<{ title: string; content: string }>>([]);
  const [newDescTitle, setNewDescTitle] = useState('');
  const [newDescContent, setNewDescContent] = useState('');

  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    price: product.price.toString(),
    categoryId: product.categoryId,
    isActive: product.isActive,
    isFeatured: product.isFeatured || false,
    isOnSale: product.isOnSale,
    salePercentage: product.salePercentage?.toString() || '',
    material: product.material || '',
    brand: product.brand || '',
    season: product.season || '',
    collectionId: '',
    promotionId: '',
  });
  const [collectionEnabled, setCollectionEnabled] = useState<boolean>(() => false);

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newVariant, setNewVariant] = useState({
    size: '',
    color: '',
    stock: '0'
  });
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [showNewColorDialog, setShowNewColorDialog] = useState(false);
  const [newColorName, setNewColorName] = useState('');

  useEffect(() => {
    if (!open) return;

    async function fetchData() {
      try {
        const categoriesResponse = await fetch('/api/categories/for-products');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.all || []);
        }

        const seasonsResponse = await fetch('/api/seasons');
        if (seasonsResponse.ok) {
          const seasonsData = await seasonsResponse.json();
          setSeasons(seasonsData.data.map((s: { name: string }) => s.name));
        }

        const sizesResponse = await fetch('/api/sizes');
        if (sizesResponse.ok) {
          const sizesData = await sizesResponse.json();
          setSizes(sizesData.data.map((s: { name: string }) => s.name));
        }

        try {
          const colorsResponse = await fetch('/api/colors');
          if (colorsResponse.ok) {
            const colorsData = await colorsResponse.json();
            setAvailableColors(colorsData.data || []);
          }
        } catch (err) {
          console.error('Erro ao buscar cores:', err);
        }

        // Buscar coleções e promoções
        try {
          const [colsResp, promosResp] = await Promise.all([
            fetch('/api/collections'),
            fetch('/api/promotions'),
          ]);
          if (colsResp.ok) {
            const data = await colsResp.json();
            setCollections(data.data || []);
          }
          if (promosResp.ok) {
            const data = await promosResp.json();
            setPromotions(data.data || []);
          }
        } catch (err) {
          console.error('Erro ao buscar coleções/promos:', err);
        }

        const productResponse = await fetch(`/api/products/${product.id}`);
        if (productResponse.ok) {
          const productData = await productResponse.json();
          const fullProduct = productData.data;

          if (fullProduct.additionalDescriptions && Array.isArray(fullProduct.additionalDescriptions)) {
            setAdditionalDescriptions(fullProduct.additionalDescriptions);
          }

          if (fullProduct.variants && Array.isArray(fullProduct.variants)) {
            const loadedVariants: ProductVariant[] = fullProduct.variants.map((v: VariantData) => ({
              id: v.id,
              size: v.size,
              color: v.color,
              stock: v.stock,
              images: v.images.map((img: { id: string; url: string; order: number }) => ({
                id: img.id,
                url: img.url,
                file: new File([], img.url),
                preview: img.url,
                order: img.order,
              })),
            }));
            setVariants(loadedVariants);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    }

    fetchData();
  }, [open, product.id]);

  // When isOnSale switches on and a salePercentage is present, ensure a promotion exists or is selected
  useEffect(() => {
    const ensurePromotion = async () => {
      if (!open) return; // only run when dialog is open
      if (!formData.isOnSale) return;
      const pct = parseInt(String(formData.salePercentage));
      if (isNaN(pct)) return;

      // check currently loaded promotions first
      const already = promotions.find((p: any) => {
        try { return p.discountType === 'PERCENT' && Number(p.value) === pct; } catch { return false; }
      });

      if (already) {
        setFormData((prev) => ({ ...prev, promotionId: already.id }));
        return;
      }

      try {
        const resp = await fetch('/api/promotions');
        let promos = [];
        if (resp.ok) {
          const data = await resp.json();
          promos = data.data || [];
          setPromotions(promos);
        }

        const found = promos.find((p: any) => {
          try { return (p.discountType === 'PERCENT') && Number(p.value) === pct; } catch { return false; }
        });

        if (found) {
          setFormData((prev) => ({ ...prev, promotionId: found.id }));
          return;
        }

        // create automatically
        const name = `SALDOS ${pct}%`;
        const createResp = await fetch('/api/promotions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, discountType: 'PERCENT', value: pct }),
        });
        if (createResp.ok) {
          const created = await createResp.json();
          setPromotions((prev) => [created.data, ...(prev || [])]);
          setFormData((prev) => ({ ...prev, promotionId: created.data.id }));
        }
      } catch (err) {
        console.error('Erro ao garantir promoção:', err);
      }
    };

    ensurePromotion();
    // include promotions in deps so we can reuse loaded list
  }, [formData.isOnSale, formData.salePercentage, promotions, open]);

  // Calcular preço com desconto
  const calculateSalePrice = () => {
    if (!formData.isOnSale || !formData.price || !formData.salePercentage) {
      return null;
    }
    const price = parseFloat(formData.price);
    const percentage = parseInt(formData.salePercentage);
    if (isNaN(price) || isNaN(percentage) || percentage < 0 || percentage > 100) {
      return null;
    }
    return (price * (1 - percentage / 100)).toFixed(2);
  };

  const salePrice = calculateSalePrice();

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

  const addVariant = () => {
    if (!newVariant.size || !newVariant.color) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione tamanho e cor para a variante",
      });
      return;
    }

    const exists = variants.some(v => v.size === newVariant.size && v.color === newVariant.color);
    if (exists) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Já existe uma variante com esse tamanho e cor",
      });
      return;
    }

    const variant: ProductVariant = {
      id: `temp-${Date.now()}`,
      size: newVariant.size,
      color: newVariant.color,
      stock: parseInt(newVariant.stock) || 0,
      images: []
    };

    setVariants([...variants, variant]);
    setNewVariant({ size: '', color: '', stock: '0' });
    setActiveVariantTab(variants.length.toString());
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
    setActiveVariantTab("0");
  };

  const updateVariantImages = (variantId: string, images: ImageItem[]) => {
    setVariants(variants.map(v =>
      v.id === variantId ? { ...v, images } : v
    ));
  };

  const updateVariantStock = (variantId: string, stock: number) => {
    setVariants(variants.map(v =>
      v.id === variantId ? { ...v, stock } : v
    ));
  };

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

    if (variants.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "Adicione pelo menos uma variante (tamanho + cor)",
      });
      return;
    }

    setLoading(true);

    try {
      const variantsWithUploadedImages = await Promise.all(
        variants.map(async (variant) => {
          const uploadedImages = await Promise.all(
            variant.images.map(async (image) => {
              if (image.url && !image.url.startsWith('blob:')) {
                return { url: image.url, order: image.order };
              }

              const formData = new FormData();
              formData.append('file', image.file);

              const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
              });

              if (!uploadResponse.ok) {
                throw new Error('Falha no upload de imagem');
              }

              const uploadData = await uploadResponse.json();
              return { url: uploadData.url, publicId: uploadData.publicId, order: image.order };
            })
          );

          return {
            id: variant.id.startsWith('temp-') ? undefined : variant.id,
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
            images: uploadedImages,
          };
        })
      );

      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          isFeatured: formData.isFeatured,
          isOnSale: formData.isOnSale,
          salePercentage: formData.isOnSale && formData.salePercentage ? parseInt(formData.salePercentage) : null,
          material: formData.material || null,
          brand: formData.brand || null,
          season: formData.season || null,
          additionalDescriptions: additionalDescriptions.length > 0 ? additionalDescriptions : null,
          variants: variantsWithUploadedImages,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar produto');
      }

      setOpen(false);
      onUpdated?.();
      toast({
        title: "Produto atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
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

  const handleCreateCollection = async () => {
    if (!newCollectionForm.name.trim()) return toast({ variant: 'destructive', title: 'Erro', description: 'Nome da coleção é obrigatório' });

    try {
      const resp = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCollectionForm.name, description: newCollectionForm.description }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Erro ao criar coleção');
      }

      const result = await resp.json();
      const colsResp = await fetch('/api/collections');
      if (colsResp.ok) {
        const data = await colsResp.json();
        setCollections(data.data || []);
      }

      setFormData({ ...formData, collectionId: result.data.id });
      setNewCollectionForm({ name: '', description: '' });
      setShowNewCollectionDialog(false);
      toast({ title: 'Coleção criada', description: 'Coleção criada com sucesso.' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: err instanceof Error ? err.message : 'Erro ao criar coleção' });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="h-8 px-2 cursor-pointer">
            <Edit className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl font-bold">Editar Produto</DialogTitle>
            <p className="text-sm text-gray-500">Modifique os dados do produto e suas variantes</p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-8 py-4">
            {/* Seção: Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2 lg:col-span-2">
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

                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="description" className="text-sm font-medium">Descrição Geral</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Descreva o produto, detalhes, características especiais..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Descrições Adicionais - Para Conjuntos */}
                <div className="space-y-3 lg:col-span-2 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Descrições Adicionais (Opcional)</Label>
                      <p className="text-xs text-gray-500 mt-1">
                        Ideal para conjuntos: adicione descrição específica para cada peça (ex: Blusa, Saia)
                      </p>
                    </div>
                  </div>

                  {/* Adicionar nova descrição */}
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="space-y-2">
                      <Label htmlFor="descTitle" className="text-xs font-medium">Título da Seção</Label>
                      <Input
                        id="descTitle"
                        value={newDescTitle}
                        onChange={(e) => setNewDescTitle(e.target.value)}
                        placeholder="Ex: DESCRIÇÃO DA BLUSA, DESCRIÇÃO DA SAIA..."
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descContent" className="text-xs font-medium">Conteúdo</Label>
                      <Textarea
                        id="descContent"
                        value={newDescContent}
                        onChange={(e) => setNewDescContent(e.target.value)}
                        placeholder="Descreva os detalhes desta peça específica..."
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

                  {/* Lista de descrições adicionadas */}
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
              </div>

              {/* Categoria e Estação na mesma linha - 50% cada */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId" className="text-sm font-medium">Categoria *</Label>
                  <div className="flex gap-2">
                    <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                      <SelectTrigger className="h-11 border-2 border-gray-300 bg-white focus:border-black flex-1">
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
                                  <SelectItem key={subcategory.id} value={subcategory.id} className="ml-4">
                                    └─ {subcategory.name}
                                  </SelectItem>
                                ))}
                            </div>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
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

              {/* Marca e Material na mesma linha */}
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

            {/* Coleção e Promoção: moved to final settings area */}

            {/* Seção: Preços e Promoções */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Preços e Promoções</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <p className="text-xs text-gray-500">Este é o preço sem desconto</p>
                </div>
              </div>

              {/* Seção de Saldo/Promoção */}
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
                          // Validar que o desconto está entre 1 e 99
                          if (value === '' || (percentage >= 1 && percentage <= 99)) {
                            handleChange(e);
                          }
                        }}
                        placeholder="Ex: 20 para 20% de desconto"
                        required={formData.isOnSale}
                        className="h-11"
                      />
                      <p className="text-xs text-amber-700">Desconto de 1% a 99%</p>
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

            {/* Seção: Variantes (Tamanhos e Cores) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Variantes (Tamanhos e Cores) *</h3>

              {/* Adicionar nova variante */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 space-y-3 hover:border-gray-400 transition-colors">
                <Label className="text-sm font-medium">Adicionar Nova Variante</Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700">Tamanho *</Label>
                    <div className="flex gap-2">
                      <Select value={newVariant.size} onValueChange={(value) => setNewVariant({ ...newVariant, size: value })}>
                        <SelectTrigger className="bg-white border-2 border-gray-300 focus:border-black h-10">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {sizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700">Cor *</Label>
                    <div className="flex gap-2">
                      <Select value={newVariant.color} onValueChange={(value) => setNewVariant({ ...newVariant, color: value })}>
                        <SelectTrigger className="bg-white border-2 border-gray-300 focus:border-black h-10">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableColors.map((color) => (
                            <div key={color} className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded group">
                              <SelectItem value={color} className="flex-1 cursor-pointer border-0">
                                {color}
                              </SelectItem>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 flex-shrink-0 border-2 border-gray-300 hover:border-black hover:bg-gray-50"
                              onClick={() => setShowNewColorDialog(true)}
                            >
                              <FolderPlus className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Criar nova cor</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700">Estoque (unidades)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newVariant.stock}
                      onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                      className="h-10"
                    />
                  </div>

                  <Button type="button" onClick={addVariant} className="h-10 bg-black hover:bg-gray-800 text-white font-medium">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Lista de variantes com imagens */}
              {variants.length > 0 ? (
                <Tabs value={activeVariantTab} onValueChange={setActiveVariantTab} className="w-full">
                  <TabsList className="w-full flex flex-wrap gap-2 bg-transparent h-auto p-0">
                    {variants.map((variant, index) => (
                      <TabsTrigger
                        key={variant.id}
                        value={index.toString()}
                        className="px-4 py-2.5 rounded-lg font-medium transition-all
                                                data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-lg
                                                data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 data-[state=inactive]:hover:bg-gray-100
                                                border-2 data-[state=active]:border-black data-[state=inactive]:border-gray-300"
                      >
                        <span className="text-sm">{variant.size}</span>
                        <span className="mx-1.5">•</span>
                        <span className="text-sm">{variant.color}</span>
                        {variant.images.length > 0 && (
                          <span className="ml-2 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                            {variant.images.length}
                          </span>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {variants.map((variant, index) => (
                    <TabsContent key={variant.id} value={index.toString()} className="space-y-4 mt-4">
                      <div className="border-2 border-gray-200 rounded-lg p-5 space-y-4 bg-white shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {variant.size} - {variant.color}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Estoque: {variant.stock} unidades
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeVariant(variant.id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Remover
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label>Estoque desta variante</Label>
                          <Input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => updateVariantStock(variant.id, parseInt(e.target.value) || 0)}
                            min="0"
                          />
                        </div>

                        <ImageUploader
                          images={variant.images}
                          onChange={(images) => updateVariantImages(variant.id, images)}
                          maxImages={5}
                          label={`Imagens - ${variant.size} ${variant.color}`}
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <div className="max-w-sm mx-auto space-y-3">
                    <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                      <Tag className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-gray-700">Nenhuma variante adicionada</h4>
                    <p className="text-sm text-gray-500">
                      Adicione pelo menos uma combinação de tamanho e cor com suas respectivas imagens.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Seção: Configurações Finais */}
            <div className="space-y-4 border-t-2 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <div>
                    <Label htmlFor="isActive" className="text-base font-semibold cursor-pointer">Produto Ativo</Label>
                    <p className="text-xs text-gray-500">Produto visível na loja</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                    className="data-[state=checked]:bg-yellow-600"
                  />
                  <div>
                    <Label htmlFor="isFeatured" className="text-base font-semibold cursor-pointer">Produto Destaque</Label>
                    <p className="text-xs text-gray-500">Exibir na página inicial e seções especiais</p>
                  </div>
                </div>
              </div>

              {/* Coleção: switch colocado abaixo de Produto Destaque conforme solicitado */}
              <div className="mt-3">
                <div className="flex items-center gap-3">
                  <Switch id="collectionEnabled" checked={collectionEnabled} onCheckedChange={(checked) => {
                    setCollectionEnabled(checked as boolean);
                    if (!checked) setFormData(prev => ({ ...prev, collectionId: '' }));
                  }} />
                  <div>
                    <Label className="text-base font-semibold cursor-pointer">Coleção (opcional)</Label>
                    <p className="text-xs text-gray-500">Associar a uma coleção personalizada</p>
                  </div>
                </div>
                {collectionEnabled && (
                  <div className="mt-2 flex gap-2 items-center">
                    <Select value={formData.collectionId} onValueChange={(value) => setFormData({ ...formData, collectionId: value === 'none' ? '' : value })}>
                      <SelectTrigger className="h-11 bg-white border-2 border-gray-300 focus:border-black flex-1">
                        <SelectValue placeholder="Selecione uma coleção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {collections.map((col) => (
                          <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button type="button" variant="outline" size="icon" className="h-11 w-11" onClick={() => setShowNewCollectionDialog(true)}>
                            <FolderPlus className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Criar nova coleção</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>

              {/* Coleção e Promoção - colocadas aqui junto aos switches */}
              <div className="mt-3">
                <p className="text-xs text-gray-500">Promoções são gerenciadas via o switch &quot;Produto em Promoção&quot; e o percentual de desconto.</p>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3 pt-6 border-t-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-8 bg-black hover:bg-gray-800 text-white font-semibold"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? 'Atualizando...' : 'Atualizar Produto'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para criar nova cor */}
      <Dialog open={showNewColorDialog} onOpenChange={setShowNewColorDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Cor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newColorName">Nome da Cor *</Label>
              <Input
                id="newColorName"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="Ex: Verde Claro, Azul Marinho..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const normalized = newColorName.trim();
                    if (!normalized) return;
                    if (!availableColors.includes(normalized)) {
                      setAvailableColors([...availableColors, normalized].sort((a, b) => a.localeCompare(b)));
                    }
                    setNewVariant({ ...newVariant, color: normalized });
                    setNewColorName('');
                    setShowNewColorDialog(false);
                  }
                }}
              />
              <p className="text-xs text-gray-500">O nome será salvo como está (considere padronizar MAIÚSCULAS/minúsculas).</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowNewColorDialog(false);
                  setNewColorName('');
                }}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={() => {
                const normalized = newColorName.trim();
                if (!normalized) return alert('Nome da cor obrigatório');
                if (!availableColors.includes(normalized)) {
                  setAvailableColors([...availableColors, normalized].sort((a, b) => a.localeCompare(b)));
                }
                setNewVariant({ ...newVariant, color: normalized });
                setNewColorName('');
                setShowNewColorDialog(false);
              }}>
                Criar Cor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Dialog para criar nova coleção */}
      <Dialog open={showNewCollectionDialog} onOpenChange={setShowNewCollectionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Coleção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newCollectionName">Nome *</Label>
              <Input
                id="newCollectionName"
                value={newCollectionForm.name}
                onChange={(e) => setNewCollectionForm({ ...newCollectionForm, name: e.target.value })}
                placeholder="Ex: Nova Coleção, Coleção Inverno..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newCollectionDescription">Descrição</Label>
              <Textarea
                id="newCollectionDescription"
                value={newCollectionForm.description}
                onChange={(e) => setNewCollectionForm({ ...newCollectionForm, description: e.target.value })}
                placeholder="Descrição (opcional)"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setShowNewCollectionDialog(false); setNewCollectionForm({ name: '', description: '' }); }}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleCreateCollection}>
                Criar Coleção
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
