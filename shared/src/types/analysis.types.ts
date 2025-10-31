import { z } from "zod";

import {
  FrequencyBandSchema,
  ReferenceAnalysisSchema,
  MixAnalysisSchema,
  ComparisonSchema,
} from "../schemas/analysisSchema";

export type FrequencyBand = z.infer<typeof FrequencyBandSchema>;
export type ReferenceAnalysis = z.infer<typeof ReferenceAnalysisSchema>;
export type MixAnalysis = z.infer<typeof MixAnalysisSchema>;
export type Comparison = z.infer<typeof ComparisonSchema>;
