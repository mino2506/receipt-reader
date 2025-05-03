import { toPrismaTaggedError } from "@/lib/domain/subscription/formatSubscriptionResult";
import { parseSubscriptionHistory } from "@/lib/domain/subscription/parseSubscriptionHistory";
import { type UnknownError, toUnknownError } from "@/lib/error/common.error";
import type { PrismaTaggedError } from "@/lib/error/prisma.error";
import type { SubscriptionInitError } from "@/lib/error/subscription.error";
import type { SubscriptionHistory } from "@/lib/model/user/subscriptionHistory.schema";
import {
	type Tier,
	type TierId,
	TierSchema,
} from "@/lib/model/user/tier.schema";
import type { UserId } from "@/lib/model/user/user.schema";
import { PrismaService } from "@/lib/services/prismaService";
import { Effect, pipe } from "effect";
import { ZodError } from "zod";

export const fetchDefaultTier = (): Effect.Effect<
	unknown,
	PrismaTaggedError,
	PrismaService
> =>
	Effect.gen(function* (_) {
		const { prisma } = yield* _(PrismaService);
		const tier = yield* _(
			Effect.tryPromise({
				try: () =>
					prisma.tier.findFirstOrThrow({
						where: { name: "free" },
					}),
				catch: toPrismaTaggedError,
			}),
		);
		return tier;
	});

export type TierValidationError =
	| { _tag: "TierInvalid"; cause: ZodError }
	| UnknownError;

export const toTierValidationError = (e: unknown): TierValidationError => {
	if (e instanceof ZodError) return { _tag: "TierInvalid", cause: e };
	return toUnknownError(e);
};

export const parseTier = (
	tier: unknown,
): Effect.Effect<Tier, TierValidationError, never> =>
	Effect.try({
		try: () => {
			const parsed = TierSchema.safeParse(tier);
			if (!parsed.success) throw parsed.error;
			return parsed.data;
		},
		catch: toTierValidationError,
	});

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
					}),
				catch: toPrismaTaggedError,
			}),
		);
		return subscription;
	});

export type CreateInitialSubscriptionError =
	| PrismaTaggedError
	| TierValidationError;

export const createInitialSubscription = (
	userId: UserId,
): Effect.Effect<
	SubscriptionHistory,
	CreateInitialSubscriptionError,
	PrismaService
> =>
	pipe(
		fetchDefaultTier(),
		Effect.flatMap(parseTier),
		Effect.flatMap((tier) => createSubscription(userId, tier.id)),
		Effect.flatMap(parseSubscriptionHistory),
	);
