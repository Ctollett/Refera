import { z } from "zod";

import { ReferenceAnalysisSchema } from "./analysisSchema";

const CreateSessionSchema = z.object({
  name: z.string(),
  folderId: z.string().uuid().nullable().optional(),
  referenceAnalysis: ReferenceAnalysisSchema.nullish(),
});

const UpdateSessionSchema = z.object({
  name: z.string().optional(),
  folderId: z.string().uuid().nullable().optional(),
});

const UpdateReferenceAnalysisSchema = z.object({
  referenceAnalysis: ReferenceAnalysisSchema,
});

export { CreateSessionSchema, UpdateSessionSchema, UpdateReferenceAnalysisSchema };
