import type { ColumnDef, Row } from "@tanstack/react-table";

import type { ReceiptDetailWithItem } from "@/lib/api/receipt/get.schema";
import { baseReceiptDetailColumns } from "./receiptDetail.columns";

export const fullReceiptDetailColumns = [
	...baseReceiptDetailColumns,
	{
		header: "操作",
		id: "actions",
		cell: ({ row }) => <EditDeleteButtons row={row} />,
	},
];

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function EditDeleteButtons({ row }: { row: any }) {
	return (
		<div className="flex gap-1 justify-center">
			<button type="button" className="text-blue-600 hover:underline">
				編集
			</button>
			<button type="button" className="text-red-600 hover:underline">
				削除
			</button>
		</div>
	);
}
