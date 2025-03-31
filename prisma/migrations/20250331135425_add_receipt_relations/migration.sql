-- CreateTable
CREATE TABLE "Receipt" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "totalPrice" INTEGER NOT NULL,
    "receiptDetailId" TEXT NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceiptDetail" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "item" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "subTotalPrice" INTEGER NOT NULL,
    "tax" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "category" INTEGER NOT NULL,
    "receiptId" INTEGER NOT NULL,

    CONSTRAINT "ReceiptDetail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReceiptDetail" ADD CONSTRAINT "ReceiptDetail_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
