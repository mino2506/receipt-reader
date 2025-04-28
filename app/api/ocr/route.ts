// app/api/ocr/route.ts

import type { ApiResponseFromType } from "@/lib/api/common.schema";
import {
	type GCVSingleResponse,
	GCVSingleResponseSchema,
	googleCloudVisionClient,
} from "@/lib/googleCloudVision";
import { getUser } from "@/lib/supabase/auth.server";
import { NextResponse } from "next/server";

// const reqMock = {
// 	body: {
// 		image:
// 			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFBAJ/wlseKgAAAABJRU5ErkJggg==",
// 		features: [
// 			{
// 				type: "DOCUMENT_TEXT_DETECTION",
// 			},
// 			{
// 				type: "LABEL_DETECTION",
// 			},
// 		],
// 	},
// };

type OcrApiResponse = ApiResponseFromType<GCVSingleResponse>;

export const POST = async (req: Request) => {
	console.log("\n\n~~~📨📮   POOOOOOOOOST!!!🚀🚀🚀🆕🆕🆕\n");
	console.log("📨 GCV OCR API called");

	console.log("req:", JSON.stringify(req));

	// 🔐 認証チェック
	console.log("🔐 認証チェックを開始します。");
	const user = await getUser();
	if (user instanceof NextResponse) {
		return user;
	}
	console.log("🔐 認証チェックが成功しました。");
	// if (process.env.NODE_ENV === "development") {
	// 	console.log("🔐 開発環境です。認証をスキップしました。");
	// } else {
	// 	const {
	// 		data: { user },
	// 		error,
	// 	} = await supabase.auth.getUser();

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
