/*
  Warnings:

  - You are about to drop the column `gender` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."products" DROP COLUMN "gender",
DROP COLUMN "stock";
