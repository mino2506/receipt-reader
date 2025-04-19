import type { CreateStore } from "@/lib/api/receipt/create.schema";
import type { Prisma, PrismaClient } from "@prisma/client";

export async function upsertStore(
	tx: Prisma.TransactionClient,
	input: CreateStore,
) {
	const existing = await tx.store.findFirst({
		where: input.normalized
			? { normalized: input.normalized }
			: { rawName: input.rawName },
	});

	if (existing) return existing.id;

	const created = await tx.store.create({
		data: {
			rawName: input.rawName,
			normalized: input.normalized ?? null,
		},
	});

	return created.id;
}
