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

export function ReceiptTable({
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
		<table className="table-auto border-collapse w-full text-sm">
			<thead>
				{table.getHeaderGroups().map((headerGroup) => (
					<tr key={headerGroup.id}>
						<th className="border px-2 py-1 bg-gray-200">+</th>
						{headerGroup.headers.map((header) => (
							<th key={header.id} className="border px-2 py-1 bg-gray-200">
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
						<tr className=" border bg-amber-800">
							<td className="flex items-stretch px-1 py-1">
								<button
									type="button"
									onClick={row.getToggleExpandedHandler()}
									className={`flex justify-center items-center text-lg w-full h-full bg-black  ${row.getIsExpanded() ? "text-red-700" : "text-blue-700"}`}
								>
									{row.getIsExpanded() ? "-" : "+"}
								</button>
							</td>
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="border px-1.5 py-1">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
						{row.getIsExpanded() && (
							<tr>
								<td colSpan={row.getVisibleCells().length}>
									<ReceiptDetailsTable details={row.original.details} />
								</td>
							</tr>
						)}
					</React.Fragment>
				))}
			</tbody>
		</table>
	);
}

import type { ReceiptDetailWithItem } from "@/lib/api/receipt/get.schema";

export function ReceiptDetailsTable({
	details,
	pageSize = 5,
}: {
	details: ReceiptDetailWithItem[];
	pageSize?: number;
}) {
	const [page, setPage] = useState(0);
	const pageCount = Math.ceil(details.length / pageSize);

	const currentPageItems = details.slice(
		page * pageSize,
		(page + 1) * pageSize,
	);

	return (
		<div className="p-2">
			<p className="text-sm font-semibold mb-1">
				🧾 レシート詳細（{details.length} 件中 {currentPageItems.length}{" "}
				件表示）
			</p>
			<table className="w-full text-xs border">
				<thead>
					<tr>
						<th>商品名</th>
						<th>数量</th>
						<th>単価</th>
						<th>小計</th>
					</tr>
				</thead>
				<tbody>
					{currentPageItems.map((detail) => (
						<tr key={detail.id}>
							<td className="border px-2">{detail.item.rawName}</td>
							<td className="border px-2">{detail.amount}</td>
							<td className="border px-2">{detail.unitPrice}</td>
							<td className="border px-2">{detail.subTotalPrice}</td>
						</tr>
					))}
				</tbody>
			</table>
			<div className="flex gap-2 justify-end mt-1 text-xs">
				<button
					type="button"
					disabled={page === 0}
					onClick={() => setPage((p) => p - 1)}
					className="px-2 py-1 bg-gray-300 rounded disabled:opacity-50"
				>
					← 前
				</button>
				<span>
					{page + 1} / {pageCount}
				</span>
				<button
					type="button"
					disabled={page >= pageCount - 1}
					onClick={() => setPage((p) => p + 1)}
					className="px-2 py-1 bg-gray-300 rounded disabled:opacity-50"
				>
					次 →
				</button>
			</div>
		</div>
	);
}
