/* eslint-disable @next/next/no-sync-params */

import { prisma } from "@/lib/prisma/client";

import {
	type ReceiptWithItemDetails,
	ReceiptWithItemDetailsSchema,
} from "@/lib/api/receipt/get.schema";
import { getReceiptDetailsById } from "@/lib/api/receipt/server/getReceiptDetailsById";
import ReceiptDetail from "./ReceiptDetail";

export default async function ReceiptPage({
	params,
}: { params: { id: string } }) {
	const receiptIdByUrl = params.id;
	const fetched = await getReceiptDetailsById(receiptIdByUrl);

	if (!fetched.success) return <div>データの取得に失敗しました</div>;

	const receipt = fetched.data;

	return (
		<div>
			<h1>{`レシートID: ${receipt.id}`}</h1>
			<table className="w-full justify-center items-center">
				<thead>
					<tr>
						<th className="border">店舗名</th>
						<th className="border">明細数</th>
						<th className="border">合計</th>
						<th className="border">日付</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td className="border">
							{receipt.store?.normalized ?? receipt.store?.rawName}
						</td>
						<td className="border">{receipt.details.length}</td>
						<td className="border">{receipt.totalPrice}</td>
						<td className="border">{receipt.date}</td>
					</tr>
				</tbody>
			</table>
			<ReceiptDetail details={receipt.details} />
		</div>
	);
}
