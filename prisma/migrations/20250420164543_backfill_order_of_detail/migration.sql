/*
  Warnings:

  - Made the column `order` on table `ReceiptDetail` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ReceiptDetail" ALTER COLUMN "order" SET NOT NULL;
