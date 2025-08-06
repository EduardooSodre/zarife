# Configuração do Cloudinary

## Pré-requisitos

1. Criar uma conta no [Cloudinary](https://cloudinary.com/)
2. Acessar o Dashboard e copiar as informações necessárias

## Configuração das Variáveis de Ambiente

No arquivo `.env.local`, configure as seguintes variáveis:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=zarife
```

## Como obter as informações:

### 1. Cloud Name
- Acesse o Dashboard do Cloudinary
- O Cloud Name aparece no topo da página

### 2. Upload Preset
- Vá em Settings > Upload
- Clique em "Add upload preset"
- Nome: `zarife`
- Signing Mode: **Unsigned**
- Folder: `zarife/categories` (opcional)
- Allowed formats: `jpg,png,gif,webp`
- Salve o preset

## Teste de Funcionamento

1. Configure as variáveis de ambiente
2. Reinicie o servidor de desenvolvimento
3. Acesse qualquer página de edição de categoria
4. Tente fazer upload de uma imagem

## Troubleshooting

### Erro: "Configurações do Cloudinary não encontradas"
- Verifique se as variáveis de ambiente estão configuradas
- Reinicie o servidor de desenvolvimento

### Erro: "Erro ao fazer upload para o Cloudinary"
- Verifique se o Upload Preset está configurado como "Unsigned"
- Verifique se o nome do preset está correto

### Imagem aparece como base64
- Isso acontece quando o Cloudinary falha
- A imagem será salva como base64 no banco de dados
- Configure o Cloudinary corretamente para resolver

## Estrutura de Pastas no Cloudinary

Recomendamos organizar as imagens da seguinte forma:
- `zarife/categories/` - Imagens de categorias
- `zarife/products/` - Imagens de produtos
- `zarife/users/` - Imagens de usuários
