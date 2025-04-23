import type { ColumnDef } from "@tanstack/react-table";

import { ItemSelector } from "@/app/components/receipt/ItemSelector";
import { CATEGORY_LABELS, CURRENCY_LABELS } from "@/lib/api/receipt";
import type { ReceiptDetailWithItem } from "@/lib/api/receipt/get.schema";

type Props = {
	editingRowId: string | null;
	setEditingRowId: (id: string | null) => void;
	updateRow: (id: string, data: Partial<ReceiptDetailWithItem>) => void;
};

export function getReceiptDetailColumns({
	editingRowId,
	setEditingRowId,
	updateRow,
}: Props): ColumnDef<ReceiptDetailWithItem>[] {
	return [
		{
			header: "順番",
			accessorKey: "order",
		},
		{
			header: "商品名",
			accessorFn: (row) => row.item.normalized ?? row.item.rawName,
			cell: ({ row, getValue }) =>
				editingRowId === row.original.id ? (
					<ItemSelector
						value={row.original.item}
						onSelect={(item) => {
							updateRow(row.original.id, { item: item });
							setEditingRowId(null);
						}}
					/>
				) : (
					// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
					<span
						className="w-full"
						onClick={() => setEditingRowId(row.original.id)}
					>
						{getValue<number>()}
					</span>
				),
		},
		{
			header: "カテゴリ",
			accessorFn: (row) => CATEGORY_LABELS[row.item.category],
		},
		{
			header: "数量",
			accessorKey: "amount",
			cell: ({ row, getValue }) =>
				editingRowId === row.original.id ? (
					<input
						type="number"
						className="w-full"
						defaultValue={getValue<number>()}
						onBlur={(e) => {
							updateRow(row.original.id, { amount: Number(e.target.value) });
							setEditingRowId(null);
						}}
					/>
				) : (
					// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
					<span
						className="w-full"
						onClick={() => setEditingRowId(row.original.id)}
					>
						{getValue<number>()}
					</span>
				),
		},
		{
			header: "単価",
			accessorKey: "unitPrice",
			cell: ({ row, getValue }) =>
				editingRowId === row.original.id ? (
					<input
						type="number"
						className="w-full"
						defaultValue={getValue<number>()}
						onBlur={(e) => {
							updateRow(row.original.id, { unitPrice: Number(e.target.value) });
							setEditingRowId(null);
						}}
					/>
				) : (
					// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
					<span
						className="w-full"
						onClick={() => setEditingRowId(row.original.id)}
					>
						{getValue<number>()}
					</span>
				),
		},
		{
			header: "小計",
			accessorKey: "subTotalPrice",
			cell: ({ row, getValue }) =>
				editingRowId === row.original.id ? (
					<input
						type="number"
						className="w-full"
						defaultValue={getValue<number>()}
						onBlur={(e) => {
							updateRow(row.original.id, {
								subTotalPrice: Number(e.target.value),
							});
							setEditingRowId(null);
						}}
					/>
				) : (
					// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
					<span
						className="w-full"
						onClick={() => setEditingRowId(row.original.id)}
					>
						{getValue<number>()}
					</span>
				),
		},
		{
			header: "税",
			accessorKey: "tax",
		},
		{
			header: "通貨",
			accessorFn: (row) => CURRENCY_LABELS[row.currency],
		},
	];
}
