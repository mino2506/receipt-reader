import { prisma } from "@/lib/prisma/client";

async function main() {
	const receipts = await prisma.receipt.findMany({
		include: { receiptDetails: true },
	});

	const allCount = receipts.length;

	for (const receipt of receipts) {
		const sortedDetails = receipt.receiptDetails.sort(
			(a, b) =>
				new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
		);
		const ditailCount = sortedDetails.length;

		for (const [index, sortedDetail] of sortedDetails.entries()) {
			console.log(
				`all: ${allCount} / detail: ${ditailCount} /index + 1: ${index + 1} /id: ${sortedDetail.id}`,
			);
			await prisma.receiptDetail.update({
				where: { id: sortedDetail.id },
				data: { order: index + 1 },
			});
		}
	}
}

main().catch(console.error);
