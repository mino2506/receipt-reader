/*
  Warnings:

  - You are about to alter the column `normalized` on the `Store` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - A unique constraint covering the columns `[normalized]` on the table `Store` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "normalized" SET DATA TYPE VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "Store_normalized_key" ON "Store"("normalized");
