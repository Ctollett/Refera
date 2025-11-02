import { z } from "zod";

import { ComparisonSchema, MixAnalysisSchema, ReferenceAnalysisSchema } from "./analysisSchema";
import { InsightSchema } from "./insightSchema";

const anonymousSessionSchema = z.object({
  referenceAnalysis: ReferenceAnalysisSchema,
  mixVersions: z
    .array(
      z.object({
        versionNumber: z.number(),
        analysis: MixAnalysisSchema,
        comparison: ComparisonSchema,
        insights: z.array(InsightSchema),
      }),
    )
    .max(3),
});

export { anonymousSessionSchema };
