// lib/api/receipt/common.ts

import { z } from "zod";

export const UuidIdSchema = z.object({ id: z.string().uuid() });
