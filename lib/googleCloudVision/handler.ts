// lib/googleCloudVision/handler.ts

import {
	type Base64Image,
	type Url,
	isPureBase64ImageBrand,
	isUrl,
} from "@/utils/base64";
import { API_ENDPOINTS, DEFAULT_GCV_FEATURES } from "./constants";
import { isGCVResponse, parseGCVResponse } from "./formatGCVResponse";
import {
	type GCVCustomResult,
	type GCVRequestBody,
	ImageInputSchema,
	ToImageInputSchema,
} from "./schema";

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
): Promise<GCVCustomResult> {
	try {
		const res = await fetch(API_ENDPOINTS.OCR, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ request: input }),
		});

		if (!res.ok) {
			return {
				success: false,
				error: `GCV API returned non-200 status: ${res.status} ${res.statusText}`,
			};
		}

		const json = await res.json();

		if (!isGCVResponse(json)) {
			return {
				success: false,
				error: "GCV response is not in the expected format.",
			};
		}

		return {
			success: true,
			result: parseGCVResponse(json),
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
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
): Promise<GCVCustomResult> {
	try {
		const validated = validateImageInput(input);
		const request = createGCVRequest(validated);
		return await fetchGCVResult(request);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return { success: false, error: message };
	}
}
