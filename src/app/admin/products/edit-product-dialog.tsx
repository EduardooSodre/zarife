"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  oldPrice?: number;
  stock: number;
  isActive: boolean;
}

interface EditProductDialogProps {
  product: Product;
  onUpdated?: () => void;
}

export function EditProductDialog({ product, onUpdated }: EditProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: product.name,
    description: product.description || "",
    price: product.price,
    stock: product.stock,
    isActive: product.isActive,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
        }),
      });
      if (res.ok) {
        toast({
          title: "Produto atualizado",
          description: "As alterações foram salvas com sucesso.",
        });
        setOpen(false);
        onUpdated?.();
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar",
          description: "Não foi possível salvar as alterações.",
        });
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
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium mb-1">Nome</label>
            <input id="edit-name" name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium mb-1">Descrição</label>
            <textarea id="edit-description" name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="edit-price" className="block text-sm font-medium mb-1">Preço</label>
              <input id="edit-price" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="flex-1">
              <label htmlFor="edit-stock" className="block text-sm font-medium mb-1">Estoque</label>
              <input id="edit-stock" name="stock" type="number" value={form.stock} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} id="isActive" />
            <label htmlFor="isActive" className="text-sm">Produto Ativo</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
