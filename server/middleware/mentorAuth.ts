import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./errorHandler.js";

/**
 * Auth for Developer Academy ↔ AI Mentor API.
 *
 * When `MOR_MENTOR_API_KEY` is set, require it via:
 *   Authorization: Bearer <MOR_MENTOR_API_KEY>
 *   or X-MOR-Mentor-Key: <MOR_MENTOR_API_KEY>
 *
 * When unset (local MVP), requests are allowed without a key.
 */
export function requireMentorAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const expected = process.env.MOR_MENTOR_API_KEY?.trim();
  if (!expected) {
    next();
    return;
  }

  const header = req.headers.authorization;
  const bearer =
    header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;
  const headerKey = req.headers["x-mor-mentor-key"];
  const keyFromHeader = typeof headerKey === "string" ? headerKey.trim() : null;
  const provided = bearer || keyFromHeader;

  if (!provided || provided !== expected) {
    next(
      new HttpError(
        401,
        "Mentor API authentication required. Send Authorization: Bearer <MOR_MENTOR_API_KEY> or X-MOR-Mentor-Key.",
      ),
    );
    return;
  }

  next();
}
