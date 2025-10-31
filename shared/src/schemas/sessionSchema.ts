import { z } from "zod";

import { ReferenceAnalysisSchema } from "./analysisSchema";

const CreateSessionSchema = z.object({
  name: z.string(),
  folderId: z.string().uuid().nullable().optional(),
  referenceAnalysis: ReferenceAnalysisSchema,
});

const UpdateSessionSchema = z.object({
  name: z.string().optional(),
  folderId: z.string().uuid().nullable().optional(),
});

export { CreateSessionSchema, UpdateSessionSchema };
