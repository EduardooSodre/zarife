'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Upload, X, GripVertical, Star } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { convertToBase64 } from '@/lib/upload';

interface ImageData {
  id: string;
  url: string;
  file?: File;
  order: number;
}

interface ImageUploadProps {
  images: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
  maxImages?: number;
  className?: string;
}

interface SortableImageItemProps {
  image: ImageData;
  index: number;
  onRemove: (id: string) => void;
  isFirst: boolean;
}

function SortableImageItem({ image, index, onRemove, isFirst }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden cursor-grab active:cursor-grabbing",
        isDragging && "opacity-60 z-50",
        isFirst && "ring-2 ring-yellow-400 border-yellow-400"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="aspect-square relative">
        <Image
          src={image.url}
          alt={`Produto ${index + 1}`}
          fill
          className="object-cover"
        />
        
        {/* Badge de capa */}
        {isFirst && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Capa
          </div>
        )}
        
        {/* Remove button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(image.id);
          }}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
        >
          <X className="w-4 h-4" />
        </button>
        
        {/* Order indicator */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
          {index + 1}
        </div>

        {/* Drag overlay - só aparece quando não está arrastando */}
        {!isDragging && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none flex items-center justify-center">
            <div className="bg-white/90 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4" />
              Arrastar para reordenar
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 6,
  className 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const uploadToCloudinary = async (file: File): Promise<string> => {
    // Para desenvolvimento, vamos usar base64. Em produção, substitua pela implementação real do Cloudinary
    return convertToBase64(file);
    
    // Implementação real do Cloudinary (descomente quando configurar):
    /*
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'zarife');
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const data = await response.json();
    return data.secure_url;
    */
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length >= maxImages) {
      alert(`Máximo de ${maxImages} imagens permitidas`);
      return;
    }

    setUploading(true);

    try {
      const newImages: ImageData[] = [];
      
      for (const file of acceptedFiles.slice(0, maxImages - images.length)) {
        const url = await uploadToCloudinary(file);
        newImages.push({
          id: Math.random().toString(36).substr(2, 9),
          url,
          file,
          order: images.length + newImages.length,
        });
      }

      onImagesChange([...images, ...newImages]);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload das imagens');
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    disabled: uploading || images.length >= maxImages,
  });

  const removeImage = (id: string) => {
    const updatedImages = images
      .filter(img => img.id !== id)
      .map((img, index) => ({ ...img, order: index }));
    onImagesChange(updatedImages);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = images.findIndex(img => img.id === active.id);
      const newIndex = images.findIndex(img => img.id === over?.id);

      const reorderedImages = arrayMove(images, oldIndex, newIndex).map((img, index) => ({
        ...img,
        order: index,
      }));

      onImagesChange(reorderedImages);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload area */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive && "border-blue-400 bg-blue-50",
          uploading && "opacity-50 cursor-not-allowed",
          images.length >= maxImages && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
        
        {uploading ? (
          <p className="text-sm text-gray-600">Fazendo upload...</p>
        ) : images.length >= maxImages ? (
          <p className="text-sm text-gray-600">Máximo de {maxImages} imagens atingido</p>
        ) : isDragActive ? (
          <p className="text-sm text-blue-600">Solte as imagens aqui...</p>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Arraste as imagens aqui ou clique para selecionar
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WEBP até 10MB cada. Máximo {maxImages} imagens.
            </p>
          </div>
        )}
      </div>

      {/* Images grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              Imagens do Produto ({images.length}/{maxImages})
            </p>
            <p className="text-xs text-gray-500">
              Arraste para reordenar • A primeira imagem será a capa
            </p>
          </div>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map(img => img.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <SortableImageItem
                    key={image.id}
                    image={image}
                    index={index}
                    onRemove={removeImage}
                    isFirst={index === 0}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
