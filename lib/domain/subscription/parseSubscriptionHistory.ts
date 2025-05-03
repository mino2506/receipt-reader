import { toUnknownError } from "@/lib/error/common.error";
import type { SubscriptionHistoryValidationError } from "@/lib/error/subscription.error";
import {
	type SubscriptionHistory,
	SubscriptionHistorySchema,
} from "@/lib/model/user/subscriptionHistory.schema";
import { Effect } from "effect";
import { ZodError } from "zod";

export const toSubscriptionHistoryValidationError = (
	e: unknown,
): SubscriptionHistoryValidationError => {
	if (e instanceof ZodError) return { _tag: "TierInvalid", cause: e };
	return toUnknownError(e);
};

export const parseSubscriptionHistory = (
	subscriptionHistory: unknown,
): Effect.Effect<
	SubscriptionHistory,
	SubscriptionHistoryValidationError,
	never
> =>
	Effect.try({
		try: () => {
			const parsed = SubscriptionHistorySchema.safeParse(subscriptionHistory);
			if (!parsed.success) throw parsed.error;
			return parsed.data;
		},
		catch: toSubscriptionHistoryValidationError,
	});
