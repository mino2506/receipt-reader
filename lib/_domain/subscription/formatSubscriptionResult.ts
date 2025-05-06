import { toUnknownError } from "@/lib/error/common.error";
import type {
	SubscriptionFormatError,
	SubscriptionResult,
} from "@/lib/error/subscription.error";
import type { SubscriptionHistory } from "@/lib/model/user/subscriptionHistory.schema";
import { Prisma } from "@prisma/client";
import { Effect } from "effect";

export const formatSubscriptionResult = (
	subscription: SubscriptionHistory,
): Effect.Effect<SubscriptionResult, SubscriptionFormatError, never> =>
	Effect.try({
		try: () => {
			if (!subscription.tier)
				throw {
					_tag: "TierMissing",
					subscriptionId: subscription.id,
				};
			return {
				subscription,
				tier: subscription.tier,
				tierName: subscription.tier.name,
			};
		},
		catch: (e) => {
			if (
				typeof e === "object" &&
				e !== null &&
				"_tag" in e &&
				e._tag === "TierMissing"
			)
				return e as SubscriptionFormatError;
			return toUnknownError(e);
		},
	});
