import { prisma } from "@/lib/prisma";

import type { DeleteReceiptDetail } from "@/lib/api/receipt/delete.schema";

export async function deleteReceiptDetail(
	input: DeleteReceiptDetail,
	userId: string,
) {
	const { id } = input;

	const deleted = await prisma.receiptDetail.update({
		where: { id, receipt: { userId } },
		data: { deletedAt: new Date() },
	});

	return deleted;
}
