"use client";

import { trpc } from "@/lib/trpc/client";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

import { getReceiptDetailColumns } from "@/app/dashboard/receipts/table/[id]/receiptDetail.columns";
import { getFullReceiptDetailColumns } from "@/app/dashboard/receipts/table/[id]/receiptDetail.full.columns";
import type { CreateReceiptDetail, Item } from "@/lib/api/receipt";
import {
	type ReceiptDetailWithItem,
	ReceiptDetailWithItemSchema,
	type ReceiptWithItemDetails,
} from "@/lib/api/receipt/get.schema";
import { NewReceiptDetailRow } from "./NewReceiptDetailRow";
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
	const [error, setError] = useState<string | null>(null);

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
	const createMutation = trpc.receipt.createDetail.useMutation({
		onMutate: async (input) => {
			const prevReceipt = { ...receipt, details: receipt.details.slice(-1) };
			return { prevReceipt };
		},
		onError: (error, _, context) => {
			if (context?.prevReceipt) {
				setReceipt(context.prevReceipt);
			}
			console.error("更新失敗:", error.message);
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

	const handleCreate = (detail: CreateReceiptDetail, item: Item) => {
		// 楽観更新
		setReceipt((prev) => ({
			...prev,
			details: [
				...prev.details,
				{
					...detail,
					id: "",
					item,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					deletedAt: null,
				},
			],
		}));
		createMutation.mutate(detail);
	};

	return (
		<div>
			<table className="w-full table-auto border mt-4">
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th key={header.id} className="border bg-gray-200">
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
								<td key={cell.id} className="border">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
				<tfoot>
					<NewReceiptDetailRow
						receipt={receipt}
						onCreate={(detail, item) => handleCreate(detail, item)}
						onError={(error) => {
							setError(error);
						}}
					/>
				</tfoot>
			</table>
			<div>
				<span className="text-red-700">
					{!hasDetails && "明細がありません"}
					{error}
				</span>
			</div>
		</div>
	);
}
