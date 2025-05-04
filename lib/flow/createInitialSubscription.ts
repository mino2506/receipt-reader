import { parseSubscriptionHistory } from "@/lib/domain/subscription/parseSubscriptionHistory";
import { parseTier } from "@/lib/domain/subscription/parseTier";
import type { CreateInitialSubscriptionError } from "@/lib/error/subscription.error";
import type { SubscriptionHistory } from "@/lib/model/user/subscriptionHistory.schema";
import type { UserId } from "@/lib/model/user/user.schema";
import type { PrismaService } from "@/lib/services/prismaService";
import { createSubscription } from "@/lib/services/subscription/createSubscription";
import { fetchDefaultTier } from "@/lib/services/subscription/fetchDefaultTier";
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
