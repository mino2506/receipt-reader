import { fomatDateString, formatDate } from "@/utils/date"; // 日付整形用関数
import type { ColumnDef } from "@tanstack/react-table";

import type { ReceiptWithItemDetails } from "@/lib/api/receipt/get.schema";

export const receiptColumns: ColumnDef<ReceiptWithItemDetails>[] = [
	{
		header: "ID",
		accessorKey: "id",
	},
	{
		header: "合計金額",
		accessorKey: "totalPrice",
	},
	{
		header: "更新日時",
		cell: ({ row }) => fomatDateString(row.original.updatedAt),
	},
	{
		header: "詳細件数",
		cell: ({ row }) => row.original.details.length,
	},
];
