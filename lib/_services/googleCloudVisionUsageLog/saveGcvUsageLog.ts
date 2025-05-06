import { toPrismaTaggedError } from "@/lib/_domain/prisma/toPrismaTaggedError";
import type { PrismaTaggedError } from "@/lib/_error/prisma.error";
import type { UserId } from "@/lib/_model/user/user.schema";
import { PrismaService } from "@/lib/_services/prismaService";
import { Effect } from "effect";

export const saveGcvUsageLog = (
	userId: UserId,
	success: boolean,
): Effect.Effect<void, PrismaTaggedError, PrismaService> =>
	Effect.gen(function* (_) {
		const { prisma } = yield* _(PrismaService);
		yield* _(
			Effect.tryPromise({
				try: () =>
					prisma.googleCloudVisionUsageLog.create({
						data: { userId, success },
					}),
				catch: toPrismaTaggedError,
			}),
		);
	});
