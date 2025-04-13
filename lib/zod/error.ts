import type { ZodError } from "zod";

/**
 * Zod のバリデーションエラーを読みやすい形式に整形する
 *
 * @param error - ZodError オブジェクト
 * @returns 各フィールドごとのエラーメッセージ一覧
 *
 * @example
 * {
 *   "items[0].name": "Required",
 *   "tax": "Must match pattern /^\d+$/"
 * }
 * @example
 * const result = OpenAiReceiptDataSchema.safeParse(inputJson);
 * if (!result.success) {
 *   const formatted = formatZodError(result.error);
 *   console.table(formatted); // コンソールで見やすく出力
 * }
 */
export function formatZodError(error: ZodError): Record<string, string> {
	const formatted: Record<string, string> = {};
	for (const issue of error.issues) {
		const path = issue.path.join(".");
		formatted[path] = issue.message;
	}
	return formatted;
}
