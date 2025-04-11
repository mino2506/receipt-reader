import { z } from "zod";
import { GCVFeatureType } from ".";

// export const GCVRequestSchema = z.object({
// 	image: z.union([
// 		z.object({ content: z.string() }),
// 		z.object({ source: z.object({ imageUri: z.string().url() }) }),
// 	]),
// 	features: z.array(z.object({ type: z.number() })),
// });

// export const isGCVRequest = (
// 	data: unknown,
// ): data is z.infer<typeof GCVRequestSchema> =>
// 	GCVRequestSchema.safeParse(data).success;
