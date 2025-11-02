import { z } from "zod";

const InsightSchema = z.object({
  severity: z.enum(["minor", "moderate", "major"]),
  category: z.enum(["loudness", "bass", "low_mids", "mids", "high_mids", "highs"]),
  message: z.string(),
  recommendation: z.string(),
});

export { InsightSchema };
