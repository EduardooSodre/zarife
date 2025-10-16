"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, Tag, X } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SEASONS = ['Primavera', 'Verão', 'Outono', 'Inverno', 'Atemporal'];

export function NewProductDialog({ onCreated, buttonText = "Novo Produto", buttonClassName }: NewProductDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeVariantTab, setActiveVariantTab] = useState<string>("0");
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        oldPrice: '',
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
        async function fetchCategories() {
            try {
                const response = await fetch('/api/categories/for-products');
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data.data || []);
                }
            } catch (error) {
                console.error('Erro ao carregar categorias:', error);
            }
        }

        if (open) {
            fetchCategories();
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
                    oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null,
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
                oldPrice: '',
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
            <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Novo Produto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Produto *</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ex: Vestido Elegante"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="categoryId">Categoria *</Label>
                            <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="brand">Marca</Label>
                            <Input
                                id="brand"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                placeholder="Ex: Vestido Lara, Conjunto Riviera..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="material">Material/Composição</Label>
                            <Input
                                id="material"
                                name="material"
                                value={formData.material}
                                onChange={handleChange}
                                placeholder="Ex: 100% Algodão..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="season">Estação</Label>
                            <Select value={formData.season} onValueChange={(value) => setFormData({ ...formData, season: value })}>
                                <SelectTrigger className="bg-white border-2 border-gray-300 focus:border-black">
                                    <SelectValue placeholder="Selecione a estação" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SEASONS.map((season) => (
                                        <SelectItem key={season} value={season} className="cursor-pointer hover:bg-gray-100">
                                            {season}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Preço *</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="oldPrice">Preço Anterior</Label>
                            <Input
                                id="oldPrice"
                                name="oldPrice"
                                type="number"
                                step="0.01"
                                value={formData.oldPrice}
                                onChange={handleChange}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stock">Estoque</Label>
                            <Input
                                id="stock"
                                name="stock"
                                type="number"
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Seção de Saldo */}
                    <div className="border rounded-lg p-4 space-y-4 bg-amber-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-amber-600" />
                                <Label htmlFor="isOnSale" className="text-amber-900 cursor-pointer">
                                    Produto em Saldo
                                </Label>
                            </div>
                            <Switch
                                id="isOnSale"
                                checked={formData.isOnSale}
                                onCheckedChange={(checked) => setFormData({
                                    ...formData,
                                    isOnSale: checked,
                                    salePercentage: checked ? formData.salePercentage : ''
                                })}
                            />
                        </div>

                        {formData.isOnSale && (
                            <div className="space-y-2">
                                <Label htmlFor="salePercentage">Desconto (%)</Label>
                                <Input
                                    id="salePercentage"
                                    name="salePercentage"
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={formData.salePercentage}
                                    onChange={handleChange}
                                    placeholder="Ex: 20 para 20% de desconto"
                                    required={formData.isOnSale}
                                />
                                {salePrice && formData.price && (
                                    <div className="text-sm text-amber-700 bg-amber-100 p-3 rounded">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">Preço promocional:</span>
                                            <div>
                                                <span className="line-through text-gray-600 mr-2">
                                                    R$ {parseFloat(formData.price).toFixed(2)}
                                                </span>
                                                <span className="text-lg font-bold text-green-700">
                                                    R$ {salePrice}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-xs mt-1 text-amber-600">
                                            ({formData.salePercentage}% OFF)
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Descrição detalhada do produto..."
                            rows={4}
                        />
                    </div>

                    {/* Variantes */}
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="font-semibold text-lg">Variantes (Tamanhos e Cores) *</h3>
                        
                        {/* Adicionar nova variante */}
                        <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                            <Label>Adicionar Nova Variante</Label>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs text-gray-600">Tamanho *</Label>
                                    <Select value={newVariant.size} onValueChange={(value) => setNewVariant({ ...newVariant, size: value })}>
                                        <SelectTrigger className="bg-white border-2 border-gray-300 focus:border-black">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SIZES.map((size) => (
                                                <SelectItem key={size} value={size} className="cursor-pointer hover:bg-gray-100">
                                                    {size}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs text-gray-600">Cor *</Label>
                                    <Input
                                        placeholder="Ex: Preto, Branco..."
                                        value={newVariant.color}
                                        onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs text-gray-600">Estoque (unidades)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={newVariant.stock}
                                        onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                                    />
                                </div>

                                <Button type="button" onClick={addVariant} className="w-full mt-auto bg-black hover:bg-gray-800">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adicionar
                                </Button>
                            </div>
                        </div>

                        {/* Lista de variantes com imagens */}
                        {variants.length > 0 && (
                            <Tabs value={activeVariantTab} onValueChange={setActiveVariantTab} className="w-full">
                                <TabsList className="w-full grid bg-gray-100 p-1" style={{ gridTemplateColumns: `repeat(${Math.min(variants.length, 4)}, 1fr)` }}>
                                    {variants.map((variant, index) => (
                                        <TabsTrigger 
                                            key={variant.id} 
                                            value={index.toString()} 
                                            className="text-xs font-medium data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 border-2 data-[state=active]:border-black data-[state=inactive]:border-gray-300"
                                        >
                                            {variant.size} - {variant.color}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {variants.map((variant, index) => (
                                    <TabsContent key={variant.id} value={index.toString()} className="space-y-4">
                                        <div className="border rounded-lg p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium">
                                                        Tamanho: {variant.size} | Cor: {variant.color}
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
                        )}

                        {variants.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4 border rounded-lg bg-gray-50">
                                Nenhuma variante adicionada. Adicione pelo menos uma combinação de tamanho e cor.
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between border-t pt-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="isActive">Produto Ativo</Label>
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Criar Produto
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}