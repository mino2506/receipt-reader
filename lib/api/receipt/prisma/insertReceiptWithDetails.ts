import { prisma } from "@/lib/prisma";

import type { CreateReceiptDetailArray } from "@/lib/api/receipt/create.schema";
import type { CreateReceiptWithItemDetails } from "@/lib/api/receipt/create.schema";

export async function insertReceiptWithDetails(
	input: CreateReceiptWithItemDetails,
	userId: string,
) {
	return await prisma.$transaction(async (tx) => {
		const createdReceipt = await tx.receipt.create({
			data: {
				totalPrice: input.totalPrice,
				userId,
			},
		});

		const searchKeys = input.details.map((d) =>
			d.item.normalized
				? { normalized: d.item.normalized, rawName: d.item.rawName }
				: { rawName: d.item.rawName },
		);
		const uniqueKeys = Array.from(new Set(searchKeys));
		const existingItems = await tx.item.findMany({
			where: {
				OR: uniqueKeys,
			},
		});
		const itemMap = new Map<string, (typeof existingItems)[number]>();
		for (const item of existingItems) {
			const key = item.normalized ?? item.rawName;
			itemMap.set(key, item);
		}

		const detailsToCreate: CreateReceiptDetailArray = [];

		for (const detail of input.details) {
			const existingItem = await tx.item.findFirst({
				where: detail.item.normalized
					? { normalized: detail.item.normalized }
					: { rawName: detail.item.rawName },
			});

			const item =
				existingItem ??
				(await tx.item.create({
					data: {
						rawName: detail.item.rawName,
						normalized: detail.item.normalized ?? null,
						category: detail.item.category,
					},
				}));

			detailsToCreate.push({
				amount: detail.amount,
				unitPrice: detail.unitPrice,
				subTotalPrice: detail.subTotalPrice,
				tax: detail.tax,
				currency: detail.currency,
				itemId: item.id,
				receiptId: createdReceipt.id,
			});
		}

		await tx.receiptDetail.createMany({ data: detailsToCreate });

		return createdReceipt.id;
	});
}
