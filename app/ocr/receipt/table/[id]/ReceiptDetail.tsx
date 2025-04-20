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
import type { ReceiptDetailWithItem } from "@/lib/api/receipt/get.schema";

export default function ReceiptDetail({
	details,
}: { details: ReceiptDetailWithItem[] }) {
	const [editingRowId, setEditingRowId] = useState<string | null>(null);
	const [tempData, setTempData] = useState<Record<string, number | string>>({});

	const mutation = trpc.receipt.updateDetail.useMutation({
		onSuccess: (data) => {
			console.log("更新完了:", data);
		},
		onError: (err) => {
			console.error("更新失敗:", err.message);
		},
	});

	const baseReceiptDetailColumns = getReceiptDetailColumns({
		editingRowId,
		setEditingRowId,
		updateRow: (id, updated) => {
			console.log("更新", id, updated);
			// mutate or setState here if needed
			setEditingRowId(null);
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
