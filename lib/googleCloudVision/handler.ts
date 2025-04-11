// lib/googleCloudVision/handler.ts

import type { ApiResponseFromType } from "@/lib/api/common.schema";
import {
	type Base64Image,
	type Url,
	isPureBase64ImageBrand,
	isUrl,
} from "@/utils/base64";
import { API_ENDPOINTS, DEFAULT_GCV_FEATURES } from "./constants";
import {
	type GCVRequestBody,
	ImageInputSchema,
	ToImageInputSchema,
} from "./schema";
import { type GCVSingleResponse, GCVSingleResponseSchema } from "./schema";
import type { GCVCustomResult } from "./types.server";

export function validateImageInput(input: unknown): Base64Image | Url {
	const parsed = ImageInputSchema.safeParse(input);
	if (!parsed.success) {
		const errorMessage = parsed.error.errors[0]?.message ?? "Invalid input";
		throw new Error(errorMessage);
	}
	return parsed.data;
}

export function createGCVRequest(input: Base64Image | Url): GCVRequestBody {
	const parsed = ToImageInputSchema.safeParse(input);
	if (!parsed.success) {
		const errorMessage = parsed.error.errors[0]?.message ?? "Invalid input";
		throw new Error(errorMessage);
	}

	const data = parsed.data;

	if (isUrl(data)) {
		return {
			image: {
				source: {
					imageUri: data as Url,
				},
			},
			features: DEFAULT_GCV_FEATURES,
		};
	}

	if (isPureBase64ImageBrand(data)) {
		return {
			image: {
				content: data,
			},
			features: DEFAULT_GCV_FEATURES,
		};
	}

	throw new Error(
		"Unexpected: input passed validation but did not match any known type (Url or PureBase64Image)",
	);
}

export async function fetchGCVResult(
	input: GCVRequestBody,
): Promise<ApiResponseFromType<GCVSingleResponse>> {
	const url = `${process.env.NEXT_PUBLIC_SITE_ORIGIN}${API_ENDPOINTS.OCR}`;
	console.log("fetchGCVResult from", url);
	try {
		const res = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ request: input }),
		});

		if (!res.ok) {
			return {
				success: false,
				error: {
					code: "gcv_response_failed",
					message: `GCV API returned non-200 status: ${res.status} ${res.statusText}`,
				},
			};
		}

		const json = await res.json();

		// ✅ 成功か確認
		if (!json.success || !json.data) {
			return {
				success: false,
				error: {
					code: "gcv_api_failure",
					message: "GCV API が失敗レスポンスを返しました",
					hint: json.error?.message ?? "Unknown error",
				},
			};
		}

		// ✅ GCVレスポンスの構造チェック（Zodでvalidate）
		const parsed = GCVSingleResponseSchema.safeParse(json.data);
		if (!parsed.success) {
			return {
				success: false,
				error: {
					code: "invalid_gcv_response",
					message: "GCV response is not in the expected format",
					hint: parsed.error.message,
				},
			};
		}
		// ✅ fullTextAnnotation の存在確認
		if (!parsed.data.fullTextAnnotation) {
			return {
				success: false,
				error: {
					code: "empty_gcv_result",
					message: "fullTextAnnotation が GCV レスポンスに存在しません",
					field: "fullTextAnnotation",
				},
			};
		}

		return {
			success: true,
			data: parsed.data,
		};
	} catch (error) {
		return {
			success: false,
			error: {
				code: "gcv_fetch_error",
				message: "GCV API 呼び出し中にエラーが発生しました",
				hint: error instanceof Error ? error.message : String(error),
			},
		};
	}
}

/**
 * 入力値を検証・変換し、GCV APIに送信して構造化結果を取得する
 *
 * @param input - base64文字列またはURL（unknown型で受け取る）
 * @returns 成功時は GCVResponse、失敗時はエラーメッセージ
 */
export async function tryParseAndFetchGCV(
	input: unknown,
): Promise<ApiResponseFromType<GCVSingleResponse>> {
	try {
		const validated = validateImageInput(input);
		const request = createGCVRequest(validated);
		return await fetchGCVResult(request);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return {
			success: false,
			error: {
				code: "invalid_input",
				message: "入力された画像の検証に失敗しました",
				hint: error instanceof Error ? error.message : String(error),
			},
		};
	}
}
