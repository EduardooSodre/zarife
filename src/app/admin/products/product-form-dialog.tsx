"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import NewProductForm from "./new-product-form";

interface ProductFormDraft {
    name: string;
    description: string;
    price: string;
    oldPrice: string;
    stock: string;
    categoryId: string;
    isFeatured: boolean;
    isActive: boolean;
    material: string;
    brand: string;
    season: string;
    gender: string;
    images?: any[];
    variants?: any[];
    selectedLevel1?: string;
    selectedLevel2?: string;
    selectedLevel3?: string;
}

export function ProductFormDialog() {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<ProductFormDraft | null>(null);

    useEffect(() => {
        if (open) {
            const saved = localStorage.getItem("productFormDraft");
            if (saved) setDraft(JSON.parse(saved));
        }
    }, [open]);

    // Limpar rascunho ao fechar com sucesso
    const handleSuccess = () => {
        localStorage.removeItem("productFormDraft");
        setDraft(null);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">Novo Produto</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl w-full overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Novo Produto</DialogTitle>
                </DialogHeader>
                <NewProductForm draft={draft} onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    );
}
