"use client";

import { trpc } from "@/lib/trpc/client";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

import { getReceiptDetailColumns } from "@/app/ocr/receipt/table/[id]/receiptDetail.columns";
import { getFullReceiptDetailColumns } from "@/app/ocr/receipt/table/[id]/receiptDetail.full.columns";
import type {
	ReceiptDetailWithItem,
	ReceiptWithItemDetails,
} from "@/lib/api/receipt/get.schema";

export default function ReceiptDetail(props: {
	receipt: ReceiptWithItemDetails;
}) {
	const [editingRowId, setEditingRowId] = useState<string | null>(null);
	const [receipt, setReceipt] = useState<ReceiptWithItemDetails>(props.receipt);

	const details = receipt.details;

	const utils = trpc.useUtils();
	const mutation = trpc.receipt.updateDetail.useMutation({
		onMutate: async (updated) => {
			const prevReceipt = receipt;

			// 楽観的に state 更新（UIには即反映）
			setReceipt((prev) => ({
				...prev,
				details: prev.details.map((d) =>
					d.id === updated.id ? { ...d, ...updated } : d,
				),
			}));

			return { prevReceipt };
		},

		onError: (error, _, context) => {
			// エラー時にはロールバック
			if (context?.prevReceipt) {
				setReceipt(context.prevReceipt);
			}
			console.error("更新失敗:", error.message);
		},

		onSettled: () => {
			// サーバと整合性を取るため再取得
			utils.receipt.getReceiptById.invalidate({ id: receipt.id });
		},
	});

	const baseReceiptDetailColumns = getReceiptDetailColumns({
		editingRowId,
		setEditingRowId,
		updateRow: (id, updated) => {
			const detail = details.find((d) => d.id === id);
			if (!detail) return;

			const payload = {
				id,
				amount: updated.amount ?? detail.amount,
				unitPrice: updated.unitPrice ?? detail.unitPrice,
				subTotalPrice: updated.subTotalPrice ?? detail.subTotalPrice,
				tax: updated.tax ?? detail.tax,
				currency: detail.currency,
				itemId: detail.item.id,
			};

			mutation.mutate(payload);
		},
	});
	const fullReceiptDetailColumns = getFullReceiptDetailColumns({
		baseColumnDef: baseReceiptDetailColumns,
		onEdit: () => {},
		onDelete: () => {
			alert("削除");
		},
	});

	const table = useReactTable({
		data: details,
		columns: fullReceiptDetailColumns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
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
		</table>
	);
}
