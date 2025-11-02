import { z } from "zod";

import { CreateFolderSchema, UpdateFolderSchema } from "../schemas";

export type CreateFolder = z.infer<typeof CreateFolderSchema>;
export type UpdateFolder = z.infer<typeof UpdateFolderSchema>;
