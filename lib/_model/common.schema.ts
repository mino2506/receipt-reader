import { z } from "zod";

export const UuidIdSchema = z.string().uuid().brand("UuidId");

export const CuidIdSchema = z.string().cuid().brand("CuidId");

export const IsoDateSchema = z
	.union([z.string().datetime(), z.date()])
	.transform((v) => (v instanceof Date ? v.toISOString() : v))
	.brand("IsoDate");
