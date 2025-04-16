"use client";

import { useOptimistic, useState, useTransition } from "react";

import type { ApiError } from "@/lib/api/common.schema";
import { createReceiptWithDetails } from "@/lib/api/receipt/actions";
import type {
	CreateReceiptWithDetailsInput,
	CreatedReceiptWithDetails,
} from "@/lib/api/receipt/create.type";

const mockInput: CreateReceiptWithDetailsInput = {
	receipt: {
		totalPrice: 1980,
		userId: "47186933-47fa-4152-91f9-70fcf9d5247d", // SupabaseユーザーID（開発用）
	},
	details: [
		{
			item: {
				rawName: "UC 大きな ツイン シュー",
				normalized: "大きなツインシュー",
				category: "snacks",
			},
			amount: 2,
			unitPrice: 900,
			subTotalPrice: 1800,
			tax: 180,
			currency: "JPY",
		},
		{
			item: {
				rawName: "サントリー天然水 2L",
				normalized: "サントリー天然水",
				category: "drink",
			},
			amount: 1,
			unitPrice: 180,
			subTotalPrice: 180,
			tax: 18,
			currency: "JPY",
		},
	],
};

export default function TestCreateReceiptPage() {
	const [receipt, setReceipt] = useState<CreatedReceiptWithDetails | null>(
		null,
	);
	const [optimisticReceipt, setOptimisticReceipt] = useOptimistic(receipt);
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<ApiError | null>(null);

	const handleSubmit = () => {
		startTransition(async () => {
			const optimisticReceipt: CreatedReceiptWithDetails = {
				...mockInput,
				receipt: {
					totalPrice: mockInput.receipt.totalPrice,
					userId: "-",
					id: "-",
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					deletedAt: null,
				},
				details: mockInput.details.map((detail, index) => ({
					...detail,
					id: `00000000-0000-0000-0000-${index.toString().padStart(12, "0")}`,
					itemId: `00000000-0000-0000-0000-${index.toString().padStart(12, "0")}`,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					deletedAt: null,
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

const dummyReceipt: CreatedReceiptWithDetails = {
	receipt: {
		id: "dummy-receipt-id",
		userId: "dummy-user-id",
		totalPrice: 1980,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
	},
	details: [
		{
			id: "dummy-detail-1",
			itemId: "item-123",
			amount: 2,
			unitPrice: 900,
			subTotalPrice: 1800,
			tax: 180,
			currency: "JPY",
			receiptId: "dummy-receipt-id",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deletedAt: null,
		},
		{
			id: "dummy-detail-2",
			itemId: "item-456",
			amount: 1,
			unitPrice: 180,
			subTotalPrice: 180,
			tax: 18,
			currency: "JPY",
			receiptId: "dummy-receipt-id",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deletedAt: null,
		},
	],
};
function ReceiptTable({
	receipt = dummyReceipt,
}: { receipt: CreatedReceiptWithDetails | undefined }) {
	return (
		<div className="overflow-x-auto">
			<table className="table-auto w-full">
				<thead>
					<tr>
						<th className="px-4 py-2">Item</th>
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
							<td className="border px-4 py-2">{detail.itemId}</td>
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
