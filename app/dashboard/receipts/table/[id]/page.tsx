/* eslint-disable @next/next/no-sync-params */

import { z } from "zod";

import { getReceiptDetailsById } from "@/lib/api/receipt/server/getReceiptDetailsById";
import { fomatDateString } from "@/utils/date";
import ReceiptDetail from "./ReceiptDetail";

const ReceiptIdSchema = z.string().uuid();

export default async function ReceiptPage({
	params,
}: { params: { id: string } }) {
	const receiptIdByUrl = await params.id;
	const parsedReceiptId = ReceiptIdSchema.safeParse(receiptIdByUrl);
	if (!parsedReceiptId.success) {
		return <div>URLが不正です</div>;
	}
	const fetched = await getReceiptDetailsById(parsedReceiptId.data);

	if (!fetched.success) return <div>データの取得に失敗しました</div>;

	const receipt = fetched.data;
	return (
		<div className="w-full max-w-screen-md mx-auto p-4">
			<table className="w-full justify-center items-center">
				<thead>
					<tr className="border px-2 py-1 bg-gray-200 text-gray-600">
						<th className="border px-2 py-1">店舗名</th>
						<th className="border px-2 py-1">明細数</th>
						<th className="border px-2 py-1">合計</th>
						<th className="border px-2 py-1">日付</th>
					</tr>
				</thead>
				<tbody>
					<tr className="border px-2 py-1">
						<td className="border px-2 py-1">
							{receipt.store?.normalized ?? receipt.store?.rawName}
						</td>
						<td className="border px-2 py-1">{receipt.details.length}</td>
						<td className="border px-2 py-1">{receipt.totalPrice}</td>
						<td className="border px-2 py-1">
							{fomatDateString(receipt.date ?? "")}
						</td>
					</tr>
				</tbody>
			</table>
			<div className="text-end text-sm text-muted-foreground">{`Receipt-Id: ${receipt.id}`}</div>
			<ReceiptDetail receipt={receipt} />
		</div>
	);
}
