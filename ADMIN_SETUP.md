## 🔧 Configuração de Administrador

Para acessar o painel administrativo, você precisa primeiro configurar um usuário como administrador:

### Passos para Configuração:

1. **Acesse a página de configuração:**
   - Vá para: `http://localhost:3000/admin/setup`

2. **Configure o primeiro administrador:**
   - Faça login com sua conta
   - Na página de setup, clique em "Tornar Admin" no seu usuário
   - Isso definirá você como administrador do sistema

3. **Acesse o painel admin:**
   - Após se tornar admin, vá para: `http://localhost:3000/admin`
   - Agora você terá acesso completo ao painel administrativo

### Funcionalidades do Admin:

- ✅ Gerenciar produtos
- ✅ Gerenciar categorias  
- ✅ Visualizar pedidos
- ✅ Gerenciar usuários
- ✅ Proteção por autenticação
- ✅ Interface responsiva

### Segurança:

- ✅ Só usuários com papel "ADMIN" podem acessar
- ✅ Verificação no servidor e cliente
- ✅ Redirecionamento automático se não autorizado

### Próximos Passos:

1. Configure seu primeiro admin em `/admin/setup`
2. Remova a página de setup após configuração (opcional)
3. Use o painel admin em `/admin`

---

**Nota:** A página `/admin/setup` é temporária e serve apenas para configuração inicial. Após definir o primeiro administrador, ela pode ser removida por segurança.
