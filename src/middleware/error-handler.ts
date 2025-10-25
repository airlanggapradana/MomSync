import {Request, Response, NextFunction} from "express";
import {ZodError} from "zod";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    console.error(err);
    return res.status(400).json({
      message: "Validation Error",
      errors: err.issues
    });
  }
  if (err instanceof Error) {
    console.error(err);
    return res.status(500).json({
      message: err.message
    });
  }
  console.error("Unknown error:", err);
  return res.status(500).json({
    message: "An unknown error occurred"
  });
}