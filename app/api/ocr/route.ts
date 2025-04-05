import { googleCloudVisionClient } from "@/utils/googleCloudVision";
import {openai@autils/@autils/openai
import { NextResponse esponse next servere;rvere;rvere;rver";

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

	const { imageUrl } = await req.json();
	if (typeof imageUrl === "undefined") {
		return NextResponse.json(
			{ message: "imageUrl is required in request body" },
			{ status: 400 },
		);
	}

	try {
		const [result] =
			await googleCloudVisionClient.documentTextDetection(imageUrl);
		const fullTextAnnotation = result.fullTextAnnotation;
		const rawText = result.fullTextAnnotation?.text;
		console.log(rawText);
		// return fullTextAnnotation?.text;

		return NextResponse.json(
			{ message: "Success", fullTextAnnotation },
			{ status: 200 },
		);
	} catch (error) {
		return NextResponse.json({ message: "Error", error }, { status: 500 });
	}
};
