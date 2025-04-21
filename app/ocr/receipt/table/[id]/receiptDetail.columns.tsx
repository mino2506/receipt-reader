import type { ColumnDef } from "@tanstack/react-table";

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
			cell: ({ row, getValue }) =>
				editingRowId === row.original.id ? (
					<input
						type="number"
						className="w-full"
						defaultValue={getValue<number>()}
						onBlur={(e) => {
							updateRow(row.original.id, { tax: Number(e.target.value) });
							setEditingRowId(null);
						}}
					/>
				) : (
					<span
						className="w-full"
						onClick={() => setEditingRowId(row.original.id)}
					>
						{getValue<number>()}
					</span>
				),
		},
		{ header: "カテゴリ", accessorFn: (row) => row.item.category },
	];
}
