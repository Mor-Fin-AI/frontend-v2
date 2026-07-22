import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Thrown when a route needs env vars that are not set. Never crashes the process. */
export class ConfigError extends HttpError {
  feature: string;
  missing: string[];

  constructor(feature: string, missing: string[]) {
    super(
      503,
      `${feature} is not configured. Missing: ${missing.join(", ")}.`
    );
    this.feature = feature;
    this.missing = missing;
  }
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Route not found." });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof ConfigError) {
    res.status(error.status).json({
      error: error.message,
      feature: error.feature,
      missing: error.missing,
      hint: "Set these in Vercel → Environment Variables or your local .env file.",
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  if (error instanceof Error && /not configured/i.test(error.message)) {
    res.status(503).json({
      error: error.message,
      hint: "Check server environment variables and GET /api/health/config.",
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed.",
      details: error.flatten(),
    });
    return;
  }

  console.error("[server]", error);
  res.status(500).json({ error: "Internal server error." });
}
