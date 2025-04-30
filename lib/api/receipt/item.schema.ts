import { z } from "zod";
import { type Category, CategoryEnum, IsoDateSchema } from "./common.schema";
import { UuidIdSchema } from "./common.schema";

const ItemIdSchema = UuidIdSchema.brand("ItemId");

const BaseNameSchema = z.string().min(1).max(255);
const RawNameSchema = BaseNameSchema.brand("RawName");
const NormalizedSchema = BaseNameSchema.brand("Normalized");
const NormalizedSchemaNullable = NormalizedSchema.nullable().optional();

const UnsavedStatusSchema = z.literal("unsaved").brand("UnsavedStatus");
const OptimisticStatusSchema = z
	.literal("optimistic")
	.brand("OptimisticStatus");
const SavedStatusSchema = z.literal("saved").brand("SavedStatus");
const StatusSchema = z.union([
	UnsavedStatusSchema,
	OptimisticStatusSchema,
	SavedStatusSchema,
]);

const BaseItemSchema = z.object({
	rawName: RawNameSchema,
	normalized: NormalizedSchemaNullable,
	category: CategoryEnum,
});
const UnsavedItemSchema = BaseItemSchema.extend({
	status: UnsavedStatusSchema,
});
const OptimisticItemSchema = BaseItemSchema.extend({
	id: ItemIdSchema,
	createdAt: IsoDateSchema,
	updatedAt: IsoDateSchema,
	status: OptimisticStatusSchema,
});
const SavedItemSchema = BaseItemSchema.extend({
	id: ItemIdSchema,
	createdAt: IsoDateSchema,
	updatedAt: IsoDateSchema,
	status: SavedStatusSchema,
});

export const ItemUnionSchema = z.union([
	UnsavedItemSchema,
	OptimisticItemSchema,
	SavedItemSchema,
]);

export type ItemId = z.infer<typeof ItemIdSchema>;

export type BaseName = z.infer<typeof BaseNameSchema>;
export type RawName = z.infer<typeof RawNameSchema>;
export type Normalized = z.infer<typeof NormalizedSchema>;
export type NormalizedNullacle = z.infer<typeof NormalizedSchemaNullable>;

export type UnsavedStatus = z.infer<typeof UnsavedStatusSchema>;
export type OptimisticStatus = z.infer<typeof OptimisticStatusSchema>;
export type SavedStatus = z.infer<typeof SavedStatusSchema>;

export type Status = z.infer<typeof StatusSchema>;

export type BaseItem = z.infer<typeof BaseItemSchema>;
export type SavedItem = z.infer<typeof SavedItemSchema>;
export type OptimisticItem = z.infer<typeof OptimisticItemSchema>;
export type UnsavedItem = z.infer<typeof UnsavedItemSchema>;

export type Item = z.infer<typeof ItemUnionSchema>;

export const createUnsavedItem = (
	rawNameInput: string,
	normalizedInput: string,
	categoryInput: Category,
): UnsavedItem => {
	const rawName = RawNameSchema.parse(rawNameInput);
	const normalized = NormalizedSchema.parse(normalizedInput);
	const category = CategoryEnum.parse(categoryInput);
	const status = "unsaved" as UnsavedStatus;
	return { rawName, normalized, category, status };
};

export const toOptimisticItem = (item: UnsavedItem): OptimisticItem => ({
	...item,
	id: crypto.randomUUID() as ItemId,
	createdAt: IsoDateSchema.parse(new Date()),
	updatedAt: IsoDateSchema.parse(new Date()),
	status: "optimistic" as OptimisticStatus,
});
