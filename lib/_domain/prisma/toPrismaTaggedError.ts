import type { PrismaTaggedError } from "@/lib/_error/prisma.error";
import { Prisma } from "@prisma/client";

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
