-- Índices para otimizar performance do banco de dados
-- Execute no seu PostgreSQL para reduzir uso de RAM

-- Índices para a tabela Product
CREATE INDEX IF NOT EXISTS idx_product_active ON "products"("is_active");
CREATE INDEX IF NOT EXISTS idx_product_featured ON "products"("is_featured");
CREATE INDEX IF NOT EXISTS idx_product_category ON "products"("category_id");
CREATE INDEX IF NOT EXISTS idx_product_created_at ON "products"("created_at");
CREATE INDEX IF NOT EXISTS idx_product_active_featured ON "products"("is_active", "is_featured");

-- Índices para a tabela Category
CREATE INDEX IF NOT EXISTS idx_category_active ON "categories"("is_active");
CREATE INDEX IF NOT EXISTS idx_category_parent ON "categories"("parent_id");
CREATE INDEX IF NOT EXISTS idx_category_slug ON "categories"("slug");

-- Índices para a tabela ProductImage
CREATE INDEX IF NOT EXISTS idx_image_product ON "product_images"("product_id");
CREATE INDEX IF NOT EXISTS idx_image_order ON "product_images"("product_id", "order");

-- Índices para a tabela Order
CREATE INDEX IF NOT EXISTS idx_order_user ON "orders"("user_id");
CREATE INDEX IF NOT EXISTS idx_order_status ON "orders"("status");
CREATE INDEX IF NOT EXISTS idx_order_created_at ON "orders"("created_at");

-- Índices para a tabela User
CREATE INDEX IF NOT EXISTS idx_user_clerk ON "users"("clerk_id");
CREATE INDEX IF NOT EXISTS idx_user_role ON "users"("role");

-- Estatísticas do banco para verificar melhoria
SELECT 
    schemaname,
    tablename,
    attname as column_name,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'categories', 'product_images', 'orders', 'users')
ORDER BY tablename, attname;
