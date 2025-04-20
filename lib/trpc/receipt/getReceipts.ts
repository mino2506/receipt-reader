import { prisma } from "@/lib/prisma/client";
import { z } from "zod";
import { protectedProcedure } from "../core";

import { ReceiptWithItemDetailsArraySchema } from "@/lib/api/receipt/get.schema";

export const getReceipts = protectedProcedure
	.input(
		z.object({
			cursor: z.string().uuid().optional(),
			limit: z.number().min(1).max(100).optional(),
		}),
	)
	.query(async ({ ctx, input }) => {
		const DEFAULT_LIMIT = 10;

		const limit = input.limit ?? DEFAULT_LIMIT;
		const plusOneLimit = limit + 1;
		const lastCursor = input.cursor;

		const receipts = await prisma.receipt.findMany({
			where: { userId: ctx.user.id },
			orderBy: { createdAt: "desc" },
			take: plusOneLimit,
			include: {
				receiptDetails: {
					include: {
						item: true,
					},
					orderBy: {
						order: "asc",
					},
				},
			},
			...(lastCursor && {
				cursor: {
					id: lastCursor,
				},
				skip: 1,
			}),
		});

		const hasMore = receipts.length > limit;
		const returnReceipts = hasMore ? receipts.slice(0, -1) : receipts;
		// 返しページの最終行のID
		const nextCursor = hasMore
			? returnReceipts[returnReceipts.length - 1]?.id
			: undefined;

		const formattedReceipts =
			ReceiptWithItemDetailsArraySchema.parse(returnReceipts);

		return {
			receipts: formattedReceipts,
			nextCursor,
		};
	});
