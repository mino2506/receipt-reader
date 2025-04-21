import { prisma } from "@/lib/prisma/client";
import { z } from "zod";
import { protectedProcedure } from "../core";

import { ReceiptWithItemDetailsArraySchema } from "@/lib/api/receipt/get.schema";
export const getReceiptById = protectedProcedure
	.input(
		z.object({
			id: z.string().uuid(),
		}),
	)
	.query(async ({ ctx, input }) => {
		return await prisma.receipt.findUnique({
			where: { id: input.id, userId: ctx.user.id, deletedAt: null },
			include: {
				store: true,
				receiptDetails: {
					include: {
						item: true,
					},
				},
			},
		});
	});
