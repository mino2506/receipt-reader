import type { CreateStore } from "@/lib/api/receipt/create.schema";
import { Store, StoreSchema } from "@/lib/api/receipt/get.schema";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { upsertStore } from "./upsertStore";

const StoreIdSchema = StoreSchema.pick({ id: true });

// biome-ignore lint/suspicious/noExplicitAny: TODO: Prisma.TransactionClientをMock型化
let tx: any;
beforeEach(() => {
	// テストごとにリセット
	tx = {
		store: {
			findFirst: vi.fn(),
			create: vi.fn(),
		},
	};
});

describe("upsertStore", () => {
	it("既に存在する場合は既存のidを返す（normalizedあり）", async () => {
		const fakeExistingStore = { id: "11111111-1111-1111-1111-111111111111" };
		tx.store.findFirst.mockResolvedValue(fakeExistingStore);

		const input: CreateStore = {
			rawName: "テストストア",
			normalized: "test-store",
		};
		const result = await upsertStore(tx, input);

		expect(tx.store.findFirst).toHaveBeenCalledWith({
			where: { normalized: "test-store" },
		});
		expect(result).toBe("11111111-1111-1111-1111-111111111111");
		expect(() => StoreIdSchema.parse({ id: result })).not.toThrow();
	});

	it("存在しない場合は新規作成してidを返す（normalizedなし）", async () => {
		const fakeCreatedStore = { id: "22222222-2222-2222-2222-222222222222" };
		tx.store.findFirst.mockResolvedValue(null);
		tx.store.create.mockResolvedValue(fakeCreatedStore);

		const input: CreateStore = { rawName: "テストストア" };
		const result = await upsertStore(tx, input);

		expect(tx.store.findFirst).toHaveBeenCalledWith({
			where: { rawName: "テストストア" },
		});
		expect(tx.store.create).toHaveBeenCalledWith({
			data: { rawName: "テストストア", normalized: null },
		});
		expect(result).toBe("22222222-2222-2222-2222-222222222222");
		expect(() => StoreIdSchema.parse({ id: result })).not.toThrow();
	});
});
