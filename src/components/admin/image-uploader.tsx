"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Upload, GripVertical } from "lucide-react";
import Image from "next/image";

interface ImageItem {
  id: string;
  url?: string;
  file: File;
  preview: string;
  order: number;
}

interface ImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxImages?: number;
  label?: string;
}

export function ImageUploader({ images, onChange, maxImages = 10, label = "Imagens" }: ImageUploaderProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploading] = useState(false);

  // Cleanup: Revoke object URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image.preview && image.preview.startsWith('blob:')) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [images]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      alert(`Máximo de ${maxImages} imagens permitidas`);
      return;
    }

    const newImages: ImageItem[] = [];

    for (const file of files) {
      // Criar preview local (não fazer upload ainda)
      const preview = URL.createObjectURL(file);
      
      newImages.push({
        id: `temp-${Date.now()}-${Math.random()}`,
        file,
        preview,
        order: images.length + newImages.length,
      });
    }

    onChange([...images, ...newImages]);
  };

  const removeImage = (id: string) => {
    const filtered = images.filter(img => img.id !== id);
    // Reordenar
    const reordered = filtered.map((img, index) => ({ ...img, order: index }));
    onChange(reordered);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    
    // Remove from old position
    newImages.splice(draggedIndex, 1);
    // Insert at new position
    newImages.splice(index, 0, draggedItem);
    
    // Update order
    const reordered = newImages.map((img, i) => ({ ...img, order: i }));
    
    onChange(reordered);
    setDraggedIndex(index);
  }, [draggedIndex, images, onChange]);

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-xs text-gray-500">
          {images.length}/{maxImages} imagens
        </span>
      </div>

      {/* Grid de imagens */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all cursor-move ${
                draggedIndex === index ? 'opacity-50 border-blue-500' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={image.preview || image.url || '/placeholder.jpg'}
                alt={`Imagem ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 200px"
              />
              
              {/* Drag handle */}
              <div className="absolute top-1 left-1 bg-black/60 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-3 h-3" />
              </div>

              {/* Order badge */}
              <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                className="absolute bottom-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                aria-label="Remover imagem"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {images.length < maxImages && (
        <div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id={`file-upload-${label}`}
            disabled={uploading}
          />
          <label htmlFor={`file-upload-${label}`} className="block">
            <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer">
              <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <span className="text-sm text-gray-600">
                {uploading ? 'Enviando...' : 'Clique para adicionar imagens'}
              </span>
            </div>
          </label>
        </div>
      )}

      {images.length === 0 && !uploading && (
        <p className="text-xs text-gray-500 text-center py-4">
          Nenhuma imagem adicionada ainda. Arraste para reordenar após adicionar.
        </p>
      )}
    </div>
  );
}
