import { getGcvUsageCount } from "@/lib/_domain/googleCloudVision/getGcvUsageCount";
import type { GcvLimitExceededError } from "@/lib/_error/googleCloudVision.error";
import type { GetActiveSubscriptionError } from "@/lib/_error/subscription.error";
import { getActiveSubscription } from "@/lib/_flow/getActiveSubscription";
import type { UserId } from "@/lib/_model/user/user.schema";
import type { PrismaService } from "@/lib/_services/prismaService";
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
