import { z } from "zod";

import { InsightSchema } from "../schemas";

export type Insight = z.infer<typeof InsightSchema>;
