import { prisma } from "@/lib/prisma";

export async function selectReceiptWithDetails(
	receiptId: string,
	userId: string,
) {
	return await prisma.receipt.findUnique({
		where: { id: receiptId, userId: userId },
		include: {
			receiptDetails: {
				include: {
					item: true,
				},
			},
		},
	});
}
