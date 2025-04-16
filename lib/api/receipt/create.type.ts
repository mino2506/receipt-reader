import { z } from "zod";

import type { ApiResponseFromType } from "@/lib/api/common.schema";
import {
	CreateReceiptDetailWithItemArraySchema,
	CreateReceiptSchema,
	CreatedReceiptDetailArraySchema,
	CreatedReceiptSchema,
} from "@/lib/api/receipt";

// [Input]
export const CreateReceiptWithItemDetailsSchema = z.object({
	receipt: CreateReceiptSchema,
	details: CreateReceiptDetailWithItemArraySchema,
});
export type CreateReceiptWithDetailsInput = z.infer<
	typeof CreateReceiptWithItemDetailsSchema
>;

// [Output]
export const CreatedReceiptWithDetailsSchema = z.object({
	receipt: CreatedReceiptSchema,
	details: CreatedReceiptDetailArraySchema,
});
export type CreatedReceiptWithDetails = z.infer<
	typeof CreatedReceiptWithDetailsSchema
>;

export type ApiResponseReceiptWithDetails =
	ApiResponseFromType<CreatedReceiptWithDetails>;
