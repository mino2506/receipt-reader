import { formatSubscriptionResult } from "@/lib/_domain/subscription/formatSubscriptionResult";
import { parseSubscriptionHistory } from "@/lib/_domain/subscription/parseSubscriptionHistory";
import type {
	GetActiveSubscriptionError,
	SubscriptionResult,
} from "@/lib/_error/subscription.error";
import type { UserId } from "@/lib/_model/user/user.schema";
import type { PrismaService } from "@/lib/_services/prismaService";
import { fetchActiveSubscription } from "@/lib/_services/subscription/fetchActiveSubscription";
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
