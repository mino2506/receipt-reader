import { toPrismaTaggedError } from "@/lib/_domain/prisma/toPrismaTaggedError";
import type { PrismaTaggedError } from "@/lib/_error/prisma.error";
import type { TierId } from "@/lib/_model/user/tier.schema";
import type { UserId } from "@/lib/_model/user/user.schema";
import { PrismaService } from "@/lib/_services/prismaService";
import { Effect } from "effect";

export const createSubscription = (
	userId: UserId,
	tierId: TierId,
): Effect.Effect<unknown, PrismaTaggedError, PrismaService> =>
	Effect.gen(function* (_) {
		const { prisma } = yield* _(PrismaService);
		const subscription = yield* _(
			Effect.tryPromise({
				try: () =>
					prisma.subscriptionHistory.create({
						data: {
							userId,
							tierId,
							startedAt: new Date(),
						},
						include: {
							tier: true,
						},
					}),
				catch: toPrismaTaggedError,
			}),
		);
		return subscription;
	});
