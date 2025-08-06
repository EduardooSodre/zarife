# 🚀 Configuração do Cloudinary - Guia Passo a Passo

## 📋 **PROBLEMA ATUAL:** Upload Preset não configurado

### ⚠️ Erro encontrado:

```
🔧 Configurações do Cloudinary: { cloudName: 'Zarife', uploadPreset: 'NÃO CONFIGURADO' }
❌ Configurações do Cloudinary não encontradas
```

## 🔧 **SOLUÇÃO RÁPIDA:**

### 1. **Acesse o Cloudinary Dashboard**

- Vá para: https://cloudinary.com/console
- Faça login com sua conta

### 2. **Criar Upload Preset**

- No menu lateral, clique em **"Settings"** (⚙️)
- Clique em **"Upload"**
- Role para baixo até **"Upload presets"**
- Clique em **"Add upload preset"**

### 3. **Configurar o Preset**

- **Preset name:** `zarife_uploads`
- **Signing Mode:** Selecione **"Unsigned"** (MUITO IMPORTANTE!)
- **Use filename:** Pode deixar marcado
- **Unique filename:** Marque para evitar conflitos
- **Resource type:** Deixe como "Auto"
- **Access mode:** Deixe como "Public"

### 4. **Salvar**

- Clique em **"Save"**

### 5. **Reiniciar Servidor**

```bash
# Parar o servidor (Ctrl+C) e executar:
npm run dev
```

## ✅ **TESTE**

1. Vá para uma página de edição de categoria
2. Tente fazer upload de uma imagem
3. Verifique os logs no console
4. Deve aparecer: "☁️ Enviando para Cloudinary..."

## 🚨 **Se ainda der erro:**

Tente mudar o nome do preset para `zarife` no `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=zarife
```

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
