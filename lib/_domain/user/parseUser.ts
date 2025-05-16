import { toUnknownError } from "@/lib/_error/common.error";
import type { UserIdValidationError } from "@/lib/_error/user.error";
import {
	type User,
	type UserId,
	UserIdSchema,
	UserSchema,
} from "@/lib/_model/user/user.schema";
import { Effect } from "effect";
import { ZodError } from "zod";

export const tuUserIdParseError = (e: unknown): UserIdValidationError => {
	if (e instanceof ZodError)
		return { _tag: "UserIdInvalid", cause: e } satisfies UserIdValidationError;
	return toUnknownError(e);
};

export const parseUserId = (
	userId: string,
): Effect.Effect<UserId, UserIdValidationError, never> =>
	Effect.try({
		try: () => {
			const result = UserIdSchema.parse(userId);
			return result;
		},
		catch: tuUserIdParseError,
	});
