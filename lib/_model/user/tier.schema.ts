import { IsoDateSchema, UuidIdSchema } from "@/lib/_model/common.schema";
import { z } from "zod";

export const TierIdSchema = UuidIdSchema.brand("TierId");
const CreatedAdSchema = IsoDateSchema.brand("CreatedAt");
const MaxAiTokensSchema = z.number().int().nonnegative().brand("MaxAiTokens");
const MaxAiCallsSchema = z.number().int().nonnegative().brand("MaxAiCalls");
const MaxOcrCallsSchema = z.number().int().nonnegative().brand("MaxOcrCalls");

export const TierNameSchema = z
	.enum(["free", "standard", "pro"])
	.brand("TierName");

export const TierSchema = z.object({
	id: TierIdSchema,
	name: TierNameSchema,
	maxAiTokens: MaxAiTokensSchema.nullable(),
	maxAiCalls: MaxAiCallsSchema.nullable(),
	maxOcrCalls: MaxOcrCallsSchema.nullable(),
	priceJPY: z.number().int().nonnegative().nullable(),
	createdAt: CreatedAdSchema,
});

export type TierId = z.infer<typeof TierSchema.shape.id>;
export type CreatedAt = z.infer<typeof CreatedAdSchema>;
export type MaxAiTokens = z.infer<typeof MaxAiTokensSchema>;
export type MaxAiCalls = z.infer<typeof MaxAiCallsSchema>;
export type MaxOcrCalls = z.infer<typeof MaxOcrCallsSchema>;
export type TierName = z.infer<typeof TierNameSchema>;
export type Tier = z.infer<typeof TierSchema>;
