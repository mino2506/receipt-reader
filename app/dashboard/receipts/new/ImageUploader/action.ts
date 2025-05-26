// app/components/imageUploader/action.ts

"use server";

import { cookies } from "next/headers";

import {
	createGCVRequest,
	fetchGCVResult,
	validateImageInput,
} from "@/lib/googleCloudVision";

import {
	messagePrefixPrompt,
	receiptFunctionCallingSchema,
	rolePrompt,
} from "@/app/dashboard/receipts/new/ImageUploader/receiptPrompt";
import {
	type OpenAiReceiptData,
	OpenAiReceiptDataSchema,
} from "@/app/dashboard/receipts/new/ImageUploader/schema";
import { metadata } from "@/app/layout";
import { runGoogleCloudVision } from "@/lib/_flow/runGoogleCloudVision";
import { analyzeRawItemDetail } from "@/lib/_services/openai/analyzeRawItemDetail";
import { extractMetaData } from "@/lib/_services/openai/extractMetaData";
import { extractRawItems } from "@/lib/_services/openai/extractRawItems";
import { OpenAiServiceLayer } from "@/lib/_services/openai/openaiService";
import type { ApiResponseFromType } from "@/lib/api/common.schema";
import {
	OpenAIApiResponseSchema,
	OpenAIRequestSchema,
} from "@/lib/openai/schema";
import { formatZodError } from "@/lib/zod/error";
import { Effect, pipe } from "effect";

export async function runGcv(input: unknown) {
	return await runGoogleCloudVision(input);
}

export async function runAIParse(lines: string[]) {
	const flow = pipe(
		Effect.all(
			[
				extractMetaData(lines),
				pipe(
					extractRawItems(lines),
					Effect.flatMap((data) =>
						Effect.all(data.rawItems.map(analyzeRawItemDetail), {
							concurrency: "unbounded",
						}),
					),
				),
			],
			{
				concurrency: "unbounded",
			},
		).pipe(
			Effect.flatMap((data) => {
				const [meta, items] = data;
				return Effect.succeed({
					...meta,
					items: items.map((data) => {
						const { price, ...rest } = data.item;
						return {
							...rest,
							unitPrice: price / rest.amount,
							subtotalPrice: price,
						};
					}),
				});
			}),
		),
		Effect.provide(OpenAiServiceLayer),
	).pipe(
		Effect.matchEffect({
			onSuccess: (data) => {
				const result = { success: true, data };
				Effect.log(result);
				console.log(result);
				return Effect.succeed(result);
			},
			onFailure: (error) => {
				const result = { success: false, error };
				Effect.log(result);
				console.log(result);
				return Effect.succeed(result);
			},
		}),
	);

	const result = await Effect.runPromise(flow);

	return result;
}

/**
 * クライアントから直接使えるGCVラッパー（画像検証＋OCR呼び出し）
 *
 * @param input - Base64またはURL文字列
 * @returns GCV処理結果（success + data または error）
 */
export async function tryParseAndFetchGCVFromClient(input: unknown) {
	const cookie = await cookies();
	const cookieHeader = cookie
		.getAll()
		.map((c) => `${c.name}=${c.value}`)
		.join("; ");
	// console.log("🍪", cookieHeader);

	// console.log("🌟input:", JSON.stringify(input, null, 2));
	const validated = validateImageInput(input);
	// console.log("🌟validated:", JSON.stringify(validated, null, 2));
	const request = createGCVRequest(validated);
	// console.log("🌟request:", JSON.stringify(request, null, 2));
	return await fetchGCVResult(request, cookieHeader);
}

export async function parseReceiptToJsonWithAi(
	input: string,
): Promise<ApiResponseFromType<OpenAiReceiptData>> {
	const ACTION_NAME = "parseReceiptToJsonWithAi";
	console.log(`📊RUNNING ServerAction - ${parseReceiptToJsonWithAi}`);
	console.log(`[${ACTION_NAME}]`, "input: \n", input.slice(0, 300));

	const cookie = await cookies();
	const cookieHeader = cookie
		.getAll()
		.map((c) => `${c.name}=${c.value}`)
		.join("; ");
	// console.log("🍪", cookieHeader);

	// Promptを作成
	const actionPrompt: string = `
  ${messagePrefixPrompt}
  ${input}
  `;
	console.log(
		`[${ACTION_NAME}]`,
		"actionPrompt: \n",
		actionPrompt.slice(0, 300),
	);

	// OpenAI用のリクエストをバリデーション付きで作成
	console.log(
		`[${ACTION_NAME}]`,
		"OpenAI用のリクエストをバリデーション付きで作成",
	);

	// リクエストを作成
	const request = {
		model: "gpt-4-0613",
		messages: [
			{
				role: "system",
				content: rolePrompt,
			},
			{
				role: "user",
				content: actionPrompt,
			},
		],
		temperature: 0.2,
		max_tokens: 5000,
		top_p: 1,
		frequency_penalty: 0,
		presence_penalty: 0,
		tools: [receiptFunctionCallingSchema],
		tool_choice: {
			type: "function",
			function: { name: "parse_receipt_data" },
		},
	};

	const validatedRequest = OpenAIRequestSchema.safeParse(request);

	// 作成したリクエストのバリデーション結果を確認
	console.log(
		`[${ACTION_NAME}]`,
		"作成したリクエストのバリデーション結果を確認",
	);
	if (!validatedRequest.success) {
		console.table(formatZodError(validatedRequest.error));
		console.error("request: \n", validatedRequest);
		return {
			success: false,
			error: {
				code: "invalid_request",
				message: "リクエストが不正です",
				hint: validatedRequest.error.message,
				field: "request",
			},
		};
	}

	// OpenAI 用の 内部API を呼び出す
	console.log(`[${ACTION_NAME}]`, "Try fetch **INNER ENDPOINT** for ai api");
	try {
		// リクエストをOpenAI API 用のエンドポイントに送信
		const API_ENDPOINTS = {
			OPEN_AI: "/api/openai",
		};
		const url = `${process.env.NEXT_PUBLIC_SITE_ORIGIN}${API_ENDPOINTS.OPEN_AI}`;
		console.log(`[${ACTION_NAME}]`, "url: ", url);
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Cookie: cookieHeader,
			},
			body: JSON.stringify(validatedRequest.data),
			credentials: "include",
		});

		// レスポンスの成功判定
		console.log(`[${ACTION_NAME}]`, "レスポンスの成功判定");
		if (!response.ok) {
			console.error(`フェッチエラー "${url}" \n`, response.status);
			return {
				success: false,
				error: {
					code: "openai_request_failed",
					message: "OpenAI API 呼び出しに失敗しました",
					hint: JSON.stringify(response.status),
					field: "request",
				},
			};
		}

		// レスポンスをボディを取り出す
		console.log(`[${ACTION_NAME}]`, "レスポンスのボディを取り出す");
		const body = await response.json();

		// レスポンスのボディが正しく構造化されているかをバリデーション
		console.log(
			`[${ACTION_NAME}]`,
			"レスポンスのボディが正しく構造化されているかをバリデーション",
		);
		const validated = OpenAIApiResponseSchema.safeParse(body);
		// 構造化の成功判定
		console.log(`[${ACTION_NAME}]`, "構造化の成功判定");
		if (!validated.success) {
			console.log("❌ エラーの元データ \n", body);
			console.error("AIの返却形式が不正です \n", validated.error.message);

			return {
				success: false,
				error: {
					code: "invalid_ai_response",
					message: "AIの返却形式が不正です",
					hint: validated.error.message,
					field: "content",
				},
			};
		}
		// そもそものレスポンスが成功判定
		console.log(`[${ACTION_NAME}]`, "そもそものレスポンスの成功判定");
		if (!validated.data.success) {
			console.error("❌ AIリクエストに失敗しました \n", validated.error);
			return {
				success: false,
				error: {
					code: "ai_requeat_failed",
					message: "AIリクエストに失敗しました",
					hint: JSON.stringify(validated.error),
					field: "request",
				},
			};
		}
		console.log(
			`[${ACTION_NAME}]`,
			"validated.data: ",
			JSON.stringify(validated.data).slice(0, 300),
		);

		// AIのレスポンスから一つ目のメッセージの内容を取得します
		console.log(
			`[${ACTION_NAME}]`,
			"AIのレスポンスから一つ目のメッセージの内容を取得します",
		);

		const choices = validated.data.data.choices;
		if (!choices || !choices || choices.length === 0) {
			console.log("❌ エラーの元データ \n", choices);
			console.error("GPTの応答に choices が含まれていません \n");
			return {
				success: false,
				error: {
					code: "missing_choices",
					message: "GPTの応答に choices が含まれていません",
					field: "choices",
				},
			};
		}
		console.log(
			`[${ACTION_NAME}]`,
			"choices: ",
			JSON.stringify(choices).slice(0, 300),
		);

		const message = choices[0].message;
		if (!message.tool_calls || message.tool_calls.length === 0) {
			console.log("❌ エラーの元データ \n", message);
			console.error("choices の message が見つかりません \n");
			return {
				success: false,
				error: {
					code: "missing_message",
					message: "choices の message が見つかりません",
					field: "message",
				},
			};
		}
		console.log(
			`[${ACTION_NAME}]`,
			"message: ",
			JSON.stringify(message).slice(0, 300),
		);

		const firstTool = message.tool_calls[0];
		if (!firstTool) {
			console.log("❌ エラーの元データ \n", firstTool);
			console.error("tool_calls が見つかりません");
			return {
				success: false,
				error: {
					code: "missing_tool_calls",
					message: "tool_calls が見つかりません",
					field: "tool_calls",
				},
			};
		}
		console.log(
			`[${ACTION_NAME}]`,
			"firstTool: ",
			JSON.stringify(firstTool).slice(0, 300),
		);

		const rawArguments = firstTool.function.arguments;
		if (!rawArguments) {
			console.log("❌ エラーの元データ \n", rawArguments);
			console.error("arguments is empty");
			return {
				success: false,
				error: {
					code: "empty_arguments",
					message: "arguments が空です",
					hint: "arguments is empty",
					field: "arguments",
				},
			};
		}
		console.log(
			`[${ACTION_NAME}]`,
			"rawArguments: ",
			rawArguments.slice(0, 300),
		);

		// AIのレスポンスのプレーンテキストを JSON パース
		console.log(
			`[${ACTION_NAME}]`,
			"AIのレスポンスのプレーンテキストを JSON パースします",
		);
		// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
		let receiptJson;
		try {
			receiptJson = JSON.parse(rawArguments);
		} catch (e) {
			console.error(e);
			return {
				success: false,
				error: {
					code: "non_json_ai_response",
					message: "AIの返却がJSON形式がではありません",
					hint: "receiptText is invalid",
					field: "content",
				},
			};
		} finally {
			console.log(`[${ACTION_NAME}]`, "receiptJson: ", receiptJson);
		}
		const receiptData = OpenAiReceiptDataSchema.safeParse(receiptJson);
		if (!receiptData.success) {
			return {
				success: false,
				error: {
					code: "invalid_ai_response",
					message: "AIの返却形式が不正です",
					hint: receiptData.error.message,
					field: "content",
				},
			};
		}

		// 成功時のレスポンス送信
		console.log(`[${ACTION_NAME}]`, "✅ 成功時のレスポンス送信");
		return {
			success: true,
			data: receiptData.data,
		};
	} catch (error) {
		console.error(error);
		return {
			success: false,
			error: {
				code: "openai_request_failed",
				message: "OpenAI API 呼び出しに失敗しました",
				hint: error instanceof Error ? error.message : String(error),
				field: "openai",
			},
		};
	}
}
