import { PrismaClient } from "@prisma/client";
import { Context, Effect, Layer } from "effect";

export class PrismaService extends Context.Tag("PrismaService")<
	PrismaService,
	{ prisma: PrismaClient }
>() {}

export const makePrismaService = Effect.sync(() => ({
	prisma: new PrismaClient(),
}));

export const PrismaServiceLayer = Layer.effect(
	PrismaService,
	makePrismaService,
);
