import { toUnknownError } from "@/lib/_error/common.error";
import type { SubscriptionHistoryValidationError } from "@/lib/_error/subscription.error";
import {
	type SubscriptionHistory,
	SubscriptionHistorySchema,
} from "@/lib/_model/user/subscriptionHistory.schema";
import { Effect } from "effect";
import { ZodError } from "zod";

export const toSubscriptionHistoryParseError = (
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
			console.log(subscriptionHistory);
			const parsed = SubscriptionHistorySchema.safeParse(subscriptionHistory);
			console.log(parsed);
			if (!parsed.success) throw parsed.error;
			return parsed.data;
		},
		catch: toSubscriptionHistoryParseError,
	});
