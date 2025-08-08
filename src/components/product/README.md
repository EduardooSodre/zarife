# ProductCard Component

## Descrição
Componente reutilizável para exibição de cards de produtos com animações do Framer Motion.

## Uso
```tsx
import { ProductCard } from '@/components/product/product-card';

<ProductCard 
  product={product}
  index={index}
  delay={0.1}
  className="custom-class"
/>
```

## Props

### product (obrigatório)
- **id**: string - ID único do produto
- **name**: string - Nome do produto
- **price**: number | Decimal - Preço do produto
- **oldPrice**: number | Decimal | null (opcional) - Preço anterior (para mostrar desconto)
- **images**: Array com objetos { url: string } | null (opcional) - Imagens do produto
- **category**: { name: string, slug: string } | null (opcional) - Categoria do produto

### index (opcional)
- **type**: number
- **default**: 0
- **descrição**: Índice do produto no grid, usado para calcular delay automático

### delay (opcional)
- **type**: number
- **descrição**: Delay personalizado para animação (sobrescreve o cálculo automático baseado no index)

### className (opcional)
- **type**: string
- **default**: ""
- **descrição**: Classes CSS adicionais

## Características
- ✅ Animações suaves com Framer Motion
- ✅ Hover effects responsivos
- ✅ Suporte a preços antigos (riscar preço)
- ✅ Exibição de categoria
- ✅ Botão de adicionar ao carrinho integrado
- ✅ Layout responsivo
- ✅ Placeholder para produtos sem imagem
- ✅ TypeScript com tipagem completa

## Onde é usado
- Home page (produtos em destaque)
- Página de todos os produtos (/produtos)
- Páginas de categoria (/category/[slug])

## Animações incluídas
- Entrada com MotionCard (fade + slide up)
- Hover com scale e shadow
- Imagem com zoom no hover
- Categoria com mudança de cor no hover
