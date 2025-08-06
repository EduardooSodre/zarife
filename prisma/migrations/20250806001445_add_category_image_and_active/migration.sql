/*
  Warnings:

  - You are about to drop the column `header_order` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `parent_id` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `show_in_header` on the `categories` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."categories" DROP CONSTRAINT "categories_parent_id_fkey";

-- AlterTable
ALTER TABLE "public"."categories" DROP COLUMN "header_order",
DROP COLUMN "parent_id",
DROP COLUMN "show_in_header",
ADD COLUMN     "image" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;
