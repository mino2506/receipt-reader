"use client";

import React from "react";
import { useState } from "react";

import {
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { receiptColumns } from "./columns";

import type { ReceiptWithItemDetails } from "@/lib/api/receipt/get.schema";

import ReceiptDetailsTable from "./ReceiptDetailsTable";

export default function ReceiptTable({
	data,
}: {
	data: ReceiptWithItemDetails[];
}) {
	const [expanded, setExpanded] = useState({});

	const table = useReactTable({
		data,
		columns: receiptColumns,
		state: { expanded },
		onExpandedChange: setExpanded,
		getCoreRowModel: getCoreRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getRowCanExpand: () => true, // すべての行を展開できる
	});

	return (
		<table className="table-auto border-separate border-spacing-0 w-full text-sm">
			<thead className="">
				{table.getHeaderGroups().map((headerGroup) => (
					<tr key={headerGroup.id} className="border">
						<th className="border px-2 py-1 bg-gray-200">actions</th>
						{headerGroup.headers.map((header) => (
							<th
								key={header.id}
								className="border border-l-0 px-2 py-1 bg-gray-200"
							>
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
						<tr className=" border border-t-0 bg-amber-800 ">
							<td className=" border border-t-0 flex items-center justify-center">
								<div className="h-8 px-1 py-1">
									<button
										type="button"
										onClick={row.getToggleExpandedHandler()}
										className={`flex justify-center items-center text-lg w-full h-full aspect-square bg-black  ${row.getIsExpanded() ? "text-red-700" : "text-blue-700"}`}
									>
										{row.getIsExpanded() ? "-" : "+"}
									</button>
								</div>
								<div className="h-8 px-1 py-1">
									<button
										type="button"
										onClick={row.getToggleExpandedHandler()}
										className={`flex justify-center items-center text-lg w-full h-full aspect-square bg-black  ${row.getIsExpanded() ? "text-red-700" : "text-blue-700"}`}
									>
										{row.getIsExpanded() ? ">" : "<"}
									</button>
								</div>
							</td>
							{row.getVisibleCells().map((cell) => (
								<td
									key={cell.id}
									className="border border-t-0 border-l-0 px-1.5 py-1"
								>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
						{row.getIsExpanded() && (
							<tr>
								<td colSpan={row.getVisibleCells().length + 1}>
									<div className="p-2 bg-red-400">
										<ReceiptDetailsTable
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
