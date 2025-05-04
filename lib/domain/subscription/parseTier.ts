import { type UnknownError, toUnknownError } from "@/lib/error/common.error";
import type { TierValidationError } from "@/lib/error/subscription.error";
import { type Tier, TierSchema } from "@/lib/model/user/tier.schema";
import { Effect } from "effect";
import { ZodError } from "zod";

export const toTierPasreError = (e: unknown): TierValidationError => {
	if (e instanceof ZodError) return { _tag: "TierInvalid", cause: e };
	return toUnknownError(e);
};

export const parseTier = (
	tier: unknown,
): Effect.Effect<Tier, TierValidationError, never> =>
	Effect.try({
		try: () => {
			const parsed = TierSchema.safeParse(tier);
			if (!parsed.success) throw parsed.error;
			return parsed.data;
		},
		catch: toTierPasreError,
	});
