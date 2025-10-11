import type { UnknownError } from "@/lib/_error/common.error";
import { type JsonParseError, parseJson } from "@/lib/_utils/parseJson";
import { Effect, pipe } from "effect";
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources/index.mjs";
import { ZodError, z } from "zod/v4";
import { type CallOpenAiError, callOpenAiWithFunctionCall } from "./callOpenAi";
import type { RawItem } from "./extractRawItems";
import type { OpenAiService } from "./openaiService";
import { buildFunctionCallPrompt } from "./promptBuilder";

export const CategorySchema = z.enum([
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

export const RawItemDetailSchema = z.object({
	item: z.object({
		rawName: z.string().describe("レシートに記載された商品名"),
		category: CategorySchema.describe(
			'商品名から推論。不明な場合は "other" を使用',
		),
		amount: z
			.number()
			.describe(
				"数量（例: '2個', '2×99円' のように明記されている数値。なければ 1 ）",
			),
		price: z.number().describe("金額"),
		discount: z.number().nullable().describe("割引金額"),
		currency: z.literal("JPY"),
	}),
});

export type RawItemDetail = z.infer<typeof RawItemDetailSchema>;

export const buildAnalyzeRawItemPrompt = (
	rawItem: RawItem,
): Effect.Effect<ChatCompletionCreateParamsNonStreaming, never, never> =>
	buildFunctionCallPrompt({
		systemPrompt: `
あなたは日本のレシートの商品明細1行を構造化するアシスタントです。
ユーザーから提供されたテキスト行を Function Calling によって家計簿向け構造に変換してください。
`.trim(),
		userPrompt: `商品明細: ${rawItem.interpretedText}`,
		tool: {
			name: "parse_item_detail",
			description: "商品明細行を構造化して家計簿システムに登録可能にする",
			parameters: RawItemDetailSchema,
		},
	});

type AnalyzeRawItemsValidationError =
	| { _tag: "InvalidAnalyzeRawItemDetail"; cause: ZodError }
	| UnknownError;

export const validateRawItemDetail = (
	data: unknown,
): Effect.Effect<RawItemDetail, AnalyzeRawItemsValidationError, never> =>
	Effect.try({
		try: () => RawItemDetailSchema.parse(data) satisfies RawItemDetail,
		catch: (cause) =>
			cause instanceof ZodError
				? ({
						_tag: "InvalidAnalyzeRawItemDetail",
						cause,
					} satisfies AnalyzeRawItemsValidationError)
				: ({
						_tag: "UnknownError",
						cause,
					} satisfies AnalyzeRawItemsValidationError),
	});

type AnalyzeRawItemsError =
	| CallOpenAiError
	| JsonParseError
	| AnalyzeRawItemsValidationError;

export const analyzeRawItemDetail = (
	rawItem: RawItem,
): Effect.Effect<RawItemDetail, AnalyzeRawItemsError, OpenAiService> =>
	pipe(
		buildAnalyzeRawItemPrompt(rawItem),
		Effect.flatMap(callOpenAiWithFunctionCall),
		Effect.flatMap(parseJson),
		Effect.flatMap(validateRawItemDetail),
	);
