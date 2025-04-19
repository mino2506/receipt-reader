import type { CreateItem } from "@/lib/api/receipt/create.schema";
import type { Prisma, PrismaClient } from "@prisma/client";

/**
 * - key:string = normalized or rawName
 * - Map<key, itemId> を返す
 * @param tx
 * @param inputs
 * @returns Map<key, itemId>
 */
export async function upsertItems(
	tx: Prisma.TransactionClient,
	inputs: CreateItem[],
): Promise<Map<string, string>> {
	// 1. key 抽出（normalized 優先）
	const keyFn = (item: CreateItem) => item.normalized ?? item.rawName;

	const keyToItem = new Map<string, CreateItem>();
	for (const item of inputs) {
		const key = keyFn(item);
		if (!keyToItem.has(key)) keyToItem.set(key, item);
	}

	const searchConditions = Array.from(keyToItem.values()).map((item) =>
		item.normalized
			? { normalized: item.normalized }
			: { rawName: item.rawName },
	);

	// 2. 既存アイテムを取得
	const existingItems = await tx.item.findMany({
		where: { OR: searchConditions },
	});

	const resultMap = new Map<string, string>();
	for (const item of existingItems) {
		const key = item.normalized ?? item.rawName;
		resultMap.set(key, item.id);
	}

	// 3. createMany用にまとめてバッチ登録（未登録のみ）
	const itemsToCreate = Array.from(keyToItem.entries())
		.filter(([key]) => !resultMap.has(key))
		.map(([_, item]) => ({
			rawName: item.rawName,
			normalized: item.normalized ?? null,
			category: item.category,
		}));

	if (itemsToCreate.length > 0) {
		await tx.item.createMany({ data: itemsToCreate });

		// 4. 作成後に再取得して ID をマッピング
		const allItems = await tx.item.findMany({
			where: { OR: searchConditions },
		});

		for (const item of allItems) {
			const key = item.normalized ?? item.rawName;
			resultMap.set(key, item.id);
		}
	}

	return resultMap;
}
