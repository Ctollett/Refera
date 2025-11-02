import { Router } from "express";
import { CreateSessionSchema, UpdateSessionSchema, UpdateReferenceAnalysisSchema } from "shared";

import {
  getSessions,
  getSessionById,
  createSession,
  deleteSession,
  updateSession,
  updateReferenceAnalysis,
} from "../controllers/sessions.controller.js";
import { validateToken } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validation.middleware.js";

const router = Router();

router.use(validateToken);

router.get("/", getSessions);
router.get("/:id", getSessionById);
router.post("/", validateRequest(CreateSessionSchema), createSession);
router.patch("/:id", validateRequest(UpdateSessionSchema), updateSession);
router.patch(
  "/:id/reference",
  validateRequest(UpdateReferenceAnalysisSchema),
  updateReferenceAnalysis,
);
router.delete("/:id", deleteSession);

export default router;
