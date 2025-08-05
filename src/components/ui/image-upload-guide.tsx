'use client';

import { Info, Star, Move, Upload } from 'lucide-react';

export function ImageUploadGuide() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-2 text-sm">
          <p className="font-medium text-blue-900">Como usar o sistema de imagens:</p>
          <ul className="space-y-1 text-blue-800">
            <li className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Clique na área pontilhada ou arraste imagens diretamente
            </li>
            <li className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              A primeira imagem será automaticamente a capa do produto
            </li>
            <li className="flex items-center gap-2">
              <Move className="w-4 h-4" />
              Clique e arraste qualquer imagem para reordenar
            </li>
          </ul>
          <div className="bg-blue-100 rounded-md p-2 mt-3">
            <p className="text-xs text-blue-800 font-medium">
              💡 Dica: Segure e arraste pela área inteira da imagem para reordenar facilmente!
            </p>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            Formatos aceitos: PNG, JPG, WEBP • Máximo 6 imagens por produto
          </p>
        </div>
      </div>
    </div>
  );
}
