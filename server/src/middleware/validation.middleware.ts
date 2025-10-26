import { Request, Response, NextFunction } from "express";
import {
  registerSchema,
  loginSchema,
  createBoardSchema,
  updateBoardSchema,
  createElementSchema,
  updateElementSchema,
} from "shared";
import { ZodError } from "zod";

/**
 * Validates registration data
 */
export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  try {
    registerSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    return res.status(500).json({
      message: "Validation error",
      error: "An unexpected error occurred",
    });
  }
};

/**
 * Validates login data
 */
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  try {
    loginSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    return res.status(500).json({
      message: "Validation error",
      error: "An unexpected error occurred",
    });
  }
};

export const validateCreateBoard = (req: Request, res: Response, next: NextFunction) => {
  try {
    createBoardSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    return res.status(500).json({
      message: "Validation error",
      error: "An unexpected error occurred",
    });
  }
};

export const validateUpdateBoard = (req: Request, res: Response, next: NextFunction) => {
  try {
    updateBoardSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    return res.status(500).json({
      message: "Validation error",
      error: "An unexpected error occurred",
    });
  }
};

export const validateCreateElement = (req: Request, res: Response, next: NextFunction) => {
  try {
    createElementSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    return res.status(500).json({
      message: "Validation error",
      error: "An unexpected error occurred",
    });
  }
};

export const validateUpdateElement = (req: Request, res: Response, next: NextFunction) => {
  try {
    updateElementSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    return res.status(500).json({
      message: "Validation error",
      error: "An unexpected error occurred",
    });
  }
};
