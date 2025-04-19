import { useState } from "react";

import type { ReceiptDetailWithItem } from "@/lib/api/receipt/get.schema";

export default function ReceiptDetailPreviewTable({
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
		<div className="flex flex-col items-stretch w-full p-1">
			<p className="text-sm font-semibold mb-1">
				🧾 レシート詳細（{details.length} 件中 {currentPageItems.length}{" "}
				件表示）
			</p>
			<table className="w-full text-xs border">
				<thead>
					<tr>
						<th className="border p-1">商品名</th>
						<th className="border p-1">数量</th>
						<th className="border p-1">単価</th>
						<th className="border p-1">小計</th>
						<th className="border p-1">カテゴリー</th>
					</tr>
				</thead>
				<tbody>
					{currentPageItems.map((detail) => (
						<tr key={detail.id}>
							<td className="border px-2 py-1">{detail.item.rawName}</td>
							<td className="border px-2 py-1">{detail.amount}</td>
							<td className="border px-2 py-1">{detail.unitPrice}</td>
							<td className="border px-2 py-1">{detail.subTotalPrice}</td>
							<td className="border px-2 py-1">{detail.item.category}</td>
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
