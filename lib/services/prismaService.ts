import { PrismaClient } from "@prisma/client";
import { Context, Effect, Layer } from "effect";
import type { PrismaTaggedError } from "../error/prisma.error";

export class PrismaService extends Context.Tag("PrismaService")<
	PrismaService,
	{ prisma: PrismaClient }
>() {}

export const makePrismaService = Effect.try({
	try: () => ({ prisma: new PrismaClient() }),
	catch: (cause): PrismaTaggedError => ({
		_tag: "PrismaServiceInitError",
		cause,
	}),
});

export const PrismaServiceLayer = Layer.effect(
	PrismaService,
	makePrismaService,
);
