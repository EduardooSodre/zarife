-- AlterEnum
ALTER TYPE "public"."OrderStatus" ADD VALUE 'PROCESSING';

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "tracking_code" TEXT;
