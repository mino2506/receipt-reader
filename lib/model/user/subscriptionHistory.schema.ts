import { CuidIdSchema, IsoDateSchema } from "@/lib/model/common.schema";
import { ZodError, z } from "zod";
import { type Tier, TierIdSchema, TierSchema } from "./tier.schema";
import { UserIdSchema } from "./user.schema";

const SubscriptionHistoryIdSchema = CuidIdSchema.brand("SubscriptionHistoryId");
const StartedAtSchema = IsoDateSchema.brand("StartedAt");
const EndedAtSchema = IsoDateSchema.brand("EndedAt");

export const SubscriptionHistorySchema = z.object({
	id: SubscriptionHistoryIdSchema,
	userId: UserIdSchema,
	tierId: TierIdSchema,
	startedAt: StartedAtSchema,
	endedAt: EndedAtSchema.nullable(),
	tier: TierSchema, // JOIN時で付与される
});

export type SubscriptionHistoryId = z.infer<typeof SubscriptionHistoryIdSchema>;
export type StartedAt = z.infer<typeof StartedAtSchema>;
export type EndedAt = z.infer<typeof EndedAtSchema>;

export type SubscriptionHistory = z.infer<typeof SubscriptionHistorySchema>;

export type SubscriptionHistoryValidationError =
	| { _tag: "TierInvalid"; cause: ZodError }
	| { _tag: "Unknown"; cause: unknown };

export const toSubscriptionHistoryValidationError = (
	e: unknown,
): SubscriptionHistoryValidationError => {
	if (e instanceof ZodError) return { _tag: "TierInvalid", cause: e };
	return { _tag: "Unknown", cause: e };
};

export const validateSubscriptionHistory = (
	subscriptionHistory: unknown,
): Effect.Effect<
	SubscriptionHistory,
	SubscriptionHistoryValidationError,
	never
> =>
	Effect.try({
		try: () => {
			const parsed = SubscriptionHistorySchema.safeParse(subscriptionHistory);
			if (!parsed.success) throw parsed.error;
			return parsed.data;
		},
		catch: (e) => toSubscriptionHistoryValidationError(e),
	});

import type { UserId } from "@/lib/model/user/user.schema";
import { PrismaService } from "@/lib/services/prisma";
import { Prisma } from "@prisma/client";
import { Effect, pipe } from "effect";

export type PrismaTaggedError =
	| { type: "UniqueConstraintViolation"; target: string[] }
	| { type: "ForeignKeyConstraintViolation"; field: string }
	| { type: "RecordNotFound"; model?: string }
	| { type: "ValidationError"; reason: string }
	| { type: "InternalPrismaError"; cause: unknown };

const toPrismaTaggedError = (e: unknown): PrismaTaggedError => {
	if (e instanceof Prisma.PrismaClientKnownRequestError) {
		switch (e.code) {
			case "P2002":
				return {
					type: "UniqueConstraintViolation",
					target:
						Array.isArray(e.meta?.target) &&
						e.meta?.target.every((v) => typeof v === "string")
							? (e.meta.target as string[])
							: [],
				};
			case "P2003":
				return {
					type: "ForeignKeyConstraintViolation",
					field: String(e.meta?.field_name ?? "unknown"),
				};
			case "P2025":
				return {
					type: "RecordNotFound",
					model: String(e.meta?.modelName ?? "unknown"),
				};
			default:
				return { type: "InternalPrismaError", cause: e };
		}
	}
	if (e instanceof Prisma.PrismaClientValidationError) {
		return {
			type: "ValidationError",
			reason: e.message,
		};
	}
	return {
		type: "InternalPrismaError",
		cause: e,
	};
};

type GetActiveSubscriptionError =
	| PrismaTaggedError
	| SubscriptionHistoryValidationError;

type SubscriptionResult = { subscription: SubscriptionHistory; tier: Tier };

const formatSubscriptionResult = (
	subscription: SubscriptionHistory,
): SubscriptionResult => ({
	subscription,
	tier: subscription.tier,
});

const fetchSubscription = async (userId: UserId) =>
	Effect.gen(function* (_) {
		const { prisma } = yield* _(PrismaService);
		const result = yield* _(
			Effect.tryPromise({
				try: () => {
					const subscription = prisma.subscriptionHistory.findFirst({
						where: {
							userId,
							startedAt: { lte: new Date() },
							OR: [{ endedAt: null }, { endedAt: { gt: new Date() } }],
						},
						orderBy: { startedAt: "desc" },
						include: { tier: true },
					});
					return subscription;
				},
				catch: toPrismaTaggedError,
			}),
		);
		return result;
	});

const getActiveSubscriptionEffect = (
	userId: UserId,
): Effect.Effect<
	SubscriptionResult,
	GetActiveSubscriptionError,
	PrismaService
> =>
	pipe(
		fetchSubscription(userId),
		Effect.flatMat(validateSubscriptionHistory),
		Effect.flatMap(formatSubscriptionResult),
	);
