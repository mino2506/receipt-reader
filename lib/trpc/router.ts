import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "./core";
import { receiptRouter } from "./receipt/router";

export const appRouter = router({
	receipt: receiptRouter,
});

export type AppRouter = typeof appRouter;
