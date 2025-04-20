import { prisma } from "@/lib/prisma/client";
import { z } from "zod";
import { protectedProcedure } from "../core";

import { UpdateReceiptDetailSchema } from "@/lib/api/receipt/update.schema";

export const updateDetail = protectedProcedure
	.input(UpdateReceiptDetailSchema)
	.mutation(async ({ input }) => {
		const { id, itemId, ...data } = input;

		const updated = await prisma.receiptDetail.update({
			where: { id },
			data: {
				...data,
				item: {
					connect: { id: itemId },
				},
			},
			include: {
				item: true,
			},
		});

		return updated;
	});
