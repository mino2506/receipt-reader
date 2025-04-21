import type { ColumnDef, Row } from "@tanstack/react-table";

import type { ReceiptDetailWithItem } from "@/lib/api/receipt/get.schema";

interface Props<T> {
	baseColumnDef: ColumnDef<T>[];
	onEdit: (row: T) => void;
	onDelete: (row: T) => void;
}

export function getFullColumnDef<T>({
	baseColumnDef,
	onEdit,
	onDelete,
}: Props<T>): ColumnDef<T>[] {
	return [
		...baseColumnDef,
		{
			header: "操作",
			id: "actions",
			cell: ({ row }) => (
				<div className="flex gap-1 justify-center">
					<button
						type="button"
						className="text-blue-600 hover:underline"
						onClick={() => onEdit(row.original)}
					>
						編集
					</button>
					<button
						type="button"
						className="text-red-600 hover:underline"
						onClick={() => onDelete(row.original)}
					>
						削除
					</button>
				</div>
			),
		},
	];
}

export const getFullReceiptDetailColumns = ({
	baseColumnDef,
	onEdit,
	onDelete,
}: Props<ReceiptDetailWithItem>) => {
	return getFullColumnDef<ReceiptDetailWithItem>({
		baseColumnDef,
		onEdit,
		onDelete,
	});
};
