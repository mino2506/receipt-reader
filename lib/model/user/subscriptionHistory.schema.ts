import { CuidIdSchema, IsoDateSchema } from "@/lib/model/common.schema";
import { z } from "zod";
import { TierIdSchema, TierSchema } from "./tier.schema";
import { UserIdSchema } from "./user.schema";

const SubscriptionHistoryIdSchema = CuidIdSchema.brand("SubscriptionHistoryId");
const StartedAtSchema = IsoDateSchema.brand("StartedAt");
const EndedAtSchema = IsoDateSchema.brand("EndedAt");

export const SubscriptionHistorySchema = z.object({
	id: SubscriptionHistoryIdSchema,
	userId: UserIdSchema,
	tierId: TierIdSchema,
	startedAt: StartedAtSchema,
	endedAt: EndedAtSchema.nullable(),
	tier: TierSchema.nullable(), // JOIN時で付与される
});

export type SubscriptionHistoryId = z.infer<typeof SubscriptionHistoryIdSchema>;
export type StartedAt = z.infer<typeof StartedAtSchema>;
export type EndedAt = z.infer<typeof EndedAtSchema>;

export type SubscriptionHistory = z.infer<typeof SubscriptionHistorySchema>;
