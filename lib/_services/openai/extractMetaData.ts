import type { UnknownError } from "@/lib/_error/common.error";
import type { OpenAiService } from "@/lib/_services/openai/openaiService";
import { type JsonParseError, parseJson } from "@/lib/_utils/parseJson";
import { Effect, pipe } from "effect";
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources/index.mjs";
import { ZodError, z } from "zod/v4";
import { type CallOpenAiError, callOpenAiWithFunctionCall } from "./callOpenAi";
import { buildFunctionCallPrompt } from "./promptBuilder";

export const ReceiptMetaDataSchema = z.object({
	totalPrice: z.number().describe("合計金額（税込）"),
	date: z
		.string()
		.describe("ISO 8601形式の日付（例: 2021-08-20T14:51:00+09:00）"),
	store: z.object({
		rawName: z.string().describe("レシートに記載された店舗名"),
	}),
	totalDiscount: z
		.union([z.number(), z.null()])
		.describe("全体の割引（なければ null）"),
	totalTax: z
		.object({
			"8": z.number(),
			"10": z.number(),
		})
		.describe('例: { "8": 120, "10": 380 }'),
	currency: z.literal("JPY"),
});

export type ReceiptMetaData = z.infer<typeof ReceiptMetaDataSchema>;

export const buildExtractMetaDataPrompt = (
	lines: string[],
): Effect.Effect<ChatCompletionCreateParamsNonStreaming, never, never> =>
	buildFunctionCallPrompt({
		systemPrompt: `
あなたは日本のレシートOCR結果から、店舗情報・日時・支払い方法・合計金額・税率ごとの税額などの「メタデータ」を抽出するアシスタントです。
以下のOCR結果から、関数 "extract_receipt_meta" を使って必要な情報を構造化してください。

- 店舗名はレシート上部にあります
- 日時は「YYYY年MM月DD日 (曜日) hh:mm」の形式で書かれています
- 合計金額は「合計」や「TOTAL」の近くに記載されています（"¥348" など）
- 支払い方法は「QUICPay支払」「現金」「クレジット」など明記されています
- 通貨は常に "JPY" を指定してください
- 日付は ISO 形式（例："2021-08-20T14:51:00+09:00"）で返してください
- 税率ごとの税額は、税率をキーとしたオブジェクトで返してください（例: { "8": 120, "10": 380 }）
`.trim(),
		userPrompt: lines.map((line) => line).join("\n"),
		tool: {
			name: "extract_receipt_meta",
			description:
				"レシートのメタデータ（店名、日時、支払方法、合計など）を抽出する",
			parameters: ReceiptMetaDataSchema,
		},
	});

type ReceiptMetaValidationError =
	| { _tag: "InvalidReceiptMetaData"; cause: ZodError }
	| UnknownError;

export const validateReceiptMetaData = (
	data: unknown,
): Effect.Effect<ReceiptMetaData, ReceiptMetaValidationError, never> =>
	Effect.try({
		try: () => ReceiptMetaDataSchema.parse(data),
		catch: (cause) =>
			cause instanceof ZodError
				? { _tag: "InvalidReceiptMetaData", cause }
				: { _tag: "UnknownError", cause },
	});

export type ExtractMetaDataError =
	| CallOpenAiError
	| JsonParseError
	| ReceiptMetaValidationError;

export const extractMetaData = (
	lines: string[],
): Effect.Effect<ReceiptMetaData, ExtractMetaDataError, OpenAiService> =>
	pipe(
		buildExtractMetaDataPrompt(lines),
		Effect.tap((prompt) => console.log(JSON.stringify(prompt, null, 2))),
		Effect.flatMap(callOpenAiWithFunctionCall),
		Effect.flatMap(parseJson),
		Effect.flatMap(validateReceiptMetaData),
	);
