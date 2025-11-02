import { z } from "zod";

const CreateFolderSchema = z.object({
  name: z.string(),
});

const UpdateFolderSchema = z.object({
  name: z.string(),
});

export { CreateFolderSchema, UpdateFolderSchema };
