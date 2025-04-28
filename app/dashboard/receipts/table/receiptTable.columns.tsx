import { fomatDateString, formatDate } from "@/utils/date"; // 日付整形用関数
import type { ColumnDef } from "@tanstack/react-table";

import type { ReceiptWithItemDetails } from "@/lib/api/receipt/get.schema";

export const receiptColumns: ColumnDef<ReceiptWithItemDetails>[] = [
	{
		id: "updatedAt",
		header: () => (
			<div className="hidden lg:flex text-center p-1 text-gray-600 text-md tracking-wider uppercase">
				更新日時
			</div>
		),
		accessorFn: (row) => row.updatedAt,
		cell: ({ getValue }) => (
			<div className="hidden lg:flex text-center text-sm w-24">
				{fomatDateString(getValue<string>())}
			</div>
		),
	},
	{
		id: "date",
		header: () => (
			<div className="text-center p-1 text-gray-600 text-md tracking-wider uppercase">
				購入日時
			</div>
		),
		accessorFn: (row) => row.date ?? "",
		cell: ({ getValue }) => (
			<div className="text-center text-sm w-24 ">
				{fomatDateString(getValue<string>())}
			</div>
		),
	},
	{
		id: "storeName",
		header: () => (
			<div className="text-center p-1 text-gray-600 text-md tracking-wider uppercase">
				店名
			</div>
		),
		accessorFn: (row) => row.store?.normalized ?? row.store?.rawName,
		cell: ({ getValue }) => (
			<div className="w-3xs lg:w-xs px-2 text-sm">{getValue<string>()}</div>
		),
	},
	{
		id: "detailsCount",
		header: () => (
			<div className="text-center p-1 text-gray-600 text-md tracking-wider uppercase">
				明細数
			</div>
		),
		accessorFn: (row) => row.details.length,
		cell: ({ getValue }) => (
			<div className="w-16 px-2 text-right text-sm">{getValue<number>()}</div>
		),
	},
	{
		id: "totalPrice",
		header: () => (
			<div className="text-center p-1 text-gray-600 text-md tracking-wider uppercase">
				合計
			</div>
		),
		accessorKey: "totalPrice",
		cell: ({ getValue }) => (
			<div className="w-16 px-2 text-right text-sm">{getValue<number>()}</div>
		),
	},
];
