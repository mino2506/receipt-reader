import type { GetActiveSubscriptionError } from "@/lib/error/subscription.error";
import { createInitialSubscription } from "@/lib/flow/createInitialSubscription";
import { getActiveSubscription } from "@/lib/flow/getActiveSubscription";
import type { UserId } from "@/lib/model/user/user.schema";
import type { PrismaService } from "@/lib/services/prismaService";
import { hasTag } from "@/lib/utils/match";
import { Effect } from "effect";
import { Option } from "effect";

const isRecordNotFound = hasTag("RecordNotFound");

export const ensureSubscriptionExists = (
	userId: UserId,
): Effect.Effect<void, GetActiveSubscriptionError, PrismaService> =>
	Effect.gen(function* (_) {
		const existing = yield* _(
			getActiveSubscription(userId),
			Effect.map(() => Option.some(true)),
			Effect.catchAll((err) =>
				isRecordNotFound(err)
					? Effect.succeed(Option.none())
					: Effect.fail(err),
			),
		);

		if (Option.isNone(existing)) {
			yield* _(createInitialSubscription(userId));
		}
	});
