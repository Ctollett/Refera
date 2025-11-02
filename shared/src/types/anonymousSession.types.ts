import { z } from "zod";

import { anonymousSessionSchema } from "../schemas";
export type AnonymousSessionData = z.infer<typeof anonymousSessionSchema>;
