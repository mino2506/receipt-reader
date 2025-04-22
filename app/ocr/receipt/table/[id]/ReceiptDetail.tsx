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
import { CategoryEnum } from "@/lib/api/receipt/common.schema";
import {
	ReceiptDetailWithItemSchema,
	type ReceiptWithItemDetails,
} from "@/lib/api/receipt/get.schema";
import type { UpdateReceiptDetailInput } from "@/lib/api/receipt/update.schema";
import { update } from "lodash";

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

			const item = updated.item ?? detail.item;
			const amount = updated.amount ?? detail.amount;
			const unitPrice = updated.unitPrice ?? detail.unitPrice;
			const subTotalPrice = updated.subTotalPrice ?? detail.subTotalPrice;
			const tax = updated.tax ?? detail.tax;

			const REDUCED_TAX_RATE = 0.08;
			const STANDARD_TAX_RATE = 0.1;
			const REDUCED_TAXES = ["food", "drink", "snacks"];
			const isReducedTax = REDUCED_TAXES.includes(item.category);
			const calcTax = (subtotal: number, isReduced: boolean) => {
				const rate = isReduced ? REDUCED_TAX_RATE : STANDARD_TAX_RATE;
				return Math.round(subtotal - subtotal * (1 / (1 + rate)));
			};

			const draft = { ...item, amount, unitPrice, subTotalPrice, tax };
			if (updated.unitPrice) {
				draft.subTotalPrice = updated.unitPrice * amount;
				draft.tax = calcTax(draft.subTotalPrice, isReducedTax);
			}
			if (updated.subTotalPrice) {
				draft.unitPrice = updated.subTotalPrice / amount;
				draft.tax = calcTax(updated.subTotalPrice, isReducedTax);
			}
			if (updated.amount) {
				draft.subTotalPrice = updated.amount * unitPrice;
				draft.tax = calcTax(draft.subTotalPrice, isReducedTax);
			}

			const payload = {
				id,
				amount: draft.amount,
				unitPrice: draft.unitPrice,
				subTotalPrice: draft.subTotalPrice,
				tax: draft.tax,

				currency: detail.currency,
				itemId: updated.item?.id ?? detail.item.id,
				order: detail.order,
			};

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
			</table>
			{!hasDetails && (
				<div>
					<span className="text-red-700">明細がありません</span>
				</div>
			)}
		</div>
	);
}

function buildUpdatePayload(
	detail: ReceiptDetail,
	updated: Partial<ReceiptWithItemDetails>,
): UpdateReceiptDetailInput {
	// この中で補完・税計算まで完了させて返す
}
