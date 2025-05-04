import { toPrismaTaggedError } from "@/lib/domain/prisma/toPrismaTaggedError";
import type { PrismaTaggedError } from "@/lib/error/prisma.error";
import { PrismaService } from "@/lib/services/prismaService";
import { Effect } from "effect";

export const fetchDefaultTier = (): Effect.Effect<
	unknown,
	PrismaTaggedError,
	PrismaService
> =>
	Effect.gen(function* (_) {
		const { prisma } = yield* _(PrismaService);
		const tier = yield* _(
			Effect.tryPromise({
				try: () =>
					prisma.tier.findFirstOrThrow({
						where: { name: "free" },
					}),
				catch: toPrismaTaggedError,
			}),
		);
		return tier;
	});
