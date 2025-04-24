import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import type { ReceiptWithItemDetails } from "@/lib/api/receipt/get.schema";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";

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
			id: "actions",
			header: () => (
				<div className="flex justify-center p-1 text-gray-600 text-md tracking-wider uppercase">
					<MoreHorizontal />
				</div>
			),
			cell: ({ row }) => (
				<div className="flex gap-1 justify-between p-1">
					<Button
						variant="outline"
						size="icon"
						onClick={() => onEdit(row.original)}
						className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
					>
						<Pencil className="h-4 w-4" />
						<span className="sr-only">編集</span>
					</Button>

					<Button
						variant="destructive"
						size="icon"
						onClick={() => onDelete(row.original)}
						className="bg-red-500 hover:bg-red-300"
					>
						<Trash className="h-4 w-4" />
						<span className="sr-only">削除</span>
					</Button>
				</div>
			),
		},
	];
}

export const getFullReceiptColumns = ({
	baseColumnDef,
	onEdit,
	onDelete,
}: Props<ReceiptWithItemDetails>) => {
	return getFullColumnDef<ReceiptWithItemDetails>({
		baseColumnDef,
		onEdit,
		onDelete,
	});
};
