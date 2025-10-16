"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, Tag, X, FolderPlus, Trash2, Upload } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { convertToBase64 } from "@/lib/upload";

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

interface NewProductDialogProps {
    onCreated?: () => void;
    buttonText?: string;
    buttonClassName?: string;
}

export function NewProductDialog({ onCreated, buttonText = "Novo Produto", buttonClassName }: NewProductDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [seasons, setSeasons] = useState<string[]>(['Primavera', 'Verão', 'Outono', 'Inverno', 'Atemporal']);
    const [sizes, setSizes] = useState<string[]>(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
    const [activeVariantTab, setActiveVariantTab] = useState<string>("0");
    const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
    const [showNewSeasonDialog, setShowNewSeasonDialog] = useState(false);
    const [showNewSizeDialog, setShowNewSizeDialog] = useState(false);
    const [newCategoryForm, setNewCategoryForm] = useState({
        name: '',
        description: '',
        parentId: '',
        image: '',
    });
    const [subcategories, setSubcategories] = useState<string[]>([]);
    const [newSubcategory, setNewSubcategory] = useState('');
    const [newSeasonName, setNewSeasonName] = useState('');
    const [newSizeName, setNewSizeName] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '',
        isActive: true,
        isOnSale: false,
        salePercentage: '',
        material: '',
        brand: '',
        season: '',
    });

    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [newVariant, setNewVariant] = useState({
        size: '',
        color: '',
        stock: '0'
    });

    useEffect(() => {
        async function fetchData() {
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

                // Buscar tamanhos
                const sizesResponse = await fetch('/api/sizes');
                if (sizesResponse.ok) {
                    const sizesData = await sizesResponse.json();
                    setSizes(sizesData.data.map((s: { name: string }) => s.name));
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            }
        }

        if (open) {
            fetchData();
        }
    }, [open]);

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

    const handleAddSubcategory = () => {
        if (newSubcategory.trim() && !subcategories.includes(newSubcategory.trim())) {
            setSubcategories([...subcategories, newSubcategory.trim()]);
            setNewSubcategory('');
        }
    };

    const handleRemoveSubcategory = (index: number) => {
        setSubcategories(subcategories.filter((_, i) => i !== index));
    };

    const handleCreateCategory = async () => {
        if (!newCategoryForm.name.trim()) {
            alert('Nome da categoria é obrigatório');
            return;
        }

        // Se tiver parentId, não pode ter subcategorias
        if (newCategoryForm.parentId && subcategories.length > 0) {
            alert('Subcategorias só podem ser criadas em categorias principais');
            return;
        }

        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newCategoryForm.name,
                    description: newCategoryForm.description,
                    parentId: newCategoryForm.parentId || null,
                    image: newCategoryForm.image || null,
                    isActive: true,
                    subcategories: !newCategoryForm.parentId && subcategories.length > 0 ? subcategories : undefined,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao criar categoria');
            }

            const result = await response.json();

            // Atualizar lista de categorias
            const categoriesResponse = await fetch('/api/categories/for-products');
            if (categoriesResponse.ok) {
                const data = await categoriesResponse.json();
                setCategories(data.all || []);
            }

            // Selecionar a nova categoria
            setFormData({ ...formData, categoryId: result.data.id });

            // Resetar form e fechar dialog
            setNewCategoryForm({ name: '', description: '', parentId: '', image: '' });
            setSubcategories([]);
            setNewSubcategory('');
            setShowNewCategoryDialog(false);

            alert('Categoria criada com sucesso!');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Erro ao criar categoria');
        }
    };

    const handleCreateSeason = async () => {
        if (!newSeasonName.trim()) {
            alert('Nome da estação é obrigatório');
            return;
        }

        try {
            const response = await fetch('/api/seasons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newSeasonName }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao criar estação');
            }

            const result = await response.json();

            // Adicionar à lista local
            setSeasons([...seasons, result.data.name]);

            // Selecionar a nova estação
            setFormData({ ...formData, season: result.data.name });

            // Resetar form e fechar dialog
            setNewSeasonName('');
            setShowNewSeasonDialog(false);

            alert('Estação criada com sucesso!');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Erro ao criar estação');
        }
    }; const handleCreateSize = async () => {
        if (!newSizeName.trim()) {
            alert('Nome do tamanho é obrigatório');
            return;
        }

        try {
            const response = await fetch('/api/sizes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newSizeName }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao criar tamanho');
            }

            const result = await response.json();

            // Adicionar à lista local
            setSizes([...sizes, result.data.name]);

            // Selecionar o novo tamanho
            setNewVariant({ ...newVariant, size: result.data.name });

            // Resetar form e fechar dialog
            setNewSizeName('');
            setShowNewSizeDialog(false);

            alert('Tamanho criado com sucesso!');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Erro ao criar tamanho');
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
            return;
        }

        try {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir categoria');
            }

            // Atualizar lista de categorias
            setCategories(categories.filter(c => c.id !== categoryId));

            // Limpar seleção se for a categoria selecionada
            if (formData.categoryId === categoryId) {
                setFormData({ ...formData, categoryId: '' });
            }

            alert('Categoria excluída com sucesso!');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Erro ao excluir categoria');
        }
    };

    const handleDeleteSeason = async (season: string) => {
        if (!confirm(`Tem certeza que deseja excluir a estação "${season}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/seasons?name=${encodeURIComponent(season)}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir estação');
            }

            // Remover da lista local
            setSeasons(seasons.filter(s => s !== season));

            // Limpar seleção se for a estação selecionada
            if (formData.season === season) {
                setFormData({ ...formData, season: '' });
            }

            alert('Estação excluída com sucesso!');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Erro ao excluir estação');
        }
    };

    const handleDeleteSize = async (size: string) => {
        if (!confirm(`Tem certeza que deseja excluir o tamanho "${size}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/sizes?name=${encodeURIComponent(size)}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir tamanho');
            }

            // Remover da lista local
            setSizes(sizes.filter(s => s !== size));

            // Limpar seleção se for o tamanho selecionado
            if (newVariant.size === size) {
                setNewVariant({ ...newVariant, size: '' });
            }

            alert('Tamanho excluído com sucesso!');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Erro ao excluir tamanho');
        }
    };

    const addVariant = () => {
        if (!newVariant.size || !newVariant.color) {
            alert('Selecione tamanho e cor para a variante');
            return;
        }

        // Verificar se já existe essa combinação
        const exists = variants.some(v => v.size === newVariant.size && v.color === newVariant.color);
        if (exists) {
            alert('Já existe uma variante com esse tamanho e cor');
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
            alert('Preencha todos os campos obrigatórios');
            return;
        }

        if (formData.isOnSale && (!formData.salePercentage || parseInt(formData.salePercentage) < 1 || parseInt(formData.salePercentage) > 99)) {
            alert('Porcentagem de desconto deve estar entre 1 e 99');
            return;
        }

        if (variants.length === 0) {
            alert('Adicione pelo menos uma variante (tamanho + cor)');
            return;
        }

        // Verificar se todas as variantes têm imagens
        const variantsWithoutImages = variants.filter(v => v.images.length === 0);
        if (variantsWithoutImages.length > 0) {
            const confirm = window.confirm(
                `${variantsWithoutImages.length} variante(s) não tem imagens. Deseja continuar mesmo assim?`
            );
            if (!confirm) return;
        }

        setLoading(true);

        try {
            // 1. Upload all images from all variants
            const variantsWithUploadedImages = await Promise.all(
                variants.map(async (variant) => {
                    const uploadedImages = await Promise.all(
                        variant.images.map(async (image) => {
                            // Se já tem URL (imagem antiga editada), usar ela
                            if (image.url && !image.url.startsWith('blob:')) {
                                return { url: image.url, order: image.order };
                            }

                            // Upload da nova imagem
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
                            return { url: uploadData.url, order: image.order };
                        })
                    );

                    return {
                        size: variant.size,
                        color: variant.color,
                        stock: variant.stock,
                        images: uploadedImages,
                    };
                })
            );

            // 2. Create product with uploaded image URLs
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price),
                    oldPrice: null, // Removido - não usa mais preço anterior
                    stock: Number(formData.stock) || 0,
                    isOnSale: formData.isOnSale,
                    salePercentage: formData.isOnSale && formData.salePercentage ? parseInt(formData.salePercentage) : null,
                    material: formData.material || null,
                    brand: formData.brand || null,
                    season: formData.season || null,
                    variants: variantsWithUploadedImages,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao criar produto');
            }

            // Reset form
            setFormData({
                name: '',
                description: '',
                price: '',
                stock: '',
                categoryId: '',
                isActive: true,
                isOnSale: false,
                salePercentage: '',
                material: '',
                brand: '',
                season: '',
            });
            setVariants([]);
            setNewVariant({ size: '', color: '', stock: '0' });

            setOpen(false);
            onCreated?.();
            alert('Produto criado com sucesso!');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Erro ao criar produto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={buttonClassName || "flex items-center gap-2 bg-primary hover:bg-primary/90 text-white"}>
                    <Plus className="w-4 h-4" />
                    {buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="text-2xl font-bold">Novo Produto</DialogTitle>
                    <p className="text-sm text-gray-500">Preencha os dados do produto e suas variantes</p>
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
                                <Label htmlFor="description" className="text-sm font-medium">Descrição</Label>
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
                                            {/* Categorias Principais */}
                                            {categories
                                                .filter(cat => !cat.slug.includes('/'))
                                                .sort((a, b) => a.name.localeCompare(b.name))
                                                .map((category) => (
                                                    <div key={category.id}>
                                                        <div className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded group">
                                                            <SelectItem value={category.id} className="flex-1 cursor-pointer border-0 font-semibold">
                                                                {category.name}
                                                            </SelectItem>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteCategory(category.id);
                                                                }}
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                        {/* Subcategorias */}
                                                        {categories
                                                            .filter(sub => sub.slug.startsWith(`${category.slug}/`))
                                                            .sort((a, b) => a.name.localeCompare(b.name))
                                                            .map((subcategory) => (
                                                                <div key={subcategory.id} className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded group ml-4">
                                                                    <SelectItem value={subcategory.id} className="flex-1 cursor-pointer border-0 text-gray-700">
                                                                        └─ {subcategory.name}
                                                                    </SelectItem>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteCategory(subcategory.id);
                                                                        }}
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            ))}
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
                                                    onClick={() => setShowNewCategoryDialog(true)}
                                                    className="h-9 w-9 shrink-0 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 transition-all"
                                                >
                                                    <FolderPlus className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Criar nova categoria</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="season" className="text-sm font-medium">Estação</Label>
                                <div className="flex gap-2">
                                    <Select value={formData.season} onValueChange={(value) => setFormData({ ...formData, season: value })}>
                                        <SelectTrigger className="h-11 bg-white border-2 border-gray-300 focus:border-black flex-1">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {seasons.map((season) => (
                                                <div key={season} className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded group">
                                                    <SelectItem value={season} className="flex-1 cursor-pointer border-0">
                                                        {season}
                                                    </SelectItem>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteSeason(season);
                                                        }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
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
                                                    className="h-9 w-9 flex-shrink-0 border-2 border-gray-300 hover:border-black hover:bg-gray-50"
                                                    onClick={() => setShowNewSeasonDialog(true)}
                                                >
                                                    <FolderPlus className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Criar nova estação</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
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

                            <div className="space-y-2">
                                <Label htmlFor="stock" className="text-sm font-medium">Estoque Inicial</Label>
                                <Input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="h-11"
                                />
                                <p className="text-xs text-gray-500">Estoque das variantes é gerenciado separadamente</p>
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
                                                    <div key={size} className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded group">
                                                        <SelectItem value={size} className="flex-1 cursor-pointer border-0">
                                                            {size}
                                                        </SelectItem>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteSize(size);
                                                            }}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
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
                                                        onClick={() => setShowNewSizeDialog(true)}
                                                    >
                                                        <FolderPlus className="w-4 h-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Criar novo tamanho</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-gray-700">Cor *</Label>
                                    <Input
                                        placeholder="Ex: Preto, Branco, Azul Marinho..."
                                        value={newVariant.color}
                                        onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                                        className="h-10"
                                    />
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
                    <div className="flex items-center justify-between border-t-2 pt-6">
                        <div className="flex items-center gap-3">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                className="data-[state=checked]:bg-green-600"
                            />
                            <div>
                                <Label htmlFor="isActive" className="text-base font-semibold cursor-pointer">Produto Ativo</Label>
                                <p className="text-xs text-gray-500">Produto vis ível na loja</p>
                            </div>
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
                            {loading ? 'Criando...' : 'Criar Produto'}
                        </Button>
                    </div>
                </form>
            </DialogContent>

            {/* Dialog para criar nova categoria */}
            <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Nova Categoria</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newCategoryName">Nome *</Label>
                            <Input
                                id="newCategoryName"
                                value={newCategoryForm.name}
                                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                                placeholder="Ex: Vestidos, Blusas..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newCategoryDescription">Descrição</Label>
                            <Textarea
                                id="newCategoryDescription"
                                value={newCategoryForm.description}
                                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, description: e.target.value })}
                                placeholder="Descrição da categoria (opcional)"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newCategoryParent">Tipo de Categoria</Label>
                            <Select
                                value={newCategoryForm.parentId || "none"}
                                onValueChange={(value) => setNewCategoryForm({ ...newCategoryForm, parentId: value === "none" ? "" : value })}
                            >
                                <SelectTrigger className="border-2 border-gray-300 bg-white focus:border-black">
                                    <SelectValue placeholder="Categoria Principal" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Categoria Principal</SelectItem>
                                    {categories.filter(c => !c.slug.includes('/')).map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            Subcategoria de {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                                Categorias principais podem ter imagem e subcategorias
                            </p>
                        </div>

                        {/* Imagem - apenas para categorias principais */}
                        {!newCategoryForm.parentId && (
                            <div className="space-y-2">
                                <Label htmlFor="newCategoryImage">Imagem da Categoria</Label>
                                <div className="space-y-3">
                                    {newCategoryForm.image ? (
                                        <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                                            <Image
                                                src={newCategoryForm.image}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, 600px"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-8 w-8 z-10"
                                                onClick={() => setNewCategoryForm({ ...newCategoryForm, image: '' })}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                                                    <p className="mb-2 text-sm text-gray-500">
                                                        <span className="font-semibold">Clique para fazer upload</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500">PNG, JPG ou WEBP</p>
                                                </div>
                                                <input
                                                    id="newCategoryImage"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            try {
                                                                const base64 = await convertToBase64(file);
                                                                setNewCategoryForm({ ...newCategoryForm, image: base64 });
                                                            } catch (error) {
                                                                console.error('Erro ao converter imagem:', error);
                                                                alert('Erro ao processar imagem');
                                                            }
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Subcategorias - apenas para categorias principais */}
                        {!newCategoryForm.parentId && (
                            <div className="space-y-3 border-t pt-4">
                                <div>
                                    <Label className="text-sm font-medium">Subcategorias</Label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Adicione subcategorias para organizar melhor seus produtos
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        value={newSubcategory}
                                        onChange={(e) => setNewSubcategory(e.target.value)}
                                        placeholder="Nome da subcategoria"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddSubcategory();
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleAddSubcategory}
                                        size="icon"
                                        variant="outline"
                                        className="flex-shrink-0"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                {subcategories.length > 0 && (
                                    <div className="space-y-2">
                                        {subcategories.map((sub, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                                            >
                                                <span className="text-sm">{sub}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => handleRemoveSubcategory(index)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowNewCategoryDialog(false);
                                    setNewCategoryForm({ name: '', description: '', parentId: '', image: '' });
                                    setSubcategories([]);
                                    setNewSubcategory('');
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="button" onClick={handleCreateCategory}>
                                Criar Categoria
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog para criar nova estação */}
            <Dialog open={showNewSeasonDialog} onOpenChange={setShowNewSeasonDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nova Estação</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newSeasonName">Nome da Estação *</Label>
                            <Input
                                id="newSeasonName"
                                value={newSeasonName}
                                onChange={(e) => setNewSeasonName(e.target.value)}
                                placeholder="Ex: Primavera/Verão, Alto Verão..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleCreateSeason();
                                    }
                                }}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowNewSeasonDialog(false);
                                    setNewSeasonName('');
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="button" onClick={handleCreateSeason}>
                                Criar Estação
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog para criar novo tamanho */}
            <Dialog open={showNewSizeDialog} onOpenChange={setShowNewSizeDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Novo Tamanho</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newSizeName">Nome do Tamanho *</Label>
                            <Input
                                id="newSizeName"
                                value={newSizeName}
                                onChange={(e) => setNewSizeName(e.target.value)}
                                placeholder="Ex: 3XL, PP, G, 38, 40..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleCreateSize();
                                    }
                                }}
                            />
                            <p className="text-xs text-gray-500">O tamanho será convertido para maiúsculas</p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowNewSizeDialog(false);
                                    setNewSizeName('');
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="button" onClick={handleCreateSize}>
                                Criar Tamanho
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}