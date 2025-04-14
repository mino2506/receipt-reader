/*
  Warnings:

  - The primary key for the `Receipt` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `receiptDetailId` on the `Receipt` table. All the data in the column will be lost.
  - The primary key for the `ReceiptDetail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `category` on the `ReceiptDetail` table. All the data in the column will be lost.
  - You are about to drop the column `item` on the `ReceiptDetail` table. All the data in the column will be lost.
  - Added the required column `itemId` to the `ReceiptDetail` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `amount` on the `ReceiptDetail` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `receiptId` on the `ReceiptDetail` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ReceiptDetail" DROP CONSTRAINT "ReceiptDetail_receiptId_fkey";

-- AlterTable
ALTER TABLE "Receipt" DROP CONSTRAINT "Receipt_pkey",
DROP COLUMN "receiptDetailId",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Receipt_id_seq";

-- AlterTable
ALTER TABLE "ReceiptDetail" DROP CONSTRAINT "ReceiptDetail_pkey",
DROP COLUMN "category",
DROP COLUMN "item",
ADD COLUMN     "itemId" UUID NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "amount",
ADD COLUMN     "amount" INTEGER NOT NULL,
ALTER COLUMN "currency" DROP NOT NULL,
DROP COLUMN "receiptId",
ADD COLUMN     "receiptId" UUID NOT NULL,
ADD CONSTRAINT "ReceiptDetail_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ReceiptDetail_id_seq";

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "rawName" TEXT NOT NULL,
    "normalized" VARCHAR(255),
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_normalized_key" ON "Item"("normalized");

-- AddForeignKey
ALTER TABLE "ReceiptDetail" ADD CONSTRAINT "ReceiptDetail_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptDetail" ADD CONSTRAINT "ReceiptDetail_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
