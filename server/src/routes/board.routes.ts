import { Router } from "express";

import { createBoard, deleteBoard, getBoards } from "../controllers/board.controller.js";
import { createElement, getElements } from "../controllers/elements.controller.js";
import { validateToken } from "../middleware/auth.middleware.js";
import { validateCreateBoard, validateCreateElement } from "../middleware/validation.middleware.js";

const router = Router();

router.get("/", validateToken, getBoards);

router.post("/", validateToken, validateCreateBoard, createBoard);

router.delete("/:id", validateToken, deleteBoard);

router.get("/:id/elements", validateToken, getElements);

router.post("/:id/elements", validateToken, validateCreateElement, createElement);

export default router;
