// app/api/ocr/route.ts

import { parseUserId } from "@/lib/_domain/user/parseUser";
import { checkGcvLimit } from "@/lib/_flow/checkGcvLimit";
import {
	type GCVRequest,
	type GCVRequestBody,
	GCVRequestSchema,
} from "@/lib/_model/googleCloudVision/request.schema";
import { saveGcvUsageLog } from "@/lib/_services/googleCloudVisionUsageLog/saveGcvUsageLog";
import { PrismaServiceLayer } from "@/lib/_services/prismaService";
import { getSupabaseUser } from "@/lib/_services/supabase/getSupabaseUser";
import { SupabaseServiceLayer } from "@/lib/_services/supabase/supabaseService";
import type { ApiResponseFromType } from "@/lib/api/common.schema";
import {
	type GCVSingleResponse,
	GCVSingleResponseSchema,
} from "@/lib/googleCloudVision";
import { Effect, pipe } from "effect";
import { NextResponse } from "next/server";

type OcrApiResponse = ApiResponseFromType<GCVSingleResponse>;

export const POST = async (req: Request) => {
	return await pipe(
		pipe(
			getSupabaseUser(),
			Effect.flatMap((user) =>
				pipe(
					parseUserId(user.id),
					Effect.flatMap((userId) =>
						pipe(
							checkGcvLimit(userId),
							Effect.andThen(() =>
								pipe(
									parseRequestJson(req),
									// Effect.flatMap(validateRequestBody),
									Effect.flatMap((req) => {
										const parsed = GCVRequestSchema.parse(req); // TODO: USE pipe
										return callGcv(parsed.request as GCVRequestBody);
									}),
									Effect.tapBoth({
										onSuccess: () => saveGcvUsageLog(userId, true),
										onFailure: () => saveGcvUsageLog(userId, false),
									}),
									Effect.flatMap(validateGcvResponse),
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
		Effect.matchEffect({
			onSuccess: (parsedGcvRes) =>
				Effect.succeed(
					NextResponse.json<OcrApiResponse>(
						{
							success: true,
							data: parsedGcvRes,
							message: "OCR に成功しました",
						},
						{ status: 200 },
					),
				),

			onFailure: (e) => {
				console.error(e);

				const message = "message" in e ? e.message : "不明なエラー";
				const status = matchStatusFromTag(e._tag);

				return Effect.succeed(
					NextResponse.json<OcrApiResponse>(
						{
							success: false,
							error: {
								code: e._tag ?? "unexpected_error",
								message,
								field: "gcv",
							},
						},
						{ status },
					),
				);
			},
		}),
		Effect.runPromise,
	);
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

type ValidateRequestBodyError = {
	_tag: "InvalidRequestError";
	message: string;
};

const validateRequestBody = (
	json: unknown,
): Effect.Effect<GCVRequest, ValidateRequestBodyError, never> =>
	Effect.try({
		try: () => GCVRequestSchema.parse(json),
		catch: (e) => ({
			_tag: "InvalidRequestError" as const,
			message: `リクエストボディの構造が不正です: ${String(e)}`,
		}),
	});

import { googleCloudVisionClient } from "@/lib/googleCloudVision/client";
import type { protos } from "@google-cloud/vision";
import { Context, Layer } from "effect";

type GcvInfraError = {
	_tag: "GcvInitError";
	cause: unknown;
};

type AnnotateImageResponse =
	protos.google.cloud.vision.v1.IAnnotateImageResponse;

class GcvService extends Context.Tag("GcvService")<
	GcvService,
	{
		clientName: string;
		annotateImage: (req: GCVRequestBody) => Promise<[AnnotateImageResponse]>;
	}
>() {}

const toGcvInfraError = (e: unknown): GcvInfraError =>
	({ _tag: "GcvInitError", cause: e }) satisfies GcvInfraError;

const makeGcvService = Effect.try({
	try: () => ({
		clientName: "default",
		annotateImage: (req: GCVRequestBody) =>
			googleCloudVisionClient.annotateImage(req),
	}),
	catch: toGcvInfraError,
});

const GcvServiceLayer = Layer.effect(GcvService, makeGcvService);

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

type ValidateGcvResponse = {
	_tag: "InvalidResponseError";
	message: string;
};

const validateGcvResponse = (
	response: unknown,
): Effect.Effect<GCVSingleResponse, ValidateGcvResponse, never> =>
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
