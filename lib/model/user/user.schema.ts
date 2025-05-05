import { IsoDateSchema, UuidIdSchema } from "@/lib/model/common.schema";
import { z } from "zod";

export const UserIdSchema = UuidIdSchema.brand("UserId");

const EMailSchema = z.string().email().brand("Email");

const DisplayNameSchema = z.string().min(1).max(255).brand("DisplayName");

const AvatarUrlSchema = z.string().url().brand("AvatarUrl");

const CreatedAtSchema = IsoDateSchema.brand("CreatedAt");

const UpdatedAtSchema = IsoDateSchema.brand("UpdatedAt");

const ProviderSchema = z.union([z.literal("google"), z.literal("github")]);

export const UserSchema = z.object({
	id: UserIdSchema,
	email: EMailSchema,
	displayName: DisplayNameSchema.nullable(),
	avatarUrl: AvatarUrlSchema.nullable(),
	createdAt: CreatedAtSchema,
	updatedAt: UpdatedAtSchema,
	provider: ProviderSchema.nullable(),
});

export type UserId = z.infer<typeof UserIdSchema>;
export type Email = z.infer<typeof EMailSchema>;
export type DisplayName = z.infer<typeof DisplayNameSchema>;
export type AvatarUrl = z.infer<typeof AvatarUrlSchema>;
export type CreatedAt = z.infer<typeof CreatedAtSchema>;
export type UpdatedAt = z.infer<typeof UpdatedAtSchema>;
export type Provider = z.infer<typeof ProviderSchema>;
export type User = z.infer<typeof UserSchema>;
