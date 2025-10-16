-- AlterTable
ALTER TABLE "public"."product_images" ADD COLUMN     "product_variant_id" TEXT;

-- AlterTable
ALTER TABLE "public"."product_variants" ADD COLUMN     "sku" TEXT;

-- AddForeignKey
ALTER TABLE "public"."product_images" ADD CONSTRAINT "product_images_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
