import type { ZodError } from "zod";
import type { UnknownError } from "./common.error";

export type UserIdValidationError =
	| { _tag: "UserIdInvalid"; cause: ZodError }
	| UnknownError;

export type UserValidationError =
	| { _tag: "UserInvalid"; cause: ZodError }
	| UnknownError;
