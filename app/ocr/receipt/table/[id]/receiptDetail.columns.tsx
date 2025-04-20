import type { ColumnDef } from "@tanstack/react-table";

import type { ReceiptDetailWithItem } from "@/lib/api/receipt/get.schema";

function updateRow(id: string, updated: Partial<ReceiptDetailWithItem>) {
	// データ更新処理（setState or mutate）
	console.log("更新", id, updated);
}

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
						defaultValue={getValue<number>()}
						onBlur={(e) => {
							updateRow(row.original.id, { amount: Number(e.target.value) });
							setEditingRowId(null);
						}}
					/>
				) : (
					<span onClick={() => setEditingRowId(row.original.id)}>
						{getValue<number>()}
					</span>
				),
		},
		{ header: "単価", accessorKey: "unitPrice" },
		{ header: "小計", accessorKey: "subTotalPrice" },
		{ header: "税", accessorKey: "tax" },
		{ header: "カテゴリ", accessorFn: (row) => row.item.category },
	];
}
