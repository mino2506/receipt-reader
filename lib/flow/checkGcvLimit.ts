import { getGcvUsageCount } from "@/lib/_domain/googleCloudVision/getGcvUsageCount";
import type { GcvLimitExceededError } from "@/lib/error/googleCloudVision.error";
import type { GetActiveSubscriptionError } from "@/lib/error/subscription.error";
import { getActiveSubscription } from "@/lib/flow/getActiveSubscription";
import type { UserId } from "@/lib/model/user/user.schema";
import type { PrismaService } from "@/lib/services/prismaService";
import { Effect } from "effect";

export const checkGcvLimit = (
	userId: UserId,
): Effect.Effect<
	void,
	GcvLimitExceededError | GetActiveSubscriptionError,
	PrismaService
> =>
	Effect.gen(function* (_) {
		const subscription = yield* _(getActiveSubscription(userId));
		const usageCount = yield* _(getGcvUsageCount(userId));

		const max = subscription.tier.maxOcrCalls ?? Number.POSITIVE_INFINITY;

		if (usageCount >= max) {
			return yield* _(
				Effect.fail({
					_tag: "GcvLimitExceededError" as const,
					message: `今月のOCR使用回数 ${usageCount} が上限 ${max} を超えています`,
					limit: max,
				} satisfies GcvLimitExceededError),
			);
		}
	});
