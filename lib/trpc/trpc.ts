import { initTRPC } from "@trpc/server";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

export const protectedProcedure = t.procedure.use(
	middleware(({ ctx, next }) => {
		if (!ctx.user) {
			throw new Error("UNAUTHORIZED");
		}

		// non-nullチェック後の値をプロパティに代入してUser型のみにする
		return next({
			ctx: {
				...ctx,
				user: ctx.user,
			},
		});
	}),
);
