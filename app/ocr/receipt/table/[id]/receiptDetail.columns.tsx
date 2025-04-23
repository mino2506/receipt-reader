import type { ColumnDef } from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { EditableNumberCell } from "@/app/components/receipt/EditableNumberCell";
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
			id: "order",
			header: () => (
				<div className="text-center p-1 text-gray-600 text-md tracking-wider uppercase">
					順番
				</div>
			),
			accessorKey: "order",
			cell: ({ getValue }) => (
				<div className="text-center text-sm w-[48px]">{getValue<number>()}</div>
			),
		},
		{
			id: "item",
			header: () => (
				<div className="text-left px-2 py-1 text-gray-600 text-md tracking-wider uppercase">
					商品名
				</div>
			),
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
					<div
						className="flex items-center w-full h-13 px-2 py-1 text-sm text-gray-800 cursor-pointer"
						onClick={() => setEditingRowId(row.original.id)}
					>
						{getValue<number>()}
					</div>
				),
		},
		{
			id: "category",
			header: () => (
				<div className="text-center p-1 text-gray-600 text-md text-nowrap tracking-wider uppercase">
					分類
				</div>
			),
			accessorFn: (row) => CATEGORY_LABELS[row.item.category],
			cell: ({ getValue }) => (
				<div className="flex items-center text-sm text-nowrap h-13 py-1 px-2">
					{getValue<string>()}
				</div>
			),
		},
		{
			id: "amount",
			header: () => (
				<div className="text-center p-1 text-gray-600 text-md tracking-wider uppercase">
					数量
				</div>
			),
			accessorKey: "amount",
			cell: ({ row, getValue }) => {
				const isEditing = editingRowId === row.original.id;

				return (
					<EditableNumberCell
						value={getValue<number>()}
						isEditing={isEditing}
						onSubmit={(value) => updateRow(row.original.id, { amount: value })}
						onEditStart={() => setEditingRowId(row.original.id)}
						className=" h-12"
					/>
				);
			},
		},
		{
			id: "unitPrice",
			header: () => (
				<div className="text-center p-1 text-gray-600 text-md tracking-wider uppercase">
					単価
				</div>
			),
			accessorKey: "unitPrice",
			cell: ({ row, getValue }) => {
				const isEditing = editingRowId === row.original.id;

				return (
					<EditableNumberCell
						value={getValue<number>()}
						isEditing={isEditing}
						onSubmit={(value) =>
							updateRow(row.original.id, { unitPrice: value })
						}
						onEditStart={() => setEditingRowId(row.original.id)}
						className=" h-12"
					/>
				);
			},
		},
		{
			id: "subTotalPrice",

			header: () => (
				<div className="text-center p-1 text-gray-600 text-md tracking-wider uppercase">
					小計
				</div>
			),
			accessorKey: "subTotalPrice",
			cell: ({ row, getValue }) => {
				const isEditing = editingRowId === row.original.id;

				return (
					<EditableNumberCell
						value={getValue<number>()}
						isEditing={isEditing}
						onSubmit={(value) =>
							updateRow(row.original.id, { subTotalPrice: value })
						}
						onEditStart={() => setEditingRowId(row.original.id)}
						className=" h-12"
					/>
				);
			},
		},
		{
			id: "tax",
			header: () => (
				<div className="text-center p-1 text-gray-600 text-md tracking-wider uppercase">
					税
				</div>
			),
			accessorKey: "tax",
			cell: ({ getValue }) => (
				<div className="text-right text-sm py-1 px-2">{getValue<number>()}</div>
			),
		},
		{
			id: "currency",
			header: () => (
				<div className="text-center p-1 text-gray-600 text-md tracking-wider uppercase">
					通貨
				</div>
			),
			accessorFn: (row) => CURRENCY_LABELS[row.currency],
			cell: ({ getValue }) => (
				<div className="text-center text-sm py-1 px-2">
					{getValue<string>()}
				</div>
			),
		},
	];
}
