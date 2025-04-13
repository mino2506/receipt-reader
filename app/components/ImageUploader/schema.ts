import {
	type ApiResponseFromType,
	createApiResponseSchema,
} from "@/lib/api/common.schema";
import { type OpenAIRequest, OpenAIRequestSchema } from "@/lib/openai/schema";
import { z } from "zod";

export const OpenAIReceiptCategorySchema = z.enum([
	"food",
	"drink",
	"snacks",
	"daily",
	"medical",
	"beauty_products",
	"clothing",
	"eating_out",
	"pet",
	"leisure",
	"transport",
	"utility",
	"other",
]);

export const OpenAIReceiptRequestSchema = z.object({
	text: z.string().min(1, "text must not be empty"),
});
export type OpenAIReceiptRequest = z.infer<typeof OpenAIReceiptRequestSchema>;

// 出力の仮定スキーマ（拡張前提）
export const OpenAiReceiptDataSchema = z
	.object({
		store: z.string(),
		date: z.string().datetime(),
		// ISO 8601 UTC形式: YYYY-MM-DDTHH:mm:ssZ
		// 🔄 検証のみ：変換は後段の別スキーマで行う
		items: z
			.array(
				z.object({
					name: z.string(),
					quantity: z.number().nullable(),
					price: z.number().nullable(),
					subtotal: z.number().nullable(),
					discount: z.number().nullable(),
					category: OpenAIReceiptCategorySchema,
					taxRate: z.number(),
					taxRateSource: z.enum(["explicit", "inferred"]),
				}),
			)
			.min(1, "1件以上の商品が必要です"),
		total: z.number(),
		discount: z.number().nullable(),
		tax: z
			.record(z.string().regex(/^\d+$/), z.number().nullable()) // 税率をキーとした税額。例: {"8": 10}
			.nullable(),
		payment: z.string(),
	})
	.strict();

export const parseOpenAiReceiptDataSchema = OpenAiReceiptDataSchema.extend({
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
