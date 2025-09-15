"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";

interface Category {
    id: string;
    name: string;
    slug: string;
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
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        oldPrice: '',
        stock: '',
        categoryId: '',
        isActive: true,
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.price || !formData.categoryId) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }

        setLoading(true);

        try {
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
                }),
            });

            if (!response.ok) {
                throw new Error('Erro ao criar produto');
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
            });

            setOpen(false);
            onCreated?.();
            alert('Produto criado com sucesso!');
        } catch {
            alert('Erro ao criar produto');
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
            <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Novo Produto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            id="isActive"
                        />
                        <Label htmlFor="isActive" className="text-sm">Produto Ativo</Label>
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