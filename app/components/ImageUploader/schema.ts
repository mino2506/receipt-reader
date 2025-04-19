import { z } from "zod";

import {
	type ApiResponseFromType,
	createApiResponseSchema,
} from "@/lib/api/common.schema";
import { CategoryEnum, CurrencyEnum } from "@/lib/api/receipt/common.schema";
import { type OpenAIRequest, OpenAIRequestSchema } from "@/lib/openai/schema";

export const OpenAIReceiptRequestSchema = z.object({
	text: z.string().min(1, "text must not be empty"),
});
export type OpenAIReceiptRequest = z.infer<typeof OpenAIReceiptRequestSchema>;

// 出力の仮定スキーマ（拡張前提）
export const OpenAiReceiptDataSchema = z
	.object({
		totalPrice: z.number(),
		date: z.string().datetime(), // 後段で .transform(new Date) に変更してもOK
		store: z.object({
			rawName: z.string(),
		}),
		totalDiscount: z.number().nullable(),
		totalTax: z.record(z.string().regex(/^\d+$/), z.number()),
		details: z
			.array(
				z.object({
					item: z.object({
						rawName: z.string(),
						category: CategoryEnum,
					}),
					amount: z.number().int().min(1).nullable(),
					unitPrice: z.number().min(0).nullable(),
					subTotalPrice: z.number().min(0),
					tax: z.number().min(0).nullable(),
					discount: z.number().nullable(),
					currency: CurrencyEnum, // 通常は "JPY"
					taxRate: z.number().int(),
					taxRateSource: z.enum(["explicit", "inferred"]),
				}),
			)
			.min(1),
	})
	.strict();

export const transformOpenAiReceiptDataSchema = OpenAiReceiptDataSchema.extend({
	date: z
		.string()
		.datetime()
		.transform((val) => new Date(val)), // TODO: 🌟日付の変換 時差の変換も必要
});

export type OpenAiReceiptData = z.infer<typeof OpenAiReceiptDataSchema>;

export const OpenAiApiReceiptResponseSchema = createApiResponseSchema(
	OpenAiReceiptDataSchema,
);
export type OpenAiApiReceiptResponse = z.infer<
	typeof OpenAiApiReceiptResponseSchema
>;
