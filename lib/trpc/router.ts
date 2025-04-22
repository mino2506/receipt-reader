import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "./core";
import { itemRouter } from "./item/router";
import { receiptRouter } from "./receipt/router";

export const appRouter = router({
	receipt: receiptRouter,
	item: itemRouter,
});

export type AppRouter = typeof appRouter;
