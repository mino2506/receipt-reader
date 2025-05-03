import { toUnknownError } from "@/lib/error/common.error";
import type {
	PrismaTaggedError,
	SubscriptionFormatError,
	SubscriptionResult,
} from "@/lib/error/subscription.error";
import type { SubscriptionHistory } from "@/lib/model/user/subscriptionHistory.schema";
import { Prisma } from "@prisma/client";
import { Effect } from "effect";

export const toPrismaTaggedError = (e: unknown): PrismaTaggedError => {
	if (e instanceof Prisma.PrismaClientKnownRequestError) {
		switch (e.code) {
			case "P2002":
				return {
					_tag: "UniqueConstraintViolation",
					target:
						Array.isArray(e.meta?.target) &&
						e.meta?.target.every((v) => typeof v === "string")
							? (e.meta.target as string[])
							: [],
				};
			case "P2003":
				return {
					_tag: "ForeignKeyConstraintViolation",
					field: String(e.meta?.field_name ?? "unknown"),
				};
			case "P2025":
				return {
					_tag: "RecordNotFound",
					model: String(e.meta?.modelName ?? "unknown"),
				};
			default:
				return { _tag: "InternalPrismaError", cause: e };
		}
	}
	if (e instanceof Prisma.PrismaClientValidationError) {
		return {
			_tag: "ValidationError",
			reason: e.message,
		};
	}
	return {
		_tag: "InternalPrismaError",
		cause: e,
	};
};

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
