-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "products_deleted_at_idx" ON "public"."products"("deleted_at");
