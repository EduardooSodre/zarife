/*
  Warnings:

  - The values [NEW] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `customer_email` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_first_name` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_last_name` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_phone` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_method` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_address` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_city` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_country` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_postal_code` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipping_state` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."OrderStatus_new" AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED');
ALTER TABLE "public"."orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."orders" ALTER COLUMN "status" TYPE "public"."OrderStatus_new" USING ("status"::text::"public"."OrderStatus_new");
ALTER TYPE "public"."OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "public"."OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "public"."orders" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "customer_email" TEXT NOT NULL,
ADD COLUMN     "customer_first_name" TEXT NOT NULL,
ADD COLUMN     "customer_last_name" TEXT NOT NULL,
ADD COLUMN     "customer_phone" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "payment_method" TEXT NOT NULL,
ADD COLUMN     "shipping" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "shipping_address" TEXT NOT NULL,
ADD COLUMN     "shipping_city" TEXT NOT NULL,
ADD COLUMN     "shipping_complement" TEXT,
ADD COLUMN     "shipping_country" TEXT NOT NULL,
ADD COLUMN     "shipping_postal_code" TEXT NOT NULL,
ADD COLUMN     "shipping_state" TEXT NOT NULL,
ADD COLUMN     "subtotal" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';
