// app/api/ocr/route.ts

import { parseUserId } from "@/lib/_domain/user/parseUser";
import { checkGcvLimit } from "@/lib/_flow/checkGcvLimit";
import { saveGcvUsageLog } from "@/lib/_services/googleCloudVisionUsageLog/saveGcvUsageLog";
import { PrismaServiceLayer } from "@/lib/_services/prismaService";
import { getSupabaseUser } from "@/lib/_services/supabase/getSupabaseUser";
import { SupabaseServiceLayer } from "@/lib/_services/supabase/supabaseService";
import type { ApiResponseFromType } from "@/lib/api/common.schema";
import {
	type GCVRequest,
	type GCVRequestBody,
	GCVRequestSchema,
	type GCVSingleResponse,
	GCVSingleResponseSchema,
	googleCloudVisionClient,
} from "@/lib/googleCloudVision";
import {
	GcvService,
	GcvServiceLayer,
} from "@/lib/googleCloudVision/gcvService";
import { getUser } from "@/lib/supabase/auth.server";
import { Effect, pipe } from "effect";
import { NextResponse } from "next/server";

type OcrApiResponse = ApiResponseFromType<GCVSingleResponse>;

export const POST = async (req: Request) => {
	console.log("\n\n~~~📨📮   POOOOOOOOOST!!!🚀🚀🚀🆕🆕🆕\n");
	console.log("📨 GCV OCR API called");

	console.log("req:", JSON.stringify(req));

	// // 🔐 認証チェック
	// console.log("🔐 認証チェックを開始します。");
	// const user = await getUser();
	// if (user instanceof NextResponse) {
	// 	return user;
	// }
	// console.log("🔐 認証チェックが成功しました。");

	// try {
	// 	await Effect.runPromise(
	// 		pipe(
	// 			parseUserId(user.id),
	// 			Effect.flatMap((userId) => checkGcvLimit(userId)),
	// 			Effect.provide(PrismaServiceLayer),
	// 			Effect.matchEffect({
	// 				onSuccess: () => Effect.log("🎉 利用回数チェック成功"),
	// 				onFailure: (e) => Effect.logError("❌ 利用回数チェック失敗:", e),
	// 			}),
	// 		),
	// 	);
	// } catch (e) {
	// 	return NextResponse.json<OcrApiResponse>(
	// 		{
	// 			success: false,
	// 			error: {
	// 				code: "limit_gcv",
	// 				message: "利用回数上限を超えました",
	// 				field: "gcv",
	// 			},
	// 		},
	// 		{ status: 422 },
	// 	);
	// }

	// const reqBody = await req.json();
	// const requestToGCV = reqBody.request;
	// console.log("requestToGCV:", requestToGCV);
	// console.log("parseRequestBody:", parseRequestBody(requestToGCV));

	console.log("Try OCR by Google Cloud Vision");

	try {
		const result = await Effect.runPromise(
			pipe(
				getSupabaseUser(),
				Effect.tap((user) =>
					Effect.log(
						"🔐 認証チェック成功:",
						`${JSON.stringify(user, null, 2)}`,
					),
				),
				Effect.flatMap((user) =>
					pipe(
						parseUserId(user.id),
						Effect.tap(() => Effect.log("✅ UserIdバリデーション成功")),
						Effect.flatMap((userId) =>
							pipe(
								checkGcvLimit(userId),
								Effect.tap(() => Effect.log("✅ 利用制限チェック成功")),
								Effect.andThen(() =>
									pipe(
										parseRequestJson(req),
										Effect.tap(() => Effect.log("✅ JSONパース成功")),
										Effect.flatMap(parseRequestBody),
										Effect.tap(() => Effect.log("✅ Bodyバリデーション成功")),
										Effect.flatMap((parsed) => callGcv(parsed.request)),
										Effect.tap(() => Effect.log("✅ GCV呼び出し成功")),
										Effect.tapBoth({
											onSuccess: () => saveGcvUsageLog(userId, true),
											onFailure: () => saveGcvUsageLog(userId, false),
										}),
										Effect.tap(() => Effect.log("✅ GCVログ保存成功")),
										Effect.flatMap((gcvRes) => parseGcvResponse(gcvRes)),
										Effect.tap((parsedGcvRes) =>
											Effect.log(
												"✅ GCVレスポンスバリデーション成功:",
												`${JSON.stringify(parsedGcvRes, null, 2)}`,
											),
										),
									),
								),
							),
						),
					),
				),
				Effect.provide(SupabaseServiceLayer),
				Effect.provide(GcvServiceLayer),
				Effect.provide(PrismaServiceLayer),
			),
		);
		return NextResponse.json<OcrApiResponse>(
			{
				success: true,
				data: result,
				message: "OCR に成功しました",
			},
			{ status: 200 },
		);
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e);
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

	// try {
	// 	console.log("Starting OCR by Google Cloud Vision");

	// 	const [rawResponse] =
	// 		await googleCloudVisionClient.annotateImage(requestToGCV);

	// 	// ✅ GCVレスポンスの構造チェック（Zodでvalidate）
	// 	const parsed = GCVSingleResponseSchema.safeParse(rawResponse);
	// 	if (!parsed.success) {
	// 		console.warn("GCV レスポンスの構造が不正:", parsed.error.flatten());

	// 		return NextResponse.json<OcrApiResponse>(
	// 			{
	// 				success: false,
	// 				error: {
	// 					code: "invalid_gcv_response",
	// 					message: "GCV のレスポンス形式が不正です",
	// 					hint: parsed.error.message,
	// 					field: "gcv",
	// 				},
	// 			},
	// 			{ status: 422 },
	// 		);
	// 	}

	// 	console.log("rawText: \n", parsed.data.fullTextAnnotation?.text);

	// 	await Effect.runPromise(
	// 		pipe(
	// 			parseUserId(user.id),
	// 			Effect.flatMap((userId) => saveGcvUsageLog(userId, true)),
	// 			Effect.provide(PrismaServiceLayer),
	// 			Effect.matchEffect({
	// 				onSuccess: () => Effect.log("🎉 利用回数ログ成功"),
	// 				onFailure: (e) => Effect.logError("❌ 利用回数ログ失敗:", e),
	// 			}),
	// 		),
	// 	);

	// 	// ✅ 正常レスポンス
	// 	return NextResponse.json<OcrApiResponse>(
	// 		{
	// 			success: true,
	// 			data: parsed.data,
	// 			message: "OCR に成功しました",
	// 		},
	// 		{ status: 200 },
	// 	);
	// } catch (error) {
	// 	const message = error instanceof Error ? error.message : String(error);

	// 	return NextResponse.json<OcrApiResponse>(
	// 		{
	// 			success: false,
	// 			error: {
	// 				code: "gcv_execution_failed",
	// 				message: "Google Cloud Vision API の呼び出しに失敗しました",
	// 				hint: message,
	// 				field: "gcv",
	// 			},
	// 		},
	// 		{ status: 500 },
	// 	);
	// }
};

type ParseGcvRequestJson = {
	_tag: "InvalidRequestError";
	message: string;
};

const parseRequestJson = (
	req: Request,
): Effect.Effect<unknown, ParseGcvRequestJson, never> =>
	Effect.tryPromise({
		try: () => req.json(),
		catch: (e) => ({
			_tag: "InvalidRequestError" as const,
			message: `リクエストボディの解析に失敗しました: ${String(e)}`,
		}),
	});

type ParseRequestBodyError = {
	_tag: "InvalidRequestError";
	message: string;
};

const parseRequestBody = (
	json: unknown,
): Effect.Effect<GCVRequest, ParseRequestBodyError, never> =>
	Effect.try({
		try: () => GCVRequestSchema.parse(json),
		catch: (e) => ({
			_tag: "InvalidRequestError" as const,
			message: `リクエストボディの構造が不正です: ${String(e)}`,
		}),
	});

type CallGcvError = {
	_tag: "GcvExecutionError";
	message: string;
};

const callGcv = (
	request: GCVRequestBody,
): Effect.Effect<unknown, CallGcvError, GcvService> =>
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

type ParseGcvResponse = {
	_tag: "InvalidResponseError";
	message: string;
};

const parseGcvResponse = (
	response: unknown,
): Effect.Effect<GCVSingleResponse, ParseGcvResponse, never> =>
	Effect.try({
		try: () => GCVSingleResponseSchema.parse(response),
		catch: (e) => ({
			_tag: "InvalidResponseError" as const,
			message: `GCVレスポンスの構造が不正です: ${String(e)}`,
		}),
	});

const matchStatusFromTag = (tag: string): number => {
	switch (tag) {
		case "AuthNoUserFound":
		case "AuthGetUserError":
			return 401;
		case "InvalidRequestError":
			return 400;
		case "GcvExecutionError":
			return 502;
		case "InvalidResponseError":
			return 422;
		case "limit_gcv":
			return 429;
		default:
			return 500;
	}
};
