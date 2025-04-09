// app/api/ocr/route.ts

import { createClient as createServerClient } from "@/lib/supabase/server";
import { isBase64DataUrl, stripBase64Prefix } from "@/utils/base64";
import { googleCloudVisionClient } from "@/utils/googleCloudVision";
import { NextResponse } from "next/server";

// export default async function handler(req: Request, res: NextResponse) {
// 	if (req.method !== "POST") {
// 		res.status(405).json({ error: "Only POST requests are allowed" });
// 		return;
// 	}

// 	try {
// 		// リクエストボディから画像URLまたはbase64のデータを取得
// 		const { url } = req.json();
// 		if (!imageUrl) {
// 			// res.status(400).json({ error: "imageUrl is required in request body" });
// 			return NextResponse.json(
// 				{ message: "imageUrl is required in request body" },
// 				{ status: 400 },
// 			);
// 		}

// 		// 例：ラベル検出を実施
// 		const [result] = await googleCloudVisionClient.labelDetection(imageUrl);
// 		const labels = result.labelAnnotations;

// 		res.status(200).json({ labels });
// 	} catch (error) {
// 		console.error("Error calling Cloud Vision API:", error);
// 		res.status(500).json({ error: error.message });
// 	}
// }
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

	const reqBody = await req.json();

	const { imageUrl } = reqBody;
	if (typeof imageUrl === "undefined") {
		return NextResponse.json(
			{ message: "imageUrl is required in request body" },
			{ status: 400 },
		);
	}

	let requestToGCV;
	if (isBase64DataUrl(imageUrl)) {
		const cleanedBase64 = stripBase64Prefix(imageUrl);
		console.log("[log]request type: ", "Base64");
		console.log(
			"stripBase64Prefix: ",
			stripBase64Prefix(imageUrl).slice(0, 100),
		);
		requestToGCV = {
			image: { content: cleanedBase64 },
		};
	} else if (imageUrl.startsWith("http")) {
		console.log("request type: ", "Url");

		requestToGCV = {
			image: { source: { imageUri: imageUrl } },
		};
	} else {
		console.warn("⚠️ imageUrl がURLでもBase64でもありません");
		return NextResponse.json(
			{ message: "Invalid image format" },
			{ status: 400 },
		);
	}

	try {
		const [result] =
			await googleCloudVisionClient.documentTextDetection(requestToGCV);
		const fullTextAnnotation = result.fullTextAnnotation;
		const rawText = result.fullTextAnnotation?.text;

		console.dir(result, { depth: null });
		console.log("fullTextAnnotation: ", fullTextAnnotation);
		console.log("rawText: ", rawText);
		// return fullTextAnnotation?.text;

		return NextResponse.json({ message: "Success", result }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: "Error", error }, { status: 500 });
	}
};
