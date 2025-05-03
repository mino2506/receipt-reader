import type { SubscriptionHistory } from "@/lib/model/user/subscriptionHistory.schema";
import type { Tier } from "@/lib/model/user/tier.schema";
import type { ZodError } from "zod";
import type { UnknownError } from "./common.error";
import type { PrismaTaggedError } from "./prisma.error";

export type SubscriptionHistoryValidationError =
	| { _tag: "TierInvalid"; cause: ZodError }
	| UnknownError;

export type SubscriptionFormatError =
	| { _tag: "TierMissing"; subscriptionId: string }
	| UnknownError;

export type GetActiveSubscriptionError =
	| PrismaTaggedError
	| SubscriptionHistoryValidationError
	| SubscriptionFormatError;

export type SubscriptionResult = {
	subscription: SubscriptionHistory;
	tier: Tier;
	tierName: string;
};

export type SubscriptionInitError = PrismaTaggedError;
