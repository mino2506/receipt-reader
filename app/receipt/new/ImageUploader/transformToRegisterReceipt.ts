import type { OpenAiReceiptData } from "./schema";

import type { CreateReceiptWithItemDetails } from "@/lib/api/receipt";

export function transformToRegisterReceipt(
	rawReceipt: OpenAiReceiptData,
): CreateReceiptWithItemDetails {
	const { details, ...rest } = rawReceipt;

	const DEFAULT_AMOUNT = 1;
	const REDUCED_TAX_CATEGORYS = ["food", "drink", "snacks"];
	const REDUCED_TAX_RATE = 8;
	const STANDARD_TAX_RATE = 10;

	const transformed = {
		...rest,
		details: details.map((d, i) => {
			return {
				...d,
				amount: d.amount ?? DEFAULT_AMOUNT,
				unitPrice:
					d.unitPrice ??
					(d.amount !== null && d.amount > 0 ? d.subTotalPrice / d.amount : 0),
				tax:
					d.tax ??
					d.subTotalPrice -
						(d.subTotalPrice * 100) /
							(100 +
								(d.tax ??
									(REDUCED_TAX_CATEGORYS.includes(d.item.category)
										? REDUCED_TAX_RATE
										: STANDARD_TAX_RATE))),
				order: i + 1,
			};
		}),
	};

	if (transformed.details.length === 0) {
		throw new Error("構造化されたレシートデータがありません");
	}

	return transformed;
}
