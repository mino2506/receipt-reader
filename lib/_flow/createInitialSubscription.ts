import { parseSubscriptionHistory } from "@/lib/_domain/subscription/parseSubscriptionHistory";
import { parseTier } from "@/lib/_domain/subscription/parseTier";
import type { CreateInitialSubscriptionError } from "@/lib/_error/subscription.error";
import type { SubscriptionHistory } from "@/lib/_model/user/subscriptionHistory.schema";
import type { UserId } from "@/lib/_model/user/user.schema";
import type { PrismaService } from "@/lib/_services/prismaService";
import { createSubscription } from "@/lib/_services/subscription/createSubscription";
import { fetchDefaultTier } from "@/lib/_services/subscription/fetchDefaultTier";
import { Effect, pipe } from "effect";

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
