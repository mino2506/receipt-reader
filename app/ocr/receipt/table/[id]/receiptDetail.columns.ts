import type { ColumnDef } from "@tanstack/react-table";

import type { ReceiptDetailWithItem } from "@/lib/api/receipt/get.schema";

export const baseReceiptDetailColumns: ColumnDef<ReceiptDetailWithItem>[] = [
	{
		header: "商品名",
		accessorFn: (row) => row.item.normalized ?? row.item.rawName,
	},
	{ header: "数量", accessorKey: "amount" },
	{ header: "単価", accessorKey: "unitPrice" },
	{ header: "小計", accessorKey: "subTotalPrice" },
	{ header: "税", accessorKey: "tax" },
	{ header: "カテゴリ", accessorFn: (row) => row.item.category },
] as const;
