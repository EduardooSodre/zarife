# 🛍️ Zarife - Loja de Roupas Moderna

Uma loja de roupas moderna e elegante desenvolvida com Next.js, TypeScript, Tailwind CSS, Clerk e Stripe.

## ✨ Funcionalidades

### 🛒 Funcionalidades Públicas
- ✅ Homepage com hero section e produtos em destaque
- ✅ Catálogo de produtos com filtros avançados
- ✅ Página de detalhes do produto com galeria de imagens
- ✅ Carrinho de compras interativo
- ✅ Checkout integrado com Stripe
- ✅ Autenticação com Clerk (Google/Email)
- ✅ Área do cliente com histórico de pedidos
- ✅ SEO otimizado

### 🔧 Painel Administrativo
- ✅ Dashboard com métricas importantes
- ✅ Gestão completa de produtos
- ✅ Gerenciamento de categorias
- ✅ Visualização e gestão de pedidos
- ✅ Gestão de usuários
- ✅ Sistema de cupons de desconto

## 🛠️ Tecnologias

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS com tema customizado
- **Banco de Dados:** PostgreSQL com Prisma ORM
- **Autenticação:** Clerk
- **Pagamentos:** Stripe
- **Upload de Imagens:** UploadThing
- **UI Components:** Radix UI + shadcn/ui

## 🚀 Configuração do Projeto

### Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL database
- Contas configuradas:
  - [Clerk](https://clerk.com/) para autenticação
  - [Stripe](https://stripe.com/) para pagamentos
  - [UploadThing](https://uploadthing.com/) para upload de imagens

### 1. Clone e Instale Dependências

```bash
git clone <repository-url>
cd zarife
npm install
```

### 2. Configuração do Banco de Dados

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Configure as variáveis de ambiente no arquivo `.env`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/zarife_store"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# UploadThing (para upload de imagens)
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=app_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configure o Banco de Dados

```bash
# Gerar o cliente Prisma
npm run db:generate

# Executar as migrações
npm run db:migrate

# Popular o banco com dados de exemplo
npm run db:seed
```

### 4. Configuração do Clerk

1. Acesse [Clerk Dashboard](https://dashboard.clerk.com/)
2. Crie uma nova aplicação
3. Configure as URLs de redirect:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/`
   - After sign-up: `/`

4. Adicione as chaves no arquivo `.env`

### 5. Configuração do Stripe

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/)
2. Obtenha as chaves da API (modo teste)
3. Configure o webhook endpoint: `your-domain/api/webhooks/stripe`
4. Adicione as chaves no arquivo `.env`

### 6. Executar o Projeto

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

Acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação.

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── admin/             # Painel administrativo
│   ├── api/               # API Routes
│   ├── sign-in/           # Página de login
│   ├── sign-up/           # Página de cadastro
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Homepage
├── components/            # Componentes React
│   ├── layout/           # Componentes de layout
│   └── ui/               # Componentes de UI
├── lib/                  # Utilitários e configurações
├── types/                # Definições de tipos TypeScript
└── db/                   # Configuração do banco
prisma/
├── schema.prisma         # Schema do banco de dados
└── seed.ts              # Dados iniciais
```

## 🎨 Personalização de Cores

As cores do tema estão configuradas no `tailwind.config.ts`:

```js
colors: {
  primary: "#1a1a1a",      // Cor principal (preto elegante)
  accent: "#d4af37",       // Cor de destaque (dourado)
  neutral: {...},          // Tons neutros
}
```

## 📊 Scripts Disponíveis

```bash
npm run dev          # Executa em modo desenvolvimento
npm run build        # Build para produção
npm run start        # Executa build de produção
npm run lint         # Executa o linter
npm run db:push      # Sincroniza schema com banco
npm run db:studio    # Abre Prisma Studio
npm run db:seed      # Popula banco com dados
npm run db:migrate   # Executa migrações
npm run db:generate  # Gera cliente Prisma
```

## 🔒 Permissões e Roles

O sistema possui dois tipos de usuário:

- **USER:** Acesso às funcionalidades públicas
- **ADMIN:** Acesso ao painel administrativo

Para tornar um usuário admin, atualize o campo `role` no banco de dados.

## 🚀 Deploy

### Vercel (Recomendado)

1. Push do código para um repositório Git
2. Conecte o repositório no [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy automático

### Outras Plataformas

O projeto pode ser deployado em qualquer plataforma que suporte Next.js:
- Railway
- Render
- Heroku
- AWS
- Google Cloud

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 💬 Suporte

Se precisar de ajuda:

1. Verifique a documentação
2. Abra uma issue no GitHub
3. Entre em contato: contato@zarife.com.br

---

Desenvolvido com ❤️ para a **Zarife** - Moda Moderna e Elegante
