// app/components/ImageUploader/ImageUploader.tsx

"use client";

import type { ApiResponseFromType } from "@/lib/api/common.schema";
import {
	extractPagesFromGCV,
	groupWordsIntoLinesByRatio,
} from "@/lib/googleCloudVision/formatGCVResponse";
import type { GCVSingleResponse } from "@/lib/googleCloudVision/schema";
import type {
	OpenAIApiResponseSchema,
	OpenAIChatCompletionChoiceSchema,
} from "@/lib/openai/schema";
import { convertToBase64 } from "@/utils/base64";
import { useState } from "react";
import {
	parseReceiptToJsonWithAi,
	tryParseAndFetchGCVFromClient,
} from "./action";
import {
	type OpenAiApiReceiptResponse,
	OpenAiApiReceiptResponseSchema,
} from "./schema";

const fetchOpenAI = async (text: string) => {
	const res = await fetch("/api/openai", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ text }),
	});
	return res.json();
};

export default function ImageUploader() {
	const [base64, setBase64] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [plainText, setPlainText] = useState<string>("");
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const [json, setJson] = useState<any>(null);

	const handleError = (error: unknown) => {
		const message = error instanceof Error ? error.message : String(error);
		console.error("エラー:", message);
		setError(message);
	};

	const handleOCR = async (base64: string) => {
		setError("");
		setPlainText("");

		if (!base64) {
			handleError("画像がありません。画像をアップロードしてください");
			return;
		}

		try {
			console.log("OCRを開始します");
			const fetched: ApiResponseFromType<GCVSingleResponse> =
				await tryParseAndFetchGCVFromClient(base64);
			console.log("OCRが完了しました");
			console.log("OCR結果:", fetched);

			if (!fetched.success) {
				handleError(fetched.error.message);
				return;
			}

			const pages = extractPagesFromGCV(fetched.data);
			console.log("ページ数:", pages.length);
			const lines = pages.flatMap((page) =>
				groupWordsIntoLinesByRatio(page.words, page.size.height),
			);
			setPlainText(lines.join("\n"));
			// console.log("OCR結果:", lines.join("\n"));
		} catch (error) {
			handleError(`通信エラーが発生しました。${String(error)}`);
		}
	};

	const handleAI = async (text: string) => {
		try {
			const aiResult: ApiResponseFromType<OpenAiApiReceiptResponse> =
				await parseReceiptToJsonWithAi(text);
			console.log("AIでの構造化結果:", aiResult);
			if (!aiResult.success) {
				handleError(`${aiResult.error.message}\n${aiResult.error.hint}`);
				return;
			}
			setJson(aiResult.data);
		} catch (error) {
			handleError(`通信エラーが発生しました。${String(error)}`);
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
					onClick={() => handleOCR(base64)}
					className="cursor-pointer border border-gray-300 rounded-md px-4 py-2 inline-block bg-white hover:bg-gray-100 text-sm font-medium text-gray-700"
				>
					📝OCR送信
				</button>
				<button
					type="submit"
					onClick={() => handleAI(plainText)}
					className="cursor-pointer border border-gray-300 rounded-md px-4 py-2 inline-block bg-white hover:bg-gray-100 text-sm font-medium text-gray-700"
				>
					📊AI送信
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
					{plainText.split("\n").map((line, index) => (
						<div
							key={`line-${
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								index
							}`}
						>
							{line}
						</div>
					))}
				</div>
			)}
			{error && <p className="text-red-700">{error}</p>}
			{/* {json && (
				<table>
					<tr>
						<th>商品名</th>
					</tr>
					<tr>
						<th>価格</th>
					</tr>
				</table>
			)} */}
			{json && (
				<div>
					<pre>{JSON.stringify(json, null, 2)}</pre>
				</div>
			)}
		</div>
	);
}
