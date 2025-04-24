import type { ReceiptDetailWithItem } from "@/lib/api/receipt/get.schema";
import type { UpdateReceiptDetailInput } from "@/lib/api/receipt/update.schema";

export function buildUpdatePayload(
	detail: ReceiptDetailWithItem,
	updated: Partial<ReceiptDetailWithItem>,
): UpdateReceiptDetailInput {
	const item = updated.item ?? detail.item;
	const amount = updated.amount ?? detail.amount;
	const unitPrice = updated.unitPrice ?? detail.unitPrice;
	const subTotalPrice = updated.subTotalPrice ?? detail.subTotalPrice;
	const tax = updated.tax ?? detail.tax;

	const REDUCED_TAX_RATE = 0.08;
	const STANDARD_TAX_RATE = 0.1;
	const REDUCED_TAXES = ["food", "drink", "snacks"];
	const isReducedTax = REDUCED_TAXES.includes(item.category);
	const calcTax = (subtotal: number, isReduced: boolean) => {
		const rate = isReduced ? REDUCED_TAX_RATE : STANDARD_TAX_RATE;
		return Math.round(subtotal - subtotal * (1 / (1 + rate)));
	};

	const draft = { ...item, amount, unitPrice, subTotalPrice, tax };
	if (updated.unitPrice) {
		draft.subTotalPrice = updated.unitPrice * amount;
		draft.tax = calcTax(draft.subTotalPrice, isReducedTax);
	}
	if (updated.subTotalPrice) {
		draft.unitPrice = updated.subTotalPrice / amount;
		draft.tax = calcTax(updated.subTotalPrice, isReducedTax);
	}
	if (updated.amount) {
		draft.subTotalPrice = updated.amount * unitPrice;
		draft.tax = calcTax(draft.subTotalPrice, isReducedTax);
	}

	const payload = {
		id: detail.id,
		amount: draft.amount,
		unitPrice: draft.unitPrice,
		subTotalPrice: draft.subTotalPrice,
		tax: draft.tax,

		currency: detail.currency,
		itemId: updated.item?.id ?? detail.item.id,
		order: detail.order,
	};

	return payload;
}
