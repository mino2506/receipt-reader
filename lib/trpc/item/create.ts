import { prisma } from "@/lib/prisma/client";
import { protectedProcedure } from "../core";

import { CreateItemSchema } from "@/lib/api/receipt";

export const create = protectedProcedure
	.input(CreateItemSchema.pick({ rawName: true, category: true }))
	.mutation(async ({ input }) => {
		const item = await prisma.item.create({
			data: {
				rawName: input.rawName,
				category: input.category,
			},
		});

		return item;
	});
