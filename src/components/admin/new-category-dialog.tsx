"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Category {
	id: string;
	name: string;
	description?: string | null;
	isActive: boolean;
	parentId?: string | null;
}

interface NewCategoryDialogProps {
	onCreated?: () => void;
}

export function NewCategoryDialog({ onCreated }: NewCategoryDialogProps) {
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({
		name: "",
		description: "",
		isActive: true,
		parentId: "",
	});
	const [loading, setLoading] = useState(false);
	const [categories, setCategories] = useState<Category[]>([]);

	useEffect(() => {
		async function fetchCategories() {
			try {
				const response = await fetch('/api/categories');
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
		setForm((prev) => ({
			...prev,
			[name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			const res = await fetch('/api/categories', {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...form,
					parentId: form.parentId || null,
				}),
			});
			if (res.ok) {
				// Reset form
				setForm({
					name: "",
					description: "",
					isActive: true,
					parentId: "",
				});
				setOpen(false);
				onCreated?.();
			} else {
				const error = await res.json();
				alert(error.error || "Erro ao criar categoria");
			}
		} catch (error) {
			console.error('Erro ao criar categoria:', error);
			alert("Erro ao criar categoria");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="flex items-center gap-2 bg-black hover:bg-black/90 text-white cursor-pointer">
					<Plus className="w-4 h-4" />
					Nova Categoria
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-lg w-full">
				<DialogHeader>
					<DialogTitle>Nova Categoria</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label className="block text-sm font-medium mb-1">Nome *</Label>
						<input 
							name="name" 
							value={form.name} 
							onChange={handleChange} 
							className="w-full border rounded px-3 py-2" 
							required 
							placeholder="Nome da categoria" 
						/>
					</div>
					<div>
						<Label className="block text-sm font-medium mb-1">Descrição</Label>
						<textarea 
							name="description" 
							value={form.description} 
							onChange={handleChange} 
							className="w-full border rounded px-3 py-2" 
							rows={3} 
							placeholder="Descrição da categoria (opcional)" 
						/>
					</div>
					<div className="space-y-2">
						<Label className="block text-sm font-medium mb-1">Categoria Pai (Subcategoria)</Label>
						<Select
							value={form.parentId || "none"}
							onValueChange={(value) => setForm({ ...form, parentId: value === "none" ? "" : value })}
						>
							<SelectTrigger className="border-2 border-gray-300 bg-white focus:border-black">
								<SelectValue placeholder="Nenhuma (categoria principal)" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">Nenhuma (categoria principal)</SelectItem>
								{categories.map((cat) => (
									<SelectItem key={cat.id} value={cat.id}>
										{cat.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className="text-xs text-gray-500">
							Deixe vazio para criar uma categoria principal ou selecione uma categoria existente para criar uma subcategoria.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<input 
							type="checkbox" 
							name="isActive" 
							checked={form.isActive} 
							onChange={handleChange} 
							id="isActive" 
							title="Categoria Ativa" 
						/>
						<Label htmlFor="isActive" className="text-sm">Categoria Ativa</Label>
					</div>
					<div className="flex justify-end gap-2 pt-2">
						<Button 
							type="button" 
							variant="outline" 
							onClick={() => setOpen(false)} 
							disabled={loading}
							className="cursor-pointer"
						>
							Cancelar
						</Button>
						<Button 
							type="submit" 
							disabled={loading}
							className="cursor-pointer"
						>
							{loading ? "Criando..." : "Criar Categoria"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
