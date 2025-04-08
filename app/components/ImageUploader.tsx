"use client";

import {
	convertToBase64,
	isBase64DataUrl,
	stripBase64Prefix,
} from "@/utils/base64";
import { useState } from "react";

export default function ImageUploader() {
	const [base64, setBase64] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [result, setResult] = useState<string>("");

	const handleSendToApi = async (base64: string) => {
		if (!base64) {
			const errorMessage = "画像がありません。画像をアップロードしてください";
			console.error("画像エラー", errorMessage);
			setError(errorMessage);
			return;
		}

		if (!isBase64DataUrl(base64)) {
			const errorMessage = "画像が base64 データとして読み込めませんでした";
			console.error("画像エラー", errorMessage);
			setError(errorMessage);
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

			const result = await res.json();
			if (!res.ok) {
				const errorMessage = `APIからのレスポンスが正しく受け取れませんでした。
          ${JSON.stringify(result)}`;
				console.error("APIエラー:", result);
				setError(errorMessage);
				return;
			}
			console.log("OCR結果:", result.fullTextAnnotation?.text);
			setResult(result.fullTextAnnotation?.text);
		} catch (err) {
			const errorMessage = `通信エラーが発生しました。${JSON.stringify(err)}`;
			console.error("通信エラー:", err);
			setError(errorMessage);
		}
	};

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			const result = await convertToBase64(file);
			setBase64(result);
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
			{result && <p className="text-green-700">OCR結果: {result}</p>}
			{error && <p className="text-red-700">{error}</p>}
		</div>
	);
}
