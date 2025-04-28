import { prisma } from "@/lib/prisma";

import { upsertItems } from "@/lib/api/receipt/prisma/upsertItems";
import { upsertStore } from "@/lib/api/receipt/prisma/upsertStore";

import type { CreateReceiptDetailArray } from "@/lib/api/receipt/create.schema";
import type { CreateReceiptWithItemDetails } from "@/lib/api/receipt/create.schema";
import type { PrismaClient } from "@prisma/client";
import type { ITXClientDenyList } from "@prisma/client/runtime/library";

export async function insertReceiptWithDetails(
	input: CreateReceiptWithItemDetails,
	userId: string,
) {
	return await prisma.$transaction(
		async (tx: Omit<PrismaClient, ITXClientDenyList>) => {
			const storeId = input.store ? await upsertStore(tx, input.store) : null;

			const createdReceipt = await tx.receipt.create({
				data: {
					totalPrice: input.totalPrice,
					userId,
					date: input.date ?? null,
					storeId,
				},
			});

			const itemMap = await upsertItems(
				tx,
				input.details.map((d) => d.item),
			);

			const detailsToCreate: CreateReceiptDetailArray = input.details.map(
				(detail) => {
					const key = detail.item.normalized ?? detail.item.rawName;
					const itemId = itemMap.get(key);
					if (!itemId) throw new Error(`itemId not found for key: ${key}`);

					return {
						amount: detail.amount,
						unitPrice: detail.unitPrice,
						subTotalPrice: detail.subTotalPrice,
						tax: detail.tax,
						currency: detail.currency,
						itemId,
						receiptId: createdReceipt.id,
						order: detail.order,
					};
				},
			);

			await tx.receiptDetail.createMany({ data: detailsToCreate });

			return createdReceipt.id;
		},
	);
}
