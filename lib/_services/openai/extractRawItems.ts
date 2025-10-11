import type { UnknownError } from "@/lib/_error/common.error";
import type { OpenAiService } from "@/lib/_services/openai/openaiService";
import { type JsonParseError, parseJson } from "@/lib/_utils/parseJson";
import { Effect, pipe } from "effect";
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources/index.mjs";
import { ZodError, z } from "zod/v4";
import { type CallOpenAiError, callOpenAiWithFunctionCall } from "./callOpenAi";
import { buildFunctionCallPrompt } from "./promptBuilder";

export type ExtractRawItemsValidationError =
	| { _tag: "InvalidExtractRawItems"; cause: ZodError }
	| UnknownError;

export type ExtractRawItemsError =
	| CallOpenAiError
	| JsonParseError
	| ExtractRawItemsValidationError;

export const RawItemSchema = z.object({
	lineIndex: z.number(),
	interpretedText: z.string().min(1),
});

export type RawItem = z.infer<typeof RawItemSchema>;

export const ExtractRawItemsSchema = z.object({
	rawItems: z.array(RawItemSchema),
});
export type ExtractRawItems = z.infer<typeof ExtractRawItemsSchema>;

export const buildExtractRawItemsPrompt = (
	lines: string[],
): Effect.Effect<ChatCompletionCreateParamsNonStreaming, never, never> =>
	buildFunctionCallPrompt({
		systemPrompt: `
あなたは日本のレシートのOCR結果から、商品明細の行だけを抽出するアシスタントです。
ユーザーから提供されたOCRテキストに対し、関数 "extract_raw_items" を使って構造化してください。
`.trim(),
		userPrompt: lines.map((line, i) => `${i}: ${line}`).join("\n"),
		tool: {
			name: "extract_raw_items",
			description: "レシートから商品らしい行を抽出する",
			parameters: ExtractRawItemsSchema,
		},
	});

export const validateExtractRawItems = (
	rawItems: unknown,
): Effect.Effect<ExtractRawItems, ExtractRawItemsValidationError, never> =>
	Effect.try({
		try: () => ExtractRawItemsSchema.parse(rawItems),
		catch: (cause) =>
			cause instanceof ZodError
				? { _tag: "InvalidExtractRawItems", cause }
				: { _tag: "UnknownError", cause },
	});

export const extractRawItems = (
	lines: string[],
): Effect.Effect<ExtractRawItems, ExtractRawItemsError, OpenAiService> =>
	pipe(
		buildExtractRawItemsPrompt(lines),
		Effect.flatMap((body) => callOpenAiWithFunctionCall(body)),
		Effect.flatMap((res) => parseJson(res)),
		Effect.flatMap((json) => validateExtractRawItems(json)),
	);
