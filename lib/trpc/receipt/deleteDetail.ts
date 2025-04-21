import { prisma } from "@/lib/prisma/client";
import { protectedProcedure } from "../core";

import { DeleteReceiptDetailSchema } from "@/lib/api/receipt/delete.schema";

export const deleteDetail = protectedProcedure
	.input(DeleteReceiptDetailSchema)
	.mutation(async ({ input }) => {
		return await prisma.receiptDetail.update({
			where: { id: input.id },
			data: { deletedAt: new Date() },
		});
	});
