"use client";

import { useOptimistic, useState, useTransition } from "react";

import type { ApiError } from "@/lib/api/common.schema";
import type { CreateReceiptWithItemDetails } from "@/lib/api/receipt/create.schema";
import type { ReceiptWithItemDetails } from "@/lib/api/receipt/get.schema";
import { createReceiptWithDetails } from "@/lib/api/receipt/server/createReceiptWithDetails";

const mockInput: CreateReceiptWithItemDetails = {
	totalPrice: 384,
	date: "2024-04-01T12:00:00Z",
	store: {
		rawName: "LAWSON 渋谷駅前",
		normalized: "ローソン",
	},
	details: [
		{
			item: {
				rawName: "UC 大きな ツイン シュー",
				normalized: "大きなツインシュー",
				category: "snacks",
			},
			amount: 2,
			unitPrice: 138,
			subTotalPrice: 276,
			tax: 20,
			currency: "JPY",
			order: 1,
		},
		{
			item: {
				rawName: "サントリー天然水 2L",
				normalized: "サントリー天然水",
				category: "drink",
			},
			amount: 1,
			unitPrice: 108,
			subTotalPrice: 108,
			tax: 8,
			currency: "JPY",
			order: 2,
		},
	],
};

export default function TestCreateReceiptPage() {
	const [receipt, setReceipt] = useState<ReceiptWithItemDetails | null>(null);
	const [optimisticReceipt, setOptimisticReceipt] = useOptimistic(receipt);
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<ApiError | null>(null);

	const handleSubmit = () => {
		startTransition(async () => {
			const optimisticReceipt: ReceiptWithItemDetails = {
				...mockInput,
				store: {
					id: "-",
					rawName: mockInput.store?.rawName ?? "-",
					normalized: mockInput.store?.normalized ?? "-",
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					deletedAt: null,
				},
				date: mockInput.date ?? null,
				totalPrice: mockInput.totalPrice,
				id: "-",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				deletedAt: null,
				details: mockInput.details.map((detail, index) => ({
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

			setOptimisticReceipt(optimisticReceipt);

			const result = await createReceiptWithDetails(mockInput);

			if (result.success) {
				setError(null);
				setReceipt(result.data);
			} else {
				setError(result.error);
				console.error(result.error);
			}
		});
	};

	return (
		<main className="flex flex-col items-center justify-center w-max-full">
			<h1 className="text-xl font-bold m-4">🧪 レシート登録テスト</h1>
			<button
				type="button"
				onClick={handleSubmit}
				disabled={isPending}
				className="bg-blue-600 text-white px-4 py-2 rounded hover:opacity-80 disabled:opacity-50"
			>
				{isPending ? "送信中..." : "createReceiptWithDetails を実行"}
			</button>
			<div className="m-2 w-full">
				<ReceiptTable receipt={optimisticReceipt ?? undefined} />
			</div>
			{error && (
				<div>
					<p className="text-red-600 text-sm mt-2">{error.message}</p>
					<p className="text-red-600 text-sm mt-2">{error.hint}</p>
				</div>
			)}
		</main>
	);
}

const dummyReceipt: ReceiptWithItemDetails = {
	id: "dummy-receipt-id",
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	deletedAt: null,
	totalPrice: 999,
	date: new Date().toISOString(),
	store: {
		rawName: "ダミー店舗",
		normalized: "正規化済みダミー店舗",
		id: "store-dummy-id",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
	},
	details: [
		{
			id: "dummy-detail-1",
			item: {
				rawName: "ダミー商品名-1",
				normalized: "標準化済みダミー商品名-1",
				category: "other",
				id: "item-123",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			amount: 2,
			unitPrice: 333,
			subTotalPrice: 666,
			tax: 19,
			currency: "JPY",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deletedAt: null,
			order: 1,
		},
		{
			id: "dummy-detail-2",
			item: {
				rawName: "ダミー商品名-2",
				normalized: null,
				category: "drink",
				id: "item-456",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			amount: 1,
			unitPrice: 333,
			subTotalPrice: 333,
			tax: 25,
			currency: "JPY",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deletedAt: null,
			order: 2,
		},
	],
};
function ReceiptTable({
	receipt = dummyReceipt,
}: { receipt: ReceiptWithItemDetails | undefined }) {
	return (
		<div className="overflow-x-auto">
			<table className="table-auto w-full">
				<thead>
					<tr>
						<th className="px-4 py-2">Item Name</th>
						<th className="px-4 py-2">Amount</th>
						<th className="px-4 py-2">Unit Price</th>
						<th className="px-4 py-2">Subtotal Price</th>
						<th className="px-4 py-2">Tax</th>
						<th className="px-4 py-2">Currency</th>
					</tr>
				</thead>
				<tbody>
					{receipt.details.map((detail) => (
						<tr key={detail.id}>
							<td className="border px-4 py-2">
								{detail.item.normalized ?? detail.item.rawName}
							</td>
							<td className="border px-4 py-2">{detail.amount}</td>
							<td className="border px-4 py-2">{detail.unitPrice}</td>
							<td className="border px-4 py-2">{detail.subTotalPrice}</td>
							<td className="border px-4 py-2">{detail.tax}</td>
							<td className="border px-4 py-2">{detail.currency}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
