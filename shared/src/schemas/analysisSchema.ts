import { z } from "zod";

const FrequencyBandSchema = z.object({
  sub_bass: z.number(),
  bass: z.number(),
  low_mids: z.number(),
  mids: z.number(),
  high_mids: z.number(),
  highs: z.number(),
});

const ReferenceAnalysisSchema = z.object({
  filename: z.string(),
  lufs_integrated: z.number(),
  true_peak: z.number(),
  frequency_bands: FrequencyBandSchema,
  spectrum_data: z.array(z.number()).optional(),
});

const MixAnalysisSchema = z.object({
  filename: z.string(),
  lufs_integrated: z.number(),
  true_peak: z.number(),
  frequency_bands: FrequencyBandSchema,
  spectrum_data: z.array(z.number()).optional(),
});

const ComparisonSchema = z.object({
  lufs_delta: z.number(),
  frequency_deltas: FrequencyBandSchema,
});

export { FrequencyBandSchema, ReferenceAnalysisSchema, MixAnalysisSchema, ComparisonSchema };
