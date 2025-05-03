import type { SubscriptionHistory } from "@/lib/model/user/subscriptionHistory.schema";
import type { Tier } from "@/lib/model/user/tier.schema";
import type { ZodError } from "zod";
import type { UnknownError } from "./common.error";

export type SubscriptionHistoryValidationError =
	| { _tag: "TierInvalid"; cause: ZodError }
	| UnknownError;

export type PrismaTaggedError =
	| { _tag: "UniqueConstraintViolation"; target: string[] }
	| { _tag: "ForeignKeyConstraintViolation"; field: string }
	| { _tag: "RecordNotFound"; model?: string }
	| { _tag: "ValidationError"; reason: string }
	| { _tag: "InternalPrismaError"; cause: unknown };

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
