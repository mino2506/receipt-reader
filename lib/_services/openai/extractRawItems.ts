import type { UnknownError } from "@/lib/_error/common.error";
import type { OpenAiService } from "@/lib/_services/openai/openaiService";
import { formatZodError } from "@/lib/zod/error";
import { Effect, pipe } from "effect";
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources/index.mjs";
import { ZodError, z } from "zod";
import { type CallOpenAiError, callOpenAi } from "./callOpenAi";

export type ExtractRawItemsValidationError =
	| { _tag: "InvalidExtractRawItems"; cause: ZodError }
	| UnknownError;

export type ExtractRawItemsError =
	| CallOpenAiError
	| ExtractRawItemsValidationError;

const RawItemSchema = z.object({
	lineIndex: z.number(),
	text: z.string().min(1),
});

export const ExtractRawItemsSchema = z.array(RawItemSchema);
export type RawItem = z.infer<typeof RawItemSchema>;

export const validateExtractRawItems = (
	rawItems: unknown,
): Effect.Effect<RawItem[], ExtractRawItemsValidationError, never> =>
	Effect.try({
		try: () => ExtractRawItemsSchema.parse(rawItems),
		catch: (cause) =>
			cause instanceof ZodError
				? { _tag: "InvalidExtractRawItems", cause }
				: { _tag: "UnknownError", cause },
	});

export const buildExtractRawItemsPrompt = (
	lines: string[],
): Effect.Effect<ChatCompletionCreateParamsNonStreaming, never, never> =>
	Effect.gen(function* (_) {
		const systemPrompt = `
あなたは日本のレシートのOCR結果から、商品明細の行だけを抽出するAIです。

以下のルールで、商品らしい行だけをJSON配列で出力してください：
- 形式: [{ "lineIndex": number, "text": string }]
- 金額や数量が含まれている行を優先
- 割引や合計、ポイントなどの行は除外
- 商品名と数字が混在している行を対象
- その他の説明や装飾は一切不要
	`.trim();

		const userPrompt = lines.map((line, i) => `${i}: ${line}`).join("\n");

		return {
			model: "gpt-4",
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
			temperature: 0.2,
			max_tokens: 1000,
		};
	});

export const extractRawItems = (lines: string[]) =>
	pipe(
		buildExtractRawItemsPrompt(lines),
		Effect.flatMap((body) => callOpenAi(body)),
		// TODO: Add JSON parsing logic here
		Effect.flatMap((res) => validateExtractRawItems(res)),
	);
