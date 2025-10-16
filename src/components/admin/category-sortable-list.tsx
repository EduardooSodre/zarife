'use client';

import React from 'react';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeleteCategoryButton } from '@/components/admin/delete-category-button';
import { EditCategoryDialog } from '@/app/admin/categories/edit-category-dialog';
import { NewCategoryDialog } from '@/components/admin/new-category-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  order: number;
  _count: {
    products: number;
  };
}

interface CategorySortableListProps {
  categories: Category[];
  onReorder: (newOrder: Category[]) => void;
  onDeleted?: () => void;
}

interface SortableCategoryItemProps {
  category: Category;
}

function SortableCategoryItem({ category, onDeleted }: SortableCategoryItemProps & { onDeleted?: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-4 ${isDragging ? 'opacity-60 z-50 shadow-lg' : 'hover:shadow-md'
        } ${!category.isActive ? 'opacity-60 bg-gray-50' : ''} transition-all duration-200`}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>

        {/* Imagem da categoria */}
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-xs">Sem imagem</span>
            </div>
          )}
        </div>

        {/* Informações da categoria */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 truncate">{category.name}</h3>
            <Badge variant={category.isActive ? "default" : "secondary"} className="text-xs">
              {category.isActive ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 truncate">
            {category.description || 'Sem descrição'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {category._count.products} produto{category._count.products !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Ordem */}
        <div className="text-center px-3">
          <div className="text-sm font-medium text-gray-900">#{category.order}</div>
          <div className="text-xs text-gray-500">Ordem</div>
        </div>

        {/* Ações */}
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/admin/categories/${category.id}`}>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver Detalhes</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex">
                  <EditCategoryDialog category={category} onUpdated={onDeleted} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar Categoria</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex">
                  <NewCategoryDialog
                    parentId={category.id}
                    onCreated={onDeleted}
                    triggerButton={
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                        <Plus className="w-4 h-4" />
                      </Button>
                    }
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Adicionar Subcategoria</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex">
                  <DeleteCategoryButton
                    categoryId={category.id}
                    categoryName={category.name}
                    hasProducts={category._count.products > 0}
                    onDeleted={onDeleted}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Deletar Categoria</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}

export function CategorySortableList({ categories, onReorder, onDeleted }: CategorySortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((item) => item.id === active.id);
      const newIndex = categories.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(categories, oldIndex, newIndex);
      onReorder(newOrder);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={categories.map(cat => cat.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {categories.map((category) => (
            <SortableCategoryItem key={category.id} category={category} onDeleted={onDeleted} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
