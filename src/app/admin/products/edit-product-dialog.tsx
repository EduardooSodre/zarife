"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
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

export function EditProductDialog({ product }: { product: any }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProductFormDraft | null>(null);

  useEffect(() => {
    if (open && product) {
      setDraft({ ...product });
    }
  }, [open, product]);

  const handleSuccess = () => {
    setDraft(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 sm:h-8 px-2 cursor-pointer hover:bg-gray-100">
          <Edit className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl w-full overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
        </DialogHeader>
        <NewProductForm draft={draft} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
