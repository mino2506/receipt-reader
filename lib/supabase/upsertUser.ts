import { prisma } from "@/lib/prisma";
import type { User } from "@supabase/supabase-js";

export async function upsertUser(user: User) {
	await prisma.user.upsert({
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
}
