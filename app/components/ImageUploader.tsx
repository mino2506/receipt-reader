"use client";

import {
	base64ImagePrefixRegex,
	base64ImageRegex,
	convertToBase64,
	isBase64DataUrl,
	stripBase64Prefix,
} from "@/utils/base64";
import {
	type GCVResponse,
	extractPagesFromGCV,
	groupWordsIntoLinesByRatio,
	isGCVResponse,
	parseGCVResponse,
} from "@/utils/formatGCVResponse";
import { useState } from "react";
import { z } from "zod";

export enum GCVFeatureType {
	TYPE_UNSPECIFIED = 0,
	FACE_DETECTION = 1,
	LANDMARK_DETECTION = 2,
	LOGO_DETECTION = 3,
	LABEL_DETECTION = 4,
	TEXT_DETECTION = 5,
	DOCUMENT_TEXT_DETECTION = 11,
	SAFE_SEARCH_DETECTION = 6,
	IMAGE_PROPERTIES = 7,
	CROP_HINTS = 9,
	WEB_DETECTION = 10,
	PRODUCT_SEARCH = 12,
	OBJECT_LOCALIZATION = 19,
}

function enumKeys<T extends Record<string, string | number>>(e: T) {
	const keys = Object.keys(e).filter((k) =>
		Number.isNaN(Number(k)),
	) as (keyof T)[];

	if (keys.length === 0) {
		throw new Error("Enum must have at least one key");
	}

	return keys as [keyof T, ...(keyof T)[]];
}

function enumValues<T extends Record<string, string | number>>(
	e: T,
): T[keyof T][] {
	return Object.values(e).filter((v) => typeof v === "number") as T[keyof T][];
}

export const base64ImageSchema = z
	.string()
	.regex(base64ImageRegex, {
		message: "画像を base64 として読み込めませんでした",
	})
	.transform((value) => value.replace(base64ImagePrefixRegex, ""));

export const GCVFeatureSchema = z.object({
	type: z
		.enum(enumKeys(GCVFeatureType))
		.transform((key) => GCVFeatureType[key]),
});

export const GCVRequestSchema = z.object({
	request: z.object({
		image: z.object({
			content: base64ImageSchema,
		}),
		features: z.array(GCVFeatureSchema),
	}),
});

export default function ImageUploader() {
	const [base64, setBase64] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [plainText, setPlainText] = useState<string>("");

	const handleError = (errorMessage: string) => {
		console.error("エラー:", errorMessage);
		setError(errorMessage);
	};

	const handleSendToApi = async (base64: string) => {
		setError("");
		setPlainText("");

		if (!base64) {
			handleError("画像がありません。画像をアップロードしてください");
			return;
		}

		const safeParsedBase64 = base64ImageSchema.safeParse(base64);

		if (!safeParsedBase64.success) {
			const errorMessage = safeParsedBase64.error.errors
				.map((e) => e.message)
				.join("\n");
			handleError(errorMessage);
			return;
		}

		try {
			const res = await fetch("/api/ocr", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ imageUrl: base64 }),
			});

			const resBody = await res.json();
			console.log("resBody", resBody);
			if (!res.ok) {
				const errorMessage = `APIからのレスポンスが正しく受け取れませんでした。
          ${JSON.stringify(res.statusText)}`;
				console.error("APIエラー:", res.statusText);
				setError(errorMessage);
				return;
			}

			if (!isGCVResponse(resBody)) {
				const errorMessage = "レスポンスが正しくありません。";
				console.error("レスポンスエラー:", errorMessage);
				setError(errorMessage);
				return;
			}

			if (isGCVResponse(resBody)) {
				const parsedGCVResponse = parseGCVResponse(resBody) as GCVResponse;
				const pages = extractPagesFromGCV(parsedGCVResponse);
				for (const page of pages) {
					console.log(page.size);
					const words = page.words;
					const lines: string[] = groupWordsIntoLinesByRatio(
						words,
						page.size.height,
					);

					const plainText = lines.join("\n");
					setPlainText(plainText);
					console.log("OCR結果:", plainText);
					console.log(plainText.length);
				}
			}
		} catch (error) {
			const errorMessage = `通信エラーが発生しました。${JSON.stringify(error)}`;
			console.error("通信エラー:", error);
			setError(errorMessage);
		}
	};

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setError("");
		try {
			const base64 = await convertToBase64(file);
			setBase64(base64);
		} catch (error) {
			console.error("Base64変換失敗:", error);
		}
	};

	return (
		<div>
			<div className="flex justify-between items-center">
				<div className="m-2">
					<label
						htmlFor="fileInput"
						className="cursor-pointer border border-gray-300 rounded-md px-4 py-2 inline-block bg-white hover:bg-gray-100 text-sm font-medium text-gray-700"
					>
						画像をアップロードする
					</label>
					<input
						id="fileInput"
						type="file"
						accept="image/*"
						onChange={handleImageChange}
						className="hidden"
					/>
				</div>
				<button
					type="submit"
					onClick={() => handleSendToApi(base64)}
					className="cursor-pointer border border-gray-300 rounded-md px-4 py-2 inline-block bg-white hover:bg-gray-100 text-sm font-medium text-gray-700"
				>
					OCR送信
				</button>
			</div>
			{base64 && (
				<div>
					<img src={base64} alt={"Preview"} />
				</div>
			)}
			{!base64 && (
				<div className="relative w-full max-w-md">
					<img src="receipt-dummy.png" alt={"Dummy"} />
					<div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-5xl font-semibold">
						No Receipt
					</div>
				</div>
			)}
			{plainText && (
				<div>
					{plainText.split("\n").map((line) => (
						<div key={line}>{line}</div>
					))}
				</div>
			)}
			{error && <p className="text-red-700">{error}</p>}
		</div>
	);
}
