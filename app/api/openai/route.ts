import {
	messagePrefixPrompt,
	messageSuffixPromptEN,
	rolePrompt,
} from "@/app/api/openai/receiptPrompt";
import {
	type ApiResponseFromType,
	createApiResponseSchema,
} from "@/lib/api/common.schema";
import { openai } from "@/lib/openai";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const OpenAIRequestSchema = z.object({
	text: z.string().min(1, "text must not be empty"),
});
export type OpenAIRequest = z.infer<typeof OpenAIRequestSchema>;

// 出力の仮定スキーマ（拡張前提）
export const OpenAiStructuringResponseSchema = z.object({
	store: z.string(),
	date: z
		.string()
		.datetime() // ISO 8601 UTC形式: YYYY-MM-DDTHH:mm:ssZ
		.transform((val) => new Date(val)), // UTCとしてDateに変換
	items: z
		.array(
			z.object({
				name: z.string(),
				quantity: z.number().nullable(),
				price: z.number().nullable(),
				subtotal: z.number().nullable(),
				discount: z.number().nullable(),
				category: z.string(),
				taxRate: z.number(),
				taxRateSource: z.enum(["explicit", "inferred"]),
			}),
		)
		.min(1, "1件以上の商品が必要です"),
	total: z.number(),
	discount: z.number().nullable(),
	tax: z
		.record(z.string().regex(/^\d+$/), z.number()) // 税率をキーとした税額。例: {"8": 10}
		.nullable(),
	payment: z.string(),
});
export type OpenAiStructuringResponse = z.infer<
	typeof OpenAiStructuringResponseSchema
>;
export type OpenAiApiResponse = ApiResponseFromType<OpenAiStructuringResponse>;

export const POST = async (
	req: Request,
	res: NextResponse,
): Promise<NextResponse<OpenAiApiResponse>> => {
	console.log("\n\n~~~📨📮   POOOOOOOOOST!!!🚀🚀🚀🆕🆕🆕\n");
	console.log("📊 OpenAI API called");

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
			return NextResponse.json<OpenAiApiResponse>(
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
		if (!user) {
			return NextResponse.json<OpenAiApiResponse>(
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
	}

	const json = await req.json();
	console.log("data: ", json);

	const parsed = OpenAIRequestSchema.safeParse(json);
	if (!parsed.success) {
		return NextResponse.json<OpenAiApiResponse>(
			{
				success: false,
				error: {
					code: "invalid_request",
					message: "テキストが未指定または不正です",
					hint: parsed.error.message,
					field: "text",
				},
			},
			{ status: 400 },
		);
	}

	const inputOcrText = parsed.data.text;

	console.log("inputOcrText: \n", inputOcrText);

	const actionPrompt: string = `
  ${messagePrefixPrompt}
  ${inputOcrText}
  ${messageSuffixPromptEN}
  `;
	console.log("actionPrompt: \n", actionPrompt);

	try {
		console.log("try openai.chat.completions.create");
		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini",
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
			temperature: 0.1, // 低い値で決定的な応答に
			max_tokens: 1500,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,
		});

		// トークン使用量のログ
		if (response.usage) {
			const { prompt_tokens, completion_tokens, total_tokens } = response.usage;
			console.log(`📊 OpenAI token usage:
      - prompt_tokens: ${prompt_tokens}
      - completion_tokens: ${completion_tokens}
      - total_tokens: ${total_tokens}`);
		}

		const content = response.choices?.[0]?.message?.content;
		if (!content) throw new Error("No content in response");

		const result = JSON.parse(content);
		console.log("result: ", result);

		const validated = OpenAiStructuringResponseSchema.safeParse(result);
		if (!validated.success) {
			return NextResponse.json<OpenAiApiResponse>(
				{
					success: false,
					error: {
						code: "invalid_ai_response",
						message: "AIの返却形式が不正です",
						hint: validated.error.message,
						field: "content",
					},
				},
				{ status: 422 },
			);
		}

		return NextResponse.json<OpenAiApiResponse>(
			{
				success: true,
				data: validated.data,
				message: "構造化に成功しました",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error calling OpenAI API:", error);
		return NextResponse.json(
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
