import { Router } from "express";

import { updateElement, deleteElement } from "../controllers/elements.controller.js";
import { validateToken } from "../middleware/auth.middleware.js";
import { validateUpdateElement } from "../middleware/validation.middleware.js";

const router = Router();

router.delete("/:id", validateToken, deleteElement);

router.put("/:id", validateToken, validateUpdateElement, updateElement);

export default router;
