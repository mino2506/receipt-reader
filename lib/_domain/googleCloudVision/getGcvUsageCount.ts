import { toPrismaTaggedError } from "@/lib/_domain/prisma/toPrismaTaggedError";
import type { PrismaTaggedError } from "@/lib/error/prisma.error";
import type { UserId } from "@/lib/model/user/user.schema";
import { PrismaService } from "@/lib/services/prismaService";
import { Effect } from "effect";

export const getGcvUsageCount = (
	userId: UserId,
): Effect.Effect<number, PrismaTaggedError, PrismaService> =>
	Effect.gen(function* (_) {
		const { prisma } = yield* _(PrismaService);
		const startOfMonth = new Date(
			new Date().getFullYear(),
			new Date().getMonth(),
			1,
		);

		const count = yield* _(
			Effect.tryPromise({
				try: () =>
					prisma.googleCloudVisionUsageLog.count({
						where: {
							userId,
							createdAt: { gte: startOfMonth },
						},
					}),
				catch: toPrismaTaggedError,
			}),
		);

		return count;
	});
