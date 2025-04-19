// app/components/ImageUploader/ImageUploader.tsx

"use client";

import { useOptimistic, useState, useTransition } from "react";

import type { ApiResponseFromType } from "@/lib/api/common.schema";
import type { ReceiptWithItemDetails } from "@/lib/api/receipt/get.schema";

import { convertToBase64 } from "@/utils/base64";

import {
	extractPagesFromGCV,
	groupWordsWithDeskew,
} from "@/lib/googleCloudVision/formatGCVResponse";
import type { GCVSingleResponse } from "@/lib/googleCloudVision/schema";

import {
	parseReceiptToJsonWithAi,
	tryParseAndFetchGCVFromClient,
} from "./action";
import { type OpenAiReceiptData, OpenAiReceiptDataSchema } from "./schema";

import ReceiptDetailsTable from "@/app/ocr/receipt/table/[id]/ReceiptDetail";
import { CreateReceiptWithItemDetailsSchema } from "@/lib/api/receipt";
import { createReceiptWithDetails } from "@/lib/api/receipt/server/createReceiptWithDetails";

function createOptimisticReceipt(
	receipt: ReceiptWithItemDetails | null,
): ReceiptWithItemDetails | null {
	if (!receipt) return null;
	return {
		...receipt,
		store: {
			id: "-",
			rawName: receipt.store?.rawName ?? "-",
			normalized: receipt.store?.normalized ?? "-",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deletedAt: null,
		},
		date: receipt.date ?? null,
		totalPrice: receipt.totalPrice,
		id: "-",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
		details: receipt.details.map((detail, index) => ({
			...detail,
			id: `00000000-0000-0000-0000-${index.toString().padStart(12, "0")}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deletedAt: null,
			item: {
				id: `00000000-0000-0000-0000-${index.toString().padStart(12, "0")}`,
				rawName: detail.item.rawName,
				normalized: detail.item.normalized ?? "",
				category: detail.item.category,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		})),
	};
}

export default function ImageUploader() {
	const [error, setError] = useState<string | null>(null);

	const [base64, setBase64] = useState<string>("");
	const [plainText, setPlainText] = useState<string>("");
	const [json, setJson] = useState<OpenAiReceiptData | null>(null);

	const [receipt, setReceipt] = useState<ReceiptWithItemDetails | null>(null);
	const [optimisticReceipt, setOptimisticReceipt] = useOptimistic(receipt);
	const [isPending, startTransition] = useTransition();

	const handleError = (error: unknown) => {
		const message = error instanceof Error ? error.message : String(error);
		console.error("エラー:", message);
		setError(message);
	};

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setError("");
		try {
			const base64 = await convertToBase64(file);
			console.log(base64);
			setBase64(base64);
		} catch (error) {
			console.error("Base64変換失敗:", error);
		}
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
				groupWordsWithDeskew(page.words, page.size.height),
			);
			setPlainText(lines.join("\n"));
			// console.log("OCR結果:", lines.join("\n"));
		} catch (error) {
			handleError(`通信エラーが発生しました。${String(error)}`);
		}
	};

	const handleAI = async (text: string) => {
		try {
			const aiResult: ApiResponseFromType<OpenAiReceiptData> =
				await parseReceiptToJsonWithAi(text);
			console.log("AIでの構造化結果:", aiResult);

			if (!aiResult.success) {
				handleError(`${aiResult.error.message}\n${aiResult.error.hint}`);
				return;
			}

			const validated = OpenAiReceiptDataSchema.safeParse(aiResult.data);
			if (!validated.success) {
				console.log("AIの構造化結果の検証に失敗しました", validated.error);
				return;
			}

			setJson(validated.data);
		} catch (error) {
			handleError(`通信エラーが発生しました。${String(error)}`);
		}
	};

	const handleRegister = async () => {
		startTransition(async () => {
			if (!json) {
				handleError("構造化されたレシートデータがありません");
				return;
			}

			try {
				const transformed = {
					...json,
					details: json.details.map((d) => {
						return {
							...d,
							unitPrice:
								d.unitPrice ??
								(d.amount !== null && d.amount > 0
									? d.subTotalPrice / d.amount
									: 0),
						};
					}),
				};

				if (transformed.details.length === 0) {
					handleError("構造化されたレシートデータがありません");
					return;
				}

				const toRegister =
					CreateReceiptWithItemDetailsSchema.strip().safeParse(transformed);

				if (!toRegister.data) {
					handleError("構造化されたレシートデータがありません");
					return;
				}

				const optimisticReceipt = createOptimisticReceipt(receipt);
				setOptimisticReceipt(optimisticReceipt);

				const result = await createReceiptWithDetails(toRegister.data);

				if (result.success) {
					setError(null);
					setReceipt(result.data);
				} else {
					handleError(result.error.message);
					return;
				}

				alert(`✅ 登録成功! レシートID: ${result.data.id}`);
				console.log("登録完了:", result.data);
			} catch (error) {
				handleError(`登録中にエラーが発生しました: ${String(error)}`);
			}
		});
	};

	return (
		<div>
			<div className="flex justify-between items-center">
				<div className="m-2">
					<label
						htmlFor="fileInput"
						className="cursor-pointer border border-gray-300 rounded-md px-4 py-2 inline-block bg-white hover:bg-gray-100 text-sm font-medium text-gray-700"
					>
						🖼️画像をアップロードする
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
				<button
					type="button"
					onClick={handleRegister}
					className="cursor-pointer border border-green-500 text-green-700 bg-white hover:bg-green-100 rounded-md px-4 py-2 m-2 text-sm"
				>
					🛒 構造化データを登録
				</button>
			</div>
			{base64 && (
				<div>
					<img src={base64} alt={"Preview"} />
				</div>
			)}
			<ReceiptDetailsTable
				details={optimisticReceipt?.details ?? receipt?.details ?? []}
			/>
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
			{/* {base64 && <div className="text-blue-700">{JSON.stringify(json)}</div>} */}
		</div>
	);
}
