import { prisma } from "@/lib/prisma/client";
import { z } from "zod";
import { protectedProcedure } from "../core";

import { ItemSchema } from "@/lib/api/receipt/get.schema";

export const search = protectedProcedure
	.input(
		z.object({
			keyword: z.string().min(1),
			limit: z.number().min(1).max(100).optional(),
		}),
	)
	.query(async ({ input }) => {
		const DEFAULT_LIMIT = 10;

		const keywords = input.keyword
			.replace(/　/g, " ")
			.split(" ")
			.map((k) => k.trim())
			.filter((k) => k.length > 0);

		const positiveKeywords = keywords.filter((kw) => !kw.startsWith("-"));
		const negativeKeywords = keywords
			.filter((kw) => kw.startsWith("-") && kw.length > 1)
			.map((kw) => kw.slice(1));

		const positiveConditions = positiveKeywords.map((kw) => ({
			OR: [
				{ rawName: { contains: kw, mode: "insensitive" as const } },
				{ normalized: { contains: kw, mode: "insensitive" as const } },
			],
		}));
		const negativeConditions = negativeKeywords.map((kw) => ({
			AND: [
				{ rawName: { not: { contains: kw, mode: "insensitive" as const } } },
				{
					AND: [
						{ normalized: { not: null } },
						{
							normalized: {
								not: { contains: kw, mode: "insensitive" as const },
							},
						},
					],
				},
			],
		}));

		const items = await prisma.item.findMany({
			where: {
				AND: [...positiveConditions, ...negativeConditions],
			},
			take: input.limit ?? DEFAULT_LIMIT,
		});

		return items.map((item) => ItemSchema.parse(item));
	});
