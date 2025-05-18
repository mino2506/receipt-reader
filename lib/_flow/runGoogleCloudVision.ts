import { Effect, pipe } from "effect";
import { type ZodError, z } from "zod";

import { parseUserId } from "@/lib/_domain/user/parseUser";
import { type UnknownError, toUnknownError } from "@/lib/_error/common.error";
import { checkGcvLimit } from "@/lib/_flow/checkGcvLimit";
import { saveGcvUsageLog } from "@/lib/_services/googleCloudVisionUsageLog/saveGcvUsageLog";
import { PrismaServiceLayer } from "@/lib/_services/prismaService";
import { getSupabaseUser } from "@/lib/_services/supabase/getSupabaseUser";
import { SupabaseServiceLayer } from "@/lib/_services/supabase/supabaseService";
import {
	type AnnotateImageResponse,
	GcvService,
	GcvServiceLayer,
} from "@/lib/googleCloudVision/gcvService";

const urlSchema = z.object({
	type: z.literal("url"),
	data: z.string().url(),
});
type Url = z.infer<typeof urlSchema>;
const base64Schema = z.object({
	type: z.literal("base64"),
	data: z.string(),
});
type Base64 = z.infer<typeof base64Schema>;
const inputSchema = z.union([urlSchema, base64Schema]);
type GcvInput = z.infer<typeof inputSchema>;

type GcvInputValidationError = {
	_tag: "InvalidInputError";
	cause: ZodError;
};

type GcvInputError = GcvInputValidationError | UnknownError;

const validateGcvInput = (
	input: unknown,
): Effect.Effect<GcvInput, GcvInputError, never> =>
	Effect.try({
		try: () => inputSchema.parse(input),
		catch: (e) => {
			if (e instanceof z.ZodError) {
				return {
					_tag: "InvalidInputError" as const,
					cause: e,
				};
			}
			return toUnknownError(e);
		},
	});

export enum GCVFeatureType {
	TYPE_UNSPECIFIED = 0,
	FACE_DETECTION = 1,
	LANDMARK_DETECTION = 2,
	LOGO_DETECTION = 3,
	LABEL_DETECTION = 4,
	TEXT_DETECTION = 5,
	DOCUMENT_TEXT_DETECTION = 11,
	SAFE_SEARCH_DETECTION = 6,
	IMAGE_PROPERTIES = 7,
	CROP_HINTS = 9,
	WEB_DETECTION = 10,
	PRODUCT_SEARCH = 12,
	OBJECT_LOCALIZATION = 19,
}

type GcvFeature = {
	type: GCVFeatureType;
};

type GcvUrlRequest = {
	image: {
		source: {
			imageUri: string;
		};
	};
	features: GcvFeature[];
};

type GcvBase64Request = {
	image: {
		content: string;
	};
	features: GcvFeature[];
};

export type GcvRequest = GcvUrlRequest | GcvBase64Request;

const toGcvRequest = (
	input: GcvInput,
): Effect.Effect<GcvRequest, never, never> => {
	const handlers: Record<GcvInput["type"], (data: string) => GcvRequest> = {
		url: (data) => ({
			image: {
				source: {
					imageUri: data,
				},
			},
			features: [
				{
					type: GCVFeatureType.DOCUMENT_TEXT_DETECTION,
				},
			],
		}),
		base64: (data) => ({
			image: {
				content: data,
			},
			features: [
				{
					type: GCVFeatureType.DOCUMENT_TEXT_DETECTION,
				},
			],
		}),
	};

	return Effect.succeed(handlers[input.type](input.data));
};

type CallGcvError = {
	_tag: "GcvExecutionError";
	message: string;
};

const callGcv = (
	request: GcvRequest,
): Effect.Effect<AnnotateImageResponse, CallGcvError, GcvService> =>
	Effect.gen(function* (_) {
		const gcv = yield* _(GcvService);

		const [response] = yield* _(
			Effect.tryPromise({
				try: () => gcv.annotateImage(request),
				catch: (e) => ({
					_tag: "GcvExecutionError" as const,
					message: `GCV API呼び出し失敗: ${String(e)}`,
				}),
			}),
		);

		return response;
	});

/**
 * Google Cloud Vision OCR を呼び出すサーバーアクション
 *
 * @param input - クライアントから渡される未検証データ（以下のADT構造を期待）
 *
 * ```ts
 * // 入力形式の例（必ず "type" を指定する）
 * { type: "url", data: "https://example.com/image.png" }
 * { type: "base64", data: "data:image/png;base64,..." }
 * ```
 *
 * @returns GCV の OCR 結果を含むレスポンス（成功: { success: true, data }, 失敗: { success: false, error }）
 *
 * @remarks
 * - 入力が不正な場合、Zod バリデーションで `InvalidInputError` が返ります
 * - 認証済みユーザーに紐づく API 利用制限チェックも含まれます
 * - 成功／失敗に関わらず GCV 使用ログは保存されます
 *
 * @example
 * const result = await runGoogleCloudVision({ type: "base64", data: base64Str });
 * if (result.success) {
 *   console.log(result.data); // OCR 結果
 * }
 */
export async function runGoogleCloudVision(input: unknown) {
	const flow = pipe(
		getSupabaseUser(),
		Effect.flatMap((user) => parseUserId(user.id)),
		Effect.flatMap((userId) =>
			pipe(
				checkGcvLimit(userId),
				Effect.andThen(
					validateGcvInput(input).pipe(
						Effect.flatMap(toGcvRequest),
						Effect.flatMap(callGcv),
					),
				),
				Effect.tapBoth({
					onSuccess: () => saveGcvUsageLog(userId, true),
					onFailure: () => saveGcvUsageLog(userId, false),
				}),
			),
		),
		Effect.provide(SupabaseServiceLayer),
		Effect.provide(GcvServiceLayer),
		Effect.provide(PrismaServiceLayer),
	).pipe(
		Effect.matchEffect({
			onSuccess: (gcvRes) => {
				const result = { success: true, data: gcvRes };
				Effect.log(result);
				console.log(result);
				return Effect.succeed(result);
			},
			onFailure: (e) => {
				const result = { success: false, error: e };
				Effect.log(result);
				console.log(result);
				return Effect.succeed(result);
			},
		}),
	);

	const result = await Effect.runPromise(flow);

	return result;
}
