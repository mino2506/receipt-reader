import { prisma } from "@/lib/prisma";

export async function selectReceiptWithDetails(
	receiptId: string,
	userId: string,
) {
	return await prisma.receipt.findUnique({
		where: { id: receiptId, userId: userId, deletedAt: null },
		include: {
			receiptDetails: {
				where: {
					deletedAt: null,
				},
				include: {
					item: true,
				},
			},
		},
	});
}
