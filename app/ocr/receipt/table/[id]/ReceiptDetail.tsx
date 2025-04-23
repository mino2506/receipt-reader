"use client";

import { trpc } from "@/lib/trpc/client";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

import { ItemSelector } from "@/app/components/receipt/ItemSelector";
import { getReceiptDetailColumns } from "@/app/ocr/receipt/table/[id]/receiptDetail.columns";
import { getFullReceiptDetailColumns } from "@/app/ocr/receipt/table/[id]/receiptDetail.full.columns";
import {
	type ReceiptDetailWithItem,
	ReceiptDetailWithItemSchema,
	type ReceiptWithItemDetails,
} from "@/lib/api/receipt/get.schema";
import { buildUpdatePayload } from "./buildUpdatePayload";

const dummyRowInit: ReceiptDetailWithItem = {
	id: "new",
	amount: 1,
	unitPrice: 0,
	subTotalPrice: 0,
	tax: 0,
	currency: "JPY",
	order: 0,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	deletedAt: null,
	item: {
		id: "",
		rawName: "",
		normalized: null,
		category: "other",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
};

export default function ReceiptDetail(props: {
	receipt: ReceiptWithItemDetails;
}) {
	const [editingRowId, setEditingRowId] = useState<string | null>(null);
	const [receipt, setReceipt] = useState<ReceiptWithItemDetails>(props.receipt);

	const details = receipt.details;
	const hasDetails = details.length > 0;

	const utils = trpc.useUtils();
	const mutation = trpc.receipt.updateDetail.useMutation({
		onMutate: async (updated) => {
			const prevReceipt = receipt;

			setReceipt((prev) => ({
				...prev,
				details: prev.details.map((d) =>
					d.id === updated.id ? { ...d, ...updated } : d,
				),
			}));

			return { prevReceipt };
		},

		onError: (error, _, context) => {
			if (context?.prevReceipt) {
				setReceipt(context.prevReceipt);
			}
			console.error("更新失敗:", error.message);
		},
		onSuccess: (data) => {
			const parsed = ReceiptDetailWithItemSchema.parse(data);
			setReceipt((prev) => ({
				...prev,
				details: prev.details.map((d) =>
					d.id === data.id ? { ...d, ...parsed } : d,
				),
			}));
		},
		onSettled: () => {
			utils.receipt.getReceiptById.invalidate({ id: receipt.id });
		},
	});
	const deleteMutation = trpc.receipt.deleteDetail.useMutation({
		onMutate: async (input) => {
			const prevReceipt = receipt;

			setReceipt((prev) => ({
				...prev,
				details: prev.details.filter((d) => d.id !== input.id),
			}));

			return { prevReceipt };
		},
		onSettled: () => {
			utils.receipt.getReceiptById.invalidate({ id: receipt.id });
		},
	});

	const baseReceiptDetailColumns = getReceiptDetailColumns({
		editingRowId,
		setEditingRowId,
		updateRow: (id, updated) => {
			const detail = details.find((d) => d.id === id);
			if (!detail) return;
			if (detail.id.startsWith("new")) return;

			const payload = buildUpdatePayload(detail, updated);

			// 楽観更新: item が含まれていれば state を先に更新
			// updateDetail.useMutation の input は、
			// 自由記述を避けるため itemId のみ設計
			// 複数編集されたときにロールバックが怪しくなるかも
			if (updated.item) {
				const updatedItem = updated.item; // 推論用
				setReceipt((prev) => ({
					...prev,
					details: prev.details.map((d) =>
						d.id === id
							? {
									...d,
									item: updatedItem,
								}
							: d,
					),
				}));
			}

			mutation.mutate(payload);
		},
	});
	const fullReceiptDetailColumns = getFullReceiptDetailColumns({
		baseColumnDef: baseReceiptDetailColumns,
		onEdit: () => {},
		onDelete: (row) => {
			deleteMutation.mutate({ id: row.id });
		},
	});

	const table = useReactTable({
		data: details,
		columns: fullReceiptDetailColumns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div>
			<table className="w-full table-auto border mt-4">
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th key={header.id} className="border px-2 py-1 bg-gray-200">
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="border px-2 py-1">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
				<tfoot>
					<NewReceiptDetailRow receipt={receipt} onCreate={() => {}} />
				</tfoot>
			</table>
			{!hasDetails && (
				<div>
					<span className="text-red-700">明細がありません</span>
				</div>
			)}
		</div>
	);
}

import type { CreateReceiptDetail, Item } from "@/lib/api/receipt";
import {
	CATEGORY_LABELS,
	CURRENCY_LABELS,
	type Currency,
} from "@/lib/api/receipt";

export function NewReceiptDetailRow({
	receipt,
	onCreate,
}: {
	receipt: ReceiptWithItemDetails;
	onCreate: (data: CreateReceiptDetail) => void;
}) {
	const [error, setError] = useState<string | null>(null);
	const [item, setItem] = useState<Item | null>(null);
	const [amount, setAmount] = useState(1);
	const [unitPrice, setUnitPrice] = useState(0);
	const [subTotalPrice, setSubTotalPrice] = useState(0);
	const [tax, setTax] = useState(0);
	const [currency, setCurrency] = useState<Currency>("JPY");
	const [isCurrencyEditing, setIsCurrencyEditing] = useState(false);
	const [currencyInput, setCurrencyInput] = useState<string>("");

	const handleCreate = () => {
		setError(null);
		if (!item) {
			setError("商品を選択してください");
			return;
		}
		const draft: CreateReceiptDetail = {
			receiptId: receipt.id,
			itemId: item.id,
			amount,
			unitPrice,
			subTotalPrice,
			tax,
			currency: "JPY",
			order: receipt.details.length + 1,
		};

		onCreate(draft);
	};

	return (
		<>
			<tr>
				<td className="border">new</td>
				<td>
					<ItemSelector value={item} onSelect={setItem} />
				</td>
				<td className="border px-2 py-1">
					<div className="text-sm w-full h-full">{item?.category}</div>
				</td>
				<td className="border px-2 py-1">
					<input
						type="number"
						value={amount}
						onChange={(e) => setAmount(Number(e.target.value))}
						className="w-full text-sm"
					/>
				</td>
				<td className="border px-2 py-1">
					<input
						type="unitPrice"
						value={unitPrice}
						onChange={(e) => setUnitPrice(Number(e.target.value))}
						className="w-full text-sm"
					/>
				</td>
				<td className="border px-2 py-1">
					<input
						type="subTotalPrice"
						value={subTotalPrice}
						onChange={(e) => setSubTotalPrice(Number(e.target.value))}
						className="w-full text-sm"
					/>
				</td>
				<td className="border px-2 py-1">
					<input
						type="tax"
						value={tax}
						onChange={(e) => setTax(Number(e.target.value))}
						className="w-full text-sm"
					/>
				</td>
				<td className="border px-2 py-1">
					<div className="relative">
						<input
							type="text"
							value={currencyInput}
							onFocus={() => setIsCurrencyEditing(true)}
							onBlur={(e) => {
								setIsCurrencyEditing(false);
								setCurrencyInput(e.target.value);
							}}
							onChange={(e) => setCurrencyInput(e.target.value)}
							className="w-full h-full text-sm"
							placeholder="通貨を入力"
						/>
					</div>
					{isCurrencyEditing && (
						<ul className="absolute z-10 bg-white border w-full shadow text-sm">
							{Object.entries(CURRENCY_LABELS)
								.filter(
									([k, v]) =>
										k.includes(currencyInput) || v.includes(currencyInput),
								)
								.map(([key, label]) => (
									// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
									<li
										key={key}
										className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
										onClick={() => setCurrency(key as Currency)}
									>
										{label}
									</li>
								))}
						</ul>
					)}
				</td>
				<td>
					<button type="button" onClick={handleCreate}>
						登録
					</button>
				</td>
			</tr>
			<tr>
				<span className=" text-red-700"> {error}</span>
			</tr>
		</>
	);
}
