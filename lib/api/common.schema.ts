// lib/api/common.schema.ts

import { z } from "zod";

/**
 * APIエラー構造（すべてのエラーで共通）
 *
 * @property code - スネークケースのエラー識別子（例: 'invalid_image_format'）
 * @property message - エラーメッセージ（UI表示などに使用）
 * @property hint - 任意の補助情報（例: 原因やヒント）
 * @property field - 任意：対象となるフォームやデータ項目名
 */
export const ApiErrorSchema = z.object({
	code: z.string().regex(/^[a-z0-9_]+$/, {
		message: "code must be in snake_case format",
	}),
	message: z.string(),
	hint: z.string().optional(),
	field: z.string().optional(),
});

/**
 * APIエラー型（共通）
 */
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const ApiErrorResponseSchema = z.object({
	success: z.literal(false),
	error: ApiErrorSchema,
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

/**
 * Zodスキーマから API レスポンススキーマを生成する
 *
 * @param dataSchema - レスポンス本体（data）のZodスキーマ
 * @returns 成功/失敗の2パターンを含むレスポンススキーマ
 *
 * @example
 * const schema = createApiResponseSchema(UserSchema);
 */
export const createApiResponseSchema = <T extends z.ZodTypeAny>(
	dataSchema: T,
) =>
	z.union([
		z.object({
			success: z.literal(true),
			data: dataSchema,
			message: z.string().optional(),
		}),
		ApiErrorResponseSchema,
	]);

/**
 * Zodスキーマから生成された型ベースのレスポンス型
 *
 * @template T - Zodスキーマ型
 */
export type ApiResponse<T extends z.ZodTypeAny> = z.infer<
	ReturnType<typeof createApiResponseSchema<T>>
>;

/**
 * 通常の型Tから生成されるレスポンス型（Zodなし）
 *
 * @template T - 任意の型（例：公式SDKの戻り型など）
 *
 * @example
 * type Res = ApiResponseFromType<{ id: string }>
 */
export type ApiResponseFromType<T> =
	| { success: true; data: T; message?: string }
	| { success: false; error: ApiError };
