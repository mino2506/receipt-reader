import { prisma } from "@/lib/prisma/client";
import { protectedProcedure } from "../core";

import { CreateReceiptDetailSchema } from "@/lib/api/receipt/create.schema";

export const createDetail = protectedProcedure
	.input(CreateReceiptDetailSchema)
	.mutation(async ({ input }) => {
		return await prisma.receiptDetail.create({
			data: {
				receiptId: input.receiptId,
				itemId: input.itemId,
				amount: input.amount,
				unitPrice: input.unitPrice,
				subTotalPrice: input.subTotalPrice,
				tax: input.tax,
				currency: input.currency,
				order: input.order,
			},
		});
	});
