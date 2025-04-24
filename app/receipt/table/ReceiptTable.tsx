"use client";

import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import React from "react";
import { useState } from "react";

import {
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { receiptColumns } from "./receiptTable.columns";

import type { ReceiptWithItemDetails } from "@/lib/api/receipt/get.schema";
import { getFullReceiptColumns } from "./receiptTable.full.columns";

import { ReceiptDetailSubTable } from "./ReceiptDetailSubTable";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export default function ReceiptTable({
	data,
}: {
	data: ReceiptWithItemDetails[];
}) {
	const [expanded, setExpanded] = useState({});

	const router = useRouter();

	const fullReceiptColumns = getFullReceiptColumns({
		baseColumnDef: receiptColumns,
		onEdit: (row) => router.push(`/receipt/table/${row.id}`),
		onDelete: (row) => {},
	});

	const table = useReactTable({
		data,
		columns: fullReceiptColumns,
		state: { expanded },
		onExpandedChange: setExpanded,
		getCoreRowModel: getCoreRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getRowCanExpand: () => true, // すべての行を展開できる
	});

	return (
		<table className="w-full table-auto border mt-4">
			<thead className="">
				{table.getHeaderGroups().map((headerGroup) => (
					<tr key={headerGroup.id} className="">
						<th className="border bg-gray-200">
							<div className="w-12 text-center p-1 text-gray-600 text-md tracking-wider">
								{}
							</div>
						</th>
						{headerGroup.headers.map((header) => (
							<th key={header.id} className="border bg-gray-200">
								{flexRender(
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
					<React.Fragment key={row.id}>
						<tr className="">
							<td className="border">
								<div className="flex justify-center items-center">
									<Button
										variant="ghost"
										onClick={row.getToggleExpandedHandler()}
									>
										<ChevronDown
											className={cn(
												"h-4 w-4 transition-transform duration-200",
												{
													"rotate-0": row.getIsExpanded(),
													"rotate-180": row.getIsExpanded(),
												},
											)}
										/>
									</Button>
								</div>
							</td>
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="border">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
						{row.getIsExpanded() && (
							<tr>
								<td colSpan={row.getVisibleCells().length + 1}>
									<div className="">
										<ReceiptDetailSubTable
											details={row.original.details}
											pageSize={5}
										/>
									</div>
								</td>
							</tr>
						)}
					</React.Fragment>
				))}
			</tbody>
		</table>
	);
}
