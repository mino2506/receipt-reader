import { openai } from "@/lib/openai";
import {
	type OpenAIApiResponse,
	OpenAIChatCompletionResponseSchema,
	OpenAIRequestSchema,
} from "@/lib/openai/schema";
import { getUser } from "@/lib/supabase/auth.server";
import { NextResponse } from "next/server";
import type {
	ChatCompletionNamedToolChoice,
	ChatCompletionToolChoiceOption,
} from "openai/resources/chat/completions";

type ToolChoice =
	| ChatCompletionNamedToolChoice
	| ChatCompletionToolChoiceOption;

export const POST = async (
	req: Request,
): Promise<NextResponse<OpenAIApiResponse>> => {
	console.log("\n\n~~~📨📮   POOOOOOOOOST!!!🚀🚀🚀🆕🆕🆕\n");
	const API_NAME = "OpenAI API";
	console.log(`📊 ${API_NAME} called`);

	console.log("🔐 認証チェックを開始します。");
	const user = await getUser();
	if (user instanceof NextResponse) {
		return user;
	}
	console.log("🔐 認証チェックが成功しました。");

	// 📝 リクエストボディのパー
	console.log(`[${API_NAME}]`, "📝 リクエストボディのパース");
	const json = await req.json();
	console.log(`[${API_NAME}]`, "json: ", JSON.stringify(json).slice(0, 100));

	// リクエストのバリデーション
	console.log(`[${API_NAME}]`, "リクエストのバリデーション");
	const parsed = OpenAIRequestSchema.safeParse(json);
	console.log(`[${API_NAME}]`, "parsed.success: ", parsed.success);
	console.log(
		`[${API_NAME}]`,
		"parsed: ",
		JSON.stringify(parsed).slice(0, 100),
	);
	if (!parsed.success) {
		console.log("❌ エラーの元データ \n", json);
		console.error(
			`[${API_NAME}]`,
			"リクエストが不正です",
			parsed.error.message,
		);
		return NextResponse.json<OpenAIApiResponse>(
			{
				success: false,
				error: {
					code: "invalid_request",
					message: "リクエストが不正です",
					hint: parsed.error.message,
					field: "request",
				},
			},
			{ status: 422 },
		);
	}

	// OpenAI 外部API を呼び出す
	try {
		// リクエストをOpenAI 外部APIに送信
		console.log(`[${API_NAME}]`, "📊 Try openai.chat.completions.create");

		const requestToOpenAI = {
			model: parsed.data.model,
			messages: parsed.data.messages,
			temperature: parsed.data.temperature,
			max_tokens: parsed.data.max_tokens,
			top_p: parsed.data.top_p,
			frequency_penalty: parsed.data.frequency_penalty,
			presence_penalty: parsed.data.presence_penalty,
			...(parsed.data.tools && { tools: parsed.data.tools }),
			...(parsed.data.tool_choice && {
				tool_choice: parsed.data.tool_choice as ToolChoice,
			}),
		};
		console.log(`[${API_NAME}]`, "requestToOpenAI: ", requestToOpenAI);

		const response = await openai.chat.completions.create(requestToOpenAI);

		// トークン使用量のログ
		if (response.usage) {
			const { prompt_tokens, completion_tokens, total_tokens } = response.usage;
			console.log(
				`[${API_NAME}]`,
				`OpenAI token usage:
      - prompt_tokens: ${prompt_tokens}
      - completion_tokens: ${completion_tokens}
      - total_tokens: ${total_tokens}`,
			);
		}

		// OpenAI 外部API レスポンスのバリデーション
		const validated = OpenAIChatCompletionResponseSchema.safeParse(response);
		if (!validated.success) {
			console.log("❌ エラーの元データ \n", response);
			console.error(
				`[${API_NAME}]`,
				"OpenAI 外部API レスポンスのバリデーションエラー",
				validated.error.message,
			);
			return NextResponse.json<OpenAIApiResponse>(
				{
					success: false,
					error: {
						code: "invalid_ai_response",
						message: "AIの返却形式が不正です",
						hint: validated.error.message,
						field: "response",
					},
				},
				{ status: 422 },
			);
		}
		console.log(
			`[${API_NAME}]`,
			"validated.data: ",
			JSON.stringify(validated.data).slice(0, 100),
		);

		// 成功時のレスポンス送信
		console.log(`[${API_NAME}]`, "✅ 成功時のレスポンス送信");
		return NextResponse.json<OpenAIApiResponse>(
			{
				success: true,
				data: validated.data,
				message: "構造化に成功しました",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error calling OpenAI API:", error);
		return NextResponse.json<OpenAIApiResponse>(
			{
				success: false,
				error: {
					code: "openai_request_failed",
					message: "OpenAI API 呼び出しに失敗しました",
					hint: error instanceof Error ? error.message : String(error),
					field: "openai",
				},
			},
			{ status: 500 },
		);
	}
};
