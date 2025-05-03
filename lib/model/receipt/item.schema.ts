import { Effect } from "effect";
import { z } from "zod";

import { type Category, CategoryEnum } from "@/lib/api/receipt/common.schema";
import { IsoDateSchema, UuidIdSchema } from "@/lib/model/common.schema";

const ItemIdSchema = UuidIdSchema.brand("ItemId");

export const BaseNameSchema = z.string().min(1).max(255);
const RawNameSchema = BaseNameSchema.brand("RawName");
export const NormalizedSchema = BaseNameSchema.brand("Normalized");
const NormalizedSchemaNullable = NormalizedSchema.or(z.null());

export const UnsavedStatusSchema = z.literal("unsaved").brand("Status");
export const OptimisticStatusSchema = z.literal("optimistic").brand("Status");
export const SavedStatusSchema = z.literal("saved").brand("Status");
export const StatusSchema = z.union([
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

export const ItemUnionSchema = z.discriminatedUnion("status", [
	UnsavedItemSchema,
	OptimisticItemSchema,
	SavedItemSchema,
]);

export type ItemId = z.infer<typeof ItemIdSchema>;

export type BaseName = z.infer<typeof BaseNameSchema>;
export type RawName = z.infer<typeof RawNameSchema>;
export type Normalized = z.infer<typeof NormalizedSchema>;
export type NormalizedNullable = z.infer<typeof NormalizedSchemaNullable>;

export type UnsavedStatus = z.infer<typeof UnsavedStatusSchema>;
export type OptimisticStatus = z.infer<typeof OptimisticStatusSchema>;
export type SavedStatus = z.infer<typeof SavedStatusSchema>;

export type Status = z.infer<typeof StatusSchema>;
const StatusTransitionMapSchema = z.object({
	unsaved: z.tuple([OptimisticStatusSchema]),
	optimistic: z.tuple([SavedStatusSchema]),
	saved: z.tuple([]),
});
type StatusTransitionMap = z.infer<typeof StatusTransitionMapSchema>;
type RawStatus = keyof StatusTransitionMap;
type NextStatus<S extends RawStatus> = StatusTransitionMap[S][number];
type A = NextStatus<"unsaved">;

export type BaseItem = z.infer<typeof BaseItemSchema>;
export type SavedItem = z.infer<typeof SavedItemSchema>;
export type OptimisticItem = z.infer<typeof OptimisticItemSchema>;
export type UnsavedItem = z.infer<typeof UnsavedItemSchema>;

export type Item = z.infer<typeof ItemUnionSchema>;

import type { ZodError } from "zod";

type BaseValidationError<T extends string> = {
	_tag: T;
	cause: ZodError;
	code: string;
	message: string;
	field: string;
};

function zodErrorFactory<T extends string>(
	tag: T,
	field: string,
): (cause: ZodError) => BaseValidationError<T> {
	return (cause) => ({
		_tag: tag,
		cause,
		code: `invalid_${field}` as const,
		message: cause.errors.map((e) => e.message).join(", "),
		field,
	});
}

export const ValidationErrorFactory = {
	invalidRawName: zodErrorFactory("InvalidRawName", "item_rawname"),
	invalidNormalized: zodErrorFactory("InvalidNormalized", "item_normalized"),
	invalidCategory: zodErrorFactory("InvalidCategory", "item_category"),
	invalidUnsavedItem: zodErrorFactory("InvalidUnsavedItem", "unsaved_item"),
	invalidOptimisticItem: zodErrorFactory(
		"InvalidOptimisticItem",
		"optimistic_item",
	),
	unknown: (cause: unknown, field: string) =>
		({
			_tag: "Unknown",
			cause,
			code: "unknown",
			message: "unknown error",
			field,
		}) as const,
};

type ValidationError = ReturnType<
	(typeof ValidationErrorFactory)[keyof typeof ValidationErrorFactory]
>;

export const createUnsavedItem = (
	rawNameInput: string,
	categoryInput: string,
	normalizedInput?: string,
): Effect.Effect<UnsavedItem, ValidationError, never> =>
	Effect.gen(function* (_) {
		const rawName = yield* _(
			Effect.try({
				try: () => RawNameSchema.parse(rawNameInput),
				catch: (e): ValidationError =>
					ValidationErrorFactory.invalidRawName(e as ZodError),
			}),
		);
		const normalized = yield* _(
			Effect.try({
				try: () => NormalizedSchemaNullable.parse(normalizedInput ?? null),
				catch: (e): ValidationError =>
					ValidationErrorFactory.invalidNormalized(e as ZodError),
			}),
		);
		const category = yield* _(
			Effect.try({
				try: () => CategoryEnum.parse(categoryInput),
				catch: (e): ValidationError =>
					ValidationErrorFactory.invalidCategory(e as ZodError),
			}),
		);
		const item = yield* _(
			Effect.try({
				try: () =>
					UnsavedItemSchema.parse({
						rawName,
						normalized,
						category,
						status: "unsaved" as UnsavedStatus,
					}),
				catch: (e): ValidationError =>
					ValidationErrorFactory.invalidUnsavedItem(e as ZodError),
			}),
		);

		return item;
	});

export const toOptimisticItem = (
	item: UnsavedItem,
): Effect.Effect<OptimisticItem, ValidationError, never> =>
	Effect.gen(function* (_) {
		const unsavedItem = yield* _(
			Effect.try({
				try: () => UnsavedItemSchema.parse(item),
				catch: (e): ValidationError =>
					ValidationErrorFactory.invalidUnsavedItem(e as ZodError),
			}),
		);
		const draft = {
			...unsavedItem,
			id: crypto.randomUUID() as ItemId,
			createdAt: IsoDateSchema.parse(new Date()),
			updatedAt: IsoDateSchema.parse(new Date()),
			status: "optimistic" as OptimisticStatus,
		};
		const optimisticItem = yield* _(
			Effect.try({
				try: () => OptimisticItemSchema.parse(draft),
				catch: (e): ValidationError =>
					ValidationErrorFactory.invalidOptimisticItem(e as ZodError),
			}),
		);

		return optimisticItem;
	});
