// app/components/ImageUploader/ImageUploader.tsx

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useState, useTransition } from "react";

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

import {
	type CreateReceiptWithItemDetails,
	CreateReceiptWithItemDetailsSchema,
} from "@/lib/api/receipt";
import { createReceiptWithDetails } from "@/lib/api/receipt/server/createReceiptWithDetails";
import { createOptimisticReceipt } from "./createOptimisticReceipt";
import { transformToRegisterReceipt } from "./transformToRegisterReceipt";

import { Button } from "@/components/ui/button";
import { Loader2, ScanText, UploadIcon } from "lucide-react";

export default function ImageUploader() {
	const [error, setError] = useState<string | null>(null);
	const [step, setStep] = useState<"idle" | "ocr" | "ai" | "submit">("idle");

	const [base64, setBase64] = useState<string>("");
	const [plainText, setPlainText] = useState<string>("");
	const [receipt, setReceipt] = useState<ReceiptWithItemDetails | null>(null);
	const [optimisticReceipt, setOptimisticReceipt] = useOptimistic(receipt);
	const [isPending, startTransition] = useTransition();
	const [dots, setDots] = useState(".");

	useEffect(() => {
		const steps = ["", ".", "..", "..."];
		let i = 0;
		const timer = setInterval(() => {
			const nextStep = steps[i++ % steps.length];

			setDots(nextStep ?? "");
		}, 400);
		return () => clearInterval(timer);
	}, []);
	const router = useRouter();

	const stepLabelMap = {
		ocr: "レシートを読み取っています",
		ai: "AIで構造を読み取っています",
		submit: "データベースに登録しています",
		idle: "待機中",
	};

	const showError = (error: unknown) => {
		const message = error instanceof Error ? error.message : String(error);
		console.error("エラー:", message);
		setError(message);
	};

	const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return showError("画像が選択されていません");
		try {
			const base64 = await convertToBase64(file);
			setBase64(base64);
			setError(null);
		} catch (error) {
			showError(error);
		}
	};

	const runOCR = async (base64: string) => {
		try {
			const result: ApiResponseFromType<GCVSingleResponse> =
				await tryParseAndFetchGCVFromClient(base64);
			if (!result.success) return showError(result.error.message);
			const pages = extractPagesFromGCV(result.data);
			const lines = pages.flatMap((page) =>
				groupWordsWithDeskew(page.words, page.size.height),
			);
			return lines.join("\n");
		} catch (error) {
			showError(`通信エラーが発生しました。${String(error)}`);
		}
	};

	const parseWithAI = async (text: string) => {
		try {
			const result: ApiResponseFromType<OpenAiReceiptData> =
				await parseReceiptToJsonWithAi(text);
			if (!result.success)
				return showError(`${result.error.message}\n${result.error.hint}`);
			const validated = OpenAiReceiptDataSchema.safeParse(result.data);
			if (!validated.success)
				return showError("AIの構造化結果の検証に失敗しました");
			const transformed = transformToRegisterReceipt(validated.data);
			const optimistic = createOptimisticReceipt(transformed);
			return { receiptToCreate: transformed, optimistic };
		} catch (error) {
			showError(`通信エラーが発生しました。${String(error)}`);
		}
	};

	const submitReceiptData = async (
		receiptToCreate: CreateReceiptWithItemDetails,
	): Promise<ReceiptWithItemDetails | null> => {
		return new Promise((resolve) => {
			startTransition(async () => {
				try {
					const validated =
						CreateReceiptWithItemDetailsSchema.strip().safeParse(
							receiptToCreate,
						);
					if (!validated.success)
						return showError("レシートの構造化に失敗しました");
					const optimistic = createOptimisticReceipt(validated.data);
					setOptimisticReceipt(optimistic);
					const result = await createReceiptWithDetails(validated.data);
					if (!result.success) return showError(result.error.message);
					setReceipt(result.data);
					resolve(result.data);
				} catch (error) {
					showError(`登録中にエラーが発生しました: ${String(error)}`);
					resolve(null);
				}
			});
		});
	};

	const handleFullUpload = async () => {
		try {
			setStep("ocr");
			const text = await runOCR(base64);
			if (!text) return;
			setPlainText(text);

			setStep("ai");
			const parsed = await parseWithAI(text);
			if (!parsed) return;

			setStep("submit");
			const result = await submitReceiptData(parsed.receiptToCreate);

			setStep("idle");

			if (result) {
				router.push(`/receipt/table/${result.id}`);
			}
		} catch (error) {
			setStep("idle");
			showError(error);
		}
	};

	return (
		<div>
			<div className="flex justify-between items-center w-full">
				<div className="m-2">
					<Button
						asChild
						variant="outline"
						className="text-sm cursor-pointer hover:opacity-80 transition-opacity"
					>
						<label htmlFor="file-upload">
							<UploadIcon className="w-4 h-4" />
							<span className="hidden sm:inline">画像を選択</span>
						</label>
					</Button>
					<input
						id="file-upload"
						type="file"
						accept="image/*"
						onChange={uploadImage}
						className="hidden"
					/>
				</div>
				<Button
					type="submit"
					variant="secondary"
					disabled={step !== "idle"}
					onClick={() => handleFullUpload()}
					className="text-sm cursor-pointer hover:opacity-80 transition-opacity"
				>
					<ScanText />
					<span className="hidden sm:inline">AI で読み取る</span>
				</Button>
			</div>
			<div className="h-5 flex items-center gap-2 p-2">
				{step !== "idle" && (
					<>
						{<Loader2 className="animate-spin w-4 h-4" />}
						<div>
							{stepLabelMap[step]}
							{dots}
						</div>
					</>
				)}
			</div>
			{error && <p className="text-red-700">{error}</p>}
			<div className="flex justify-center">
				{base64 ? (
					<img src={base64} alt={"Preview"} />
				) : (
					<div className="relative w-full max-w-md">
						<img src="receipt-dummy.png" alt={"Dummy"} />
						<div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-5xl font-semibold">
							No Receipt
						</div>
					</div>
				)}
			</div>
			{/* {(receipt ?? optimisticReceipt) && (
				<ReceiptDetail
					receipt={receipt ?? (optimisticReceipt as ReceiptWithItemDetails)}
				/>
			)}
			{plainText && (
				<div className="mt-4 text-sm whitespace-pre-wrap font-mono">
					{plainText}
				</div>
			)}
			<div>
				<pre>{JSON.stringify(receipt, null, 2)}</pre>
			</div> */}
		</div>
	);
}
