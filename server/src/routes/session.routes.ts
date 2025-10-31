import { Router } from "express";
import { CreateSessionSchema, UpdateSessionSchema } from "shared";

import {
  getSessions,
  getSessionById,
  createSession,
  deleteSession,
  updateSession,
} from "../controllers/sessions.controller.js";
import { validateToken } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validation.middleware.js";

const router = Router();

router.use(validateToken);

router.get("/", getSessions);
router.get("/:id", getSessionById);
router.post("/", validateRequest(CreateSessionSchema), createSession);
router.patch("/:id", validateRequest(UpdateSessionSchema), updateSession);
router.delete("/:id", deleteSession);

export default router;
