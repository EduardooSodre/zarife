"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface Category {
	id: string;
	name: string;
	description?: string | null;
	isActive: boolean;
}

interface EditCategoryDialogProps {
	category: Category;
	onUpdated?: () => void;
}

export function EditCategoryDialog({ category, onUpdated }: EditCategoryDialogProps) {
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({
		name: category.name,
		description: category.description || "",
		isActive: category.isActive,
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
			const res = await fetch(`/api/categories/${category.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			if (res.ok) {
				setOpen(false);
				onUpdated?.();
			} else {
				alert("Erro ao atualizar categoria");
			}
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
					<DialogTitle>Editar Categoria</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1">Nome</label>
						<input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Descrição</label>
						<textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} />
					</div>
					<div className="flex items-center gap-2">
						<input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} id="isActive" />
						<label htmlFor="isActive" className="text-sm">Categoria Ativa</label>
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
