// app/api/ocr/route.ts

import {
	GCVFeatureSchema,
	GCVFeatureType,
	GCVRequestSchema,
	googleCloudVisionClient,
} from "@/lib/googleCloudVision";
import {} from "@/lib/googleCloudVision";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isBase64, toPureBase64 } from "@/utils/base64";
import { NextResponse } from "next/server";
import type { z } from "zod";

const reqMock = {
	body: {
		image:
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFBAJ/wlseKgAAAABJRU5ErkJggg==",
		features: [
			{
				type: "DOCUMENT_TEXT_DETECTION",
			},
			{
				type: "LABEL_DETECTION",
			},
		],
	},
};
const safeParsedGCVRequest = GCVRequestSchema.safeParse(reqMock.body);
type GCVRequest = z.infer<typeof GCVRequestSchema>;

export function hasValidGCVRequestBody(body: unknown): body is GCVRequest {
	if (
		typeof body !== "object" ||
		body === null ||
		!("image" in body) ||
		!("features" in body)
	) {
		console.warn("[GCV] Missing image or features in request", body);
		return false;
	}

	const features = (body as any).features;
	if (!Array.isArray(features) || features.length === 0) {
		console.warn("[GCV] Features must be a non-empty array", features);
		return false;
	}

	return true;
}

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
	if (isBase64(imageUrl)) {
		const cleanedBase64 = toPureBase64(imageUrl);
		console.log("[log]request type: ", "Base64");
		console.log("stripBase64Prefix: ", toPureBase64(imageUrl).slice(0, 100));
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

	const resquestTest = {
		requests: [requestToGCV],
		features: [{ type: 11 }, { type: 3 }],
	};
	try {
		// const [result] =
		// 	await googleCloudVisionClient.documentTextDetection(requestToGCV);
		const [result] = await googleCloudVisionClient.annotateImage(resquestTest);
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
