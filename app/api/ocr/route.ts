// app/api/ocr/route.ts

import {
	type ApiError,
	ApiErrorSchema,
	type ApiResponseFromType,
	createApiResponseSchema,
} from "@/lib/api/common.schema";
import {
	GCVFeatureSchema,
	GCVFeatureType,
	GCVRequestSchema,
	type GCVSingleResponse,
	GCVSingleResponseSchema,
	googleCloudVisionClient,
} from "@/lib/googleCloudVision";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isBase64, toPureBase64 } from "@/utils/base64";
import type { protos } from "@google-cloud/vision";
import { NextResponse } from "next/server";

const reqMock = {
	body: {
		image:
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFBAJ/wlseKgAAAABJRU5ErkJggg==",
		features: [
			{
				type: "DOCUMENT_TEXT_DETECTION",
			},
			{
				type: "LABEL_DETECTION",
			},
		],
	},
};

type OcrApiResponse = ApiResponseFromType<GCVSingleResponse>;

export const POST = async (req: Request, res: NextResponse) => {
	console.log("\n\n~~~📨📮   POOOOOOOOOST!!!🚀🚀🚀🆕🆕🆕\n");
	console.log("📨 GCV OCR API called");

	// 🔐 認証チェック
	const supabase = await createServerClient();
	if (process.env.NODE_ENV === "development") {
		console.log("🔐 開発環境です。認証をスキップしました。");
	} else {
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (error) {
			return NextResponse.json<OcrApiResponse>(
				{
					success: false,
					error: {
						code: "auth_user_fetch_failed",
						message: "認証ユーザー情報の取得に失敗しました",
						field: "auth",
					},
				},
				{ status: 500 },
			);
		}
		return NextResponse.json<OcrApiResponse>(
			{
				success: false,
				error: {
					code: "unauthorized",
					message: "ユーザーが認証されていません",
					field: "auth",
				},
			},
			{ status: 401 },
		);
	}

	const reqBody = await req.json();
	const requestToGCV = reqBody.request;

	console.log("Try OCR by Google Cloud Vision");
	try {
		console.log("Starting OCR by Google Cloud Vision");

		const [rawResponse] =
			await googleCloudVisionClient.annotateImage(requestToGCV);

		// ✅ GCVレスポンスの構造チェック（Zodでvalidate）
		const parsed = GCVSingleResponseSchema.safeParse(rawResponse);
		if (!parsed.success) {
			console.warn("GCV レスポンスの構造が不正:", parsed.error.flatten());

			return NextResponse.json<OcrApiResponse>(
				{
					success: false,
					error: {
						code: "invalid_gcv_response",
						message: "GCV のレスポンス形式が不正です",
						hint: parsed.error.message,
						field: "gcv",
					},
				},
				{ status: 422 },
			);
		}

		console.log("rawText: \n", parsed.data.fullTextAnnotation?.text);

		// ✅ 正常レスポンス
		return NextResponse.json<OcrApiResponse>(
			{
				success: true,
				data: parsed.data,
				message: "OCR に成功しました",
			},
			{ status: 200 },
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);

		return NextResponse.json<OcrApiResponse>(
			{
				success: false,
				error: {
					code: "gcv_execution_failed",
					message: "Google Cloud Vision API の呼び出しに失敗しました",
					hint: message,
					field: "gcv",
				},
			},
			{ status: 500 },
		);
	}
};
