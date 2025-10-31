import { z } from "zod";

import { CreateSessionSchema, UpdateSessionSchema } from "../schemas";

export type CreateSession = z.infer<typeof CreateSessionSchema>;
export type UpdateSession = z.infer<typeof UpdateSessionSchema>;
