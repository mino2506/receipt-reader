import { toPrismaTaggedError } from "@/lib/domain/prisma/toPrismaTaggedError";
import type { PrismaTaggedError } from "@/lib/error/prisma.error";
import { PrismaService } from "@/lib/services/prismaService";
import type { User } from "@supabase/supabase-js";
import { Effect } from "effect";

export const saveUser = (
	user: User,
): Effect.Effect<void, PrismaTaggedError, PrismaService> =>
	Effect.gen(function* (_) {
		const { prisma } = yield* _(PrismaService);
		yield* _(
			Effect.tryPromise({
				try: () => {
					const upserted = prisma.user.upsert({
						where: { id: user.id },
						update: {},
						create: {
							id: user.id,
							email: user.email ?? "",
							display_name: user.user_metadata?.name ?? null,
							avatar_url: user.user_metadata?.avatar_url ?? null,
							provider: user.app_metadata?.provider ?? null,
						},
					});
					console.log(upserted);
					return upserted;
				},
				catch: toPrismaTaggedError,
			}),
		);
	});
