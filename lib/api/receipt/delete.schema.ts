import { z } from "zod";

import { CategoryEnum, CurrencyEnum, IsoDateSchema } from "./common.schema";

export const DeleteReceiptSchema = z.object({
	id: z.string().uuid(),
});
export type DeleteReceipt = z.infer<typeof DeleteReceiptSchema>;

export const DeleteReceiptDetailSchema = z.object({
	id: z.string().uuid(),
});
export type DeleteReceiptDetail = z.infer<typeof DeleteReceiptDetailSchema>;

export const DeleteReceiptDetailArraySchema = z.array(
	DeleteReceiptDetailSchema,
);
export type DeleteReceiptDetailArray = z.infer<
	typeof DeleteReceiptDetailArraySchema
>;

export const DeleteReceiptWithDetailsSchema = DeleteReceiptSchema.extend({
	receiptDetails: DeleteReceiptDetailArraySchema,
}).transform(({ receiptDetails, ...rest }) => ({
	...rest,
	details: receiptDetails,
}));
export type DeleteReceiptWithDetails = z.infer<
	typeof DeleteReceiptWithDetailsSchema
>;
