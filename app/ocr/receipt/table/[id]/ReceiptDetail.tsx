import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";

import { fullReceiptDetailColumns } from "@/app/ocr/receipt/table/[id]/receiptDetail.full.columns";
import type { ReceiptDetailWithItem } from "@/lib/api/receipt/get.schema";

export default function ReceiptDetailsTable({
	details,
}: { details: ReceiptDetailWithItem[] }) {
	const table = useReactTable({
		data: details,
		columns: fullReceiptDetailColumns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<table className="w-full table-auto border mt-4">
			<thead>
				{table.getHeaderGroups().map((headerGroup) => (
					<tr key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<th key={header.id} className="border px-2 py-1 bg-gray-200">
								{header.isPlaceholder
									? null
									: flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
							</th>
						))}
					</tr>
				))}
			</thead>
			<tbody>
				{table.getRowModel().rows.map((row) => (
					<tr key={row.id}>
						{row.getVisibleCells().map((cell) => (
							<td key={cell.id} className="border px-2 py-1">
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}
