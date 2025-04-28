// app/api/ocr/route.ts

import type { ApiResponseFromType } from "@/lib/api/common.schema";
import {
	type GCVSingleResponse,
	GCVSingleResponseSchema,
	googleCloudVisionClient,
} from "@/lib/googleCloudVision";
import { createApiClient } from "@/lib/supabase/api";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

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

export const POST = async (req: NextRequest) => {
	console.log("\n\n~~~📨📮   POOOOOOOOOST!!!🚀🚀🚀🆕🆕🆕\n");
	console.log("📨 GCV OCR API called");

	// 🔐 認証チェック
	console.log("🔐 認証チェックを開始します。");
	const supabase = await createServerClient();
	console.log("Supabase client created");
	const res = new NextResponse();
	const supabaseApi = createApiClient(req, res);
	console.log("Supabase  APIclient created");
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	const { data: User2, error: Error2 } = await supabaseApi.auth.getUser();

	console.log("User2:", JSON.stringify(User2));
	console.log("Error2:", JSON.stringify(Error2));
	if (!user) {
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
	// if (process.env.NODE_ENV === "development") {
	// 	console.log("🔐 開発環境です。認証をスキップしました。");
	// } else {
	// 	const {
	// 		data: { user },
	// 		error,
	// 	} = await supabase.auth.getUser();

	// 	if (error) {
	// 		return NextResponse.json<OcrApiResponse>(
	// 			{
	// 				success: false,
	// 				error: {
	// 					code: "auth_user_fetch_failed",
	// 					message: "認証ユーザー情報の取得に失敗しました",
	// 					field: "auth",
	// 				},
	// 			},
	// 			{ status: 500 },
	// 		);
	// 	}
	// 	return NextResponse.json<OcrApiResponse>(
	// 		{
	// 			success: false,
	// 			error: {
	// 				code: "unauthorized",
	// 				message: "ユーザーが認証されていません",
	// 				field: "auth",
	// 			},
	// 		},
	// 		{ status: 401 },
	// 	);
	// }

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
