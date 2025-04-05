import { openai } from "@/utils/openai";
import { NextResponse } from "next/server";

export const POST = async (req: Request, res: NextResponse) => {
	console.log("\n\n~~~📨📮   POOOOOOOOOST!!!🚀🚀🚀🆕🆕🆕\n");

	// const reqJson = await req.json();
	// console.log(reqJson);

	const { fullTextAnnotation } = await req.json();

	if (typeof fullTextAnnotation === "undefined") {
		console.log("fullTextAnnotation is undefined");
		return NextResponse.json(
			{ message: "fullTextAnnotation is required in request body" },
			{ status: 400 },
		);
	}

	const inputOcrText = JSON.stringify(fullTextAnnotation);

	console.log("inputOcrText: ");
	console.log(inputOcrText);

	const rolePrompt: string =
		"あなたはレシートデータを構造化するAIアシスタントです。OCRで抽出されたテキストを分析し、必要な情報を正確にJSON形式で返してください。";
	const actionPrompt: string = `以下はレシートのOCRテキストです。このテキストから次の情報を抽出してJSON形式で返してください：
- storeName: 店舗名
- date: 購入日（YYYY-MM-DD形式に変換）
- time: 購入時間（HH:MM形式）
- items: 商品リスト（各商品の名前、数量、価格を含む）
- totalPrice: 合計金額
- taxAmount: 税額（あれば）

レシートテキスト:
${inputOcrText}`;

	try {
		console.log("try openai.chat.completions.create");
		const response = await openai.chat.completions.create({
			model: "gpt-3.5-turbo-16k",
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
