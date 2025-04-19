-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "storeId" UUID;

-- CreateTable
CREATE TABLE "Store" (
    "id" UUID NOT NULL,
    "rawName" TEXT NOT NULL,
    "normalized" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
