"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/image-upload";
import { ImageUploadGuide } from "@/components/ui/image-upload-guide";

interface ImageData {
  id: string;
  url: string;
  file?: File;
  order: number;
}

export default function NewCategoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<ImageData[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("Por favor, insira o nome da categoria");
      return;
    }

    setIsLoading(true);

    try {
      const imageUrl = images.length > 0 ? images[0].url : null;

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Categoria criada com sucesso!");
        router.push("/admin/categories");
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Erro ao criar categoria");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Botão de retorno */}
        <div className="mb-6">
          <Link href="/admin/categories" className="inline-block">
            <Button variant="outline" className="flex items-center gap-2 cursor-pointer w-auto">
              <ArrowLeft className="w-4 h-4" />
              Voltar às Categorias
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-light text-black mb-4 tracking-wider uppercase">
              Nova Categoria
            </h1>
            <p className="text-gray-600 text-lg">
              Adicionar uma nova categoria ao catálogo
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 lg:p-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
            {/* Informações da Categoria */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Informações da Categoria</h3>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Categoria *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                      placeholder="Ex: Vestidos"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                      rows={4}
                      placeholder="Descrição opcional da categoria..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Configurações */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Configurações</h3>

                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({ ...prev, isActive: !!checked }))
                      }
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Categoria Ativa
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Imagem da Categoria */}
          <div className="mt-12 space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Imagem da Categoria</h3>
              <ImageUploadGuide />
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                maxImages={1}
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Link href="/admin/categories" className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </Link>
              <button
                type="submit"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'A Criar...' : 'Criar Categoria'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
