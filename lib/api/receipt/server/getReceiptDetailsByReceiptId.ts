import { prisma } from "@/lib/prisma";

/**
 * 指定したレシートIDに紐づく明細を全件取得する
 *
 * @param receiptId - ReceiptテーブルのID(UUID)
 * @returns ReceiptDetail[] 配列（receiptId に一致する全明細）
 */
export async function getReceiptDetailsByReceiptId(receiptId: string) {
	return await prisma.receiptDetail.findMany({
		where: { receiptId },
		include: {
			item: true, // optional: item情報も同時に欲しければ
		},
		orderBy: { createdAt: "asc" }, // 明細は日付順で並べるのが一般的
	});
}
