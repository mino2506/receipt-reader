import type { ReceiptWithItemDetails } from "@/lib/api/receipt/get.schema";

import type { CreateReceiptWithItemDetails } from "@/lib/api/receipt";

export function createOptimisticReceipt(
	receipt: CreateReceiptWithItemDetails,
): ReceiptWithItemDetails {
	if (receipt.details.length === 0)
		throw new Error("レシートの明細がありません");
	return {
		...receipt,
		store: {
			id: "-",
			rawName: receipt.store?.rawName ?? "-",
			normalized: receipt.store?.normalized ?? null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deletedAt: null,
		},
		date: receipt.date ?? null,
		totalPrice: receipt.totalPrice,
		id: "-",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
		details: receipt.details.map((detail, index) => ({
			...detail,
			id: `00000000-0000-0000-0000-${index.toString().padStart(12, "0")}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deletedAt: null,
			item: {
				id: `00000000-0000-0000-0000-${index.toString().padStart(12, "0")}`,
				rawName: detail.item.rawName,
				normalized: detail.item.normalized ?? null,
				category: detail.item.category,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		})),
	};
}
