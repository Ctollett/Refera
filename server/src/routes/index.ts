import { Router } from "express";

import authRoutes from "./auth.routes.js";
import boardRoutes from "./board.routes.js";
import elementRoutes from "./element.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/boards", boardRoutes);
router.use("/elements", elementRoutes);

export default router;
