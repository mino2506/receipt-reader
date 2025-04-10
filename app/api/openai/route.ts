import {
	messagePrefixPrompt,
	messageSuffixPrompt,
	rolePrompt,
} from "@/app/api/openai/receiptPrompt";
import { openai } from "@/lib/openai";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const POST = async (req: Request, res: NextResponse) => {
	console.log("\n\n~~~📨📮   POOOOOOOOOST!!!🚀🚀🚀🆕🆕🆕\n");

	const supabase = await createServerClient();
	if (process.env.NODE_ENV === "development") {
		// 🔐 認証チェック
		console.log("🔐 開発環境です。認証をスキップしました。");
	} else {
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (error) {
			return NextResponse.json(
				{ message: "failed in fetch user from supabase", error },
				{ status: 500 },
			);
		}
		if (!user) {
			return NextResponse.json(
				{ message: "user is not found" },
				{ status: 400 },
			);
		}
	}

	const { data } = await req.json();
	// const { fullTextAnnotation } = await req.json();

	// if (typeof fullTextAnnotation === "undefined") {
	// 	console.log("fullTextAnnotation is undefined");
	// 	return NextResponse.json(
	// 		{ message: "fullTextAnnotation is required in request body" },
	// 		{ status: 400 },
	// 	);
	// }

	const inputOcrText = data.join("\n");

	console.log("inputOcrText: ");
	console.log(inputOcrText);

	const actionPrompt: string = `
  ${messagePrefixPrompt}
  ${inputOcrText}
  ${messageSuffixPrompt}
  `;

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

		if (response.usage) {
			const { prompt_tokens, completion_tokens, total_tokens } = response.usage;
			console.log(`📊 OpenAI token usage:
      - prompt_tokens: ${prompt_tokens}
      - completion_tokens: ${completion_tokens}
      - total_tokens: ${total_tokens}`);
		}

		const content = response?.choices?.[0]?.message.content;
		if (!content) {
			throw new Error("No content in response");
		}

		const returnJson = JSON.parse(content);

		return NextResponse.json(
			{ message: "Success", content: returnJson },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error calling OpenAI API:", error);
		return NextResponse.json({ message: "Error", error }, { status: 500 });
	}
};
