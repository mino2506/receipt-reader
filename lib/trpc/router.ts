import { protectedProcedure, publicProcedure, router } from "./trpc";

import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

export const appRouter = router({
	getMyReceipts: protectedProcedure
		.input(
			z.object({
				cursor: z.string().uuid().optional(),
				limit: z.number().min(1).max(100).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const limit = input.limit ?? 10;

			return await prisma.receipt.findMany({
				where: { userId: ctx.user.id },
				orderBy: { createdAt: "desc" },
				take: limit,
				include: {
					receiptDetails: {
						include: {
							item: true,
						},
					},
				},
			});
		}),
});

export type AppRouter = typeof appRouter;
