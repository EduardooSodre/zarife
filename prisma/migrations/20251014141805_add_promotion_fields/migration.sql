-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "is_on_sale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sale_percentage" INTEGER,
ADD COLUMN     "sale_price" DECIMAL(65,30);

-- CreateIndex
CREATE INDEX "products_is_on_sale_idx" ON "public"."products"("is_on_sale");
