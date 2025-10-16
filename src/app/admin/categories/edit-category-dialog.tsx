"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, Upload, X, Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { convertToBase64 } from "@/lib/upload";
import Image from "next/image";

interface Category {
	id: string;
	name: string;
	description?: string | null;
	image?: string | null;
	isActive: boolean;
	parentId?: string | null;
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
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(category.image || null);
	const [subcategories, setSubcategories] = useState<string[]>([]);
	const [newSubcategory, setNewSubcategory] = useState("");

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value, type } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
		}));
	};

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleRemoveImage = () => {
		setImageFile(null);
		setImagePreview(null);
	};

	const handleAddSubcategory = () => {
		if (newSubcategory.trim()) {
			setSubcategories([...subcategories, newSubcategory.trim()]);
			setNewSubcategory("");
		}
	};

	const handleRemoveSubcategory = (index: number) => {
		setSubcategories(subcategories.filter((_, i) => i !== index));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			let imageBase64 = imagePreview;

			// Se tem um novo arquivo e não é subcategoria, converte para base64
			if (imageFile && !category.parentId) {
				imageBase64 = await convertToBase64(imageFile);
			}

			const res = await fetch(`/api/categories/${category.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...form,
					// Só envia imagem se não for subcategoria
					image: !category.parentId ? imageBase64 : undefined,
					// Envia subcategorias apenas se for categoria principal
					subcategories: !category.parentId && subcategories.length > 0 ? subcategories : undefined,
				}),
			});
			if (res.ok) {
				setSubcategories([]);
				setNewSubcategory("");
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
				<Button size="sm" variant="outline" className="h-8 w-8 p-0 cursor-pointer">
					<Edit className="w-4 h-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-lg w-full">
				<DialogHeader>
					<DialogTitle>Editar Categoria</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label className="block text-sm font-medium mb-1">Nome</Label>
						<input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required placeholder="Nome da categoria" />
					</div>
					<div>
						<Label className="block text-sm font-medium mb-1">Descrição</Label>
						<textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} placeholder="Descrição da categoria (opcional)" />
					</div>
					{!category.parentId && (
						<div className="space-y-2">
							<Label className="block text-sm font-medium mb-1">Imagem (Opcional)</Label>
							{imagePreview ? (
								<div className="relative w-full h-40 border-2 border-gray-300 rounded-lg overflow-hidden">
									<Image
										src={imagePreview}
										alt="Preview"
										fill
										className="object-cover"
									/>
									<Button
										type="button"
										variant="destructive"
										size="sm"
										onClick={handleRemoveImage}
										className="absolute top-2 right-2 h-8 w-8 p-0"
									>
										<X className="w-4 h-4" />
									</Button>
								</div>
							) : (
								<label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
									<div className="flex flex-col items-center justify-center pt-5 pb-6">
										<Upload className="w-10 h-10 mb-3 text-gray-400" />
										<p className="mb-2 text-sm text-gray-500">
											<span className="font-semibold">Clique para fazer upload</span>
										</p>
										<p className="text-xs text-gray-400">PNG, JPG ou WEBP (MAX. 5MB)</p>
									</div>
									<input
										type="file"
										className="hidden"
										accept="image/*"
										onChange={handleImageChange}
									/>
								</label>
							)}
						</div>
					)}
					{!category.parentId && (
						<div className="space-y-2">
							<Label className="block text-sm font-medium mb-1">Adicionar Subcategorias (Opcional)</Label>
							<div className="flex gap-2">
								<input
									type="text"
									value={newSubcategory}
									onChange={(e) => setNewSubcategory(e.target.value)}
									onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubcategory())}
									className="flex-1 border rounded px-3 py-2"
									placeholder="Nome da nova subcategoria"
								/>
								<Button
									type="button"
									onClick={handleAddSubcategory}
									variant="outline"
									className="cursor-pointer"
								>
									<Plus className="w-4 h-4" />
								</Button>
							</div>
							{subcategories.length > 0 && (
								<div className="space-y-2 mt-2">
									<p className="text-xs text-gray-500">Novas subcategorias a serem criadas:</p>
									{subcategories.map((sub, index) => (
										<div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
											<span className="text-sm">{sub}</span>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => handleRemoveSubcategory(index)}
												className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									))}
								</div>
							)}
						</div>
					)}
					<div className="flex items-center gap-2">
						<input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} id="isActive" title="Categoria Ativa" />
						<Label htmlFor="isActive" className="text-sm">Categoria Ativa</Label>
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
