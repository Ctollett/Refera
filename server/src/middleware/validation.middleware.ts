import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "shared";
import { ZodError, ZodSchema } from "zod";

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

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Validation failed:", error.errors);
        return res.status(400).json({
          message: "Validation failed",
          error: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        });
      }
      console.error("Unexpected validation error:", error);
      return res.status(500).json({
        message: "Validation error",
        error: "An unexpected error occurred",
      });
    }
  };
};
