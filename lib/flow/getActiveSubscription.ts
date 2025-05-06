import { formatSubscriptionResult } from "@/lib/_domain/subscription/formatSubscriptionResult";
import { parseSubscriptionHistory } from "@/lib/_domain/subscription/parseSubscriptionHistory";
import type {
	GetActiveSubscriptionError,
	SubscriptionResult,
} from "@/lib/error/subscription.error";
import type { UserId } from "@/lib/model/user/user.schema";
import type { PrismaService } from "@/lib/services/prismaService";
import { fetchActiveSubscription } from "@/lib/services/subscription/fetchActiveSubscription";
import { Effect, pipe } from "effect";

export const getActiveSubscription = (
	userId: UserId,
): Effect.Effect<
	SubscriptionResult,
	GetActiveSubscriptionError,
	PrismaService
> =>
	pipe(
		fetchActiveSubscription(userId),
		Effect.flatMap(parseSubscriptionHistory),
		Effect.flatMap(formatSubscriptionResult),
	);
