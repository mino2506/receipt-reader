import { toPrismaTaggedError } from "@/lib/domain/subscription/formatSubscriptionResult";
import type { GetActiveSubscriptionError } from "@/lib/error/subscription.error";
import type { UserId } from "@/lib/model/user/user.schema";
import { PrismaService } from "@/lib/services/prismaService";
import { Effect } from "effect";

export const fetchActiveSubscription = (
	userId: UserId,
): Effect.Effect<unknown, GetActiveSubscriptionError, PrismaService> =>
	Effect.gen(function* (_) {
		const { prisma } = yield* _(PrismaService);
		const result = yield* _(
			Effect.tryPromise({
				try: () =>
					prisma.subscriptionHistory.findFirstOrThrow({
						where: {
							userId,
							startedAt: { lte: new Date() },
							OR: [{ endedAt: null }, { endedAt: { gt: new Date() } }],
						},
						orderBy: { startedAt: "desc" },
						include: { tier: true },
					}),
				catch: toPrismaTaggedError,
			}),
		);
		return result;
	});
