import type { NextFunction, Request, Response } from "express";
import { createAnonClient, getUserFromToken } from "../lib/supabase.js";
import type { Profile } from "../types/tickets.js";
import { HttpError } from "./errorHandler.js";

function extractBearerToken(req: Request) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

async function loadProfile(userId: string, accessToken: string): Promise<Profile | null> {
  const client = createAnonClient(accessToken);
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[auth] profile lookup failed:", error.message);
    return null;
  }

  return data as Profile | null;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractBearerToken(req);
  if (!token) {
    next(new HttpError(401, "Authentication required."));
    return;
  }

  const { user, error } = await getUserFromToken(token);
  if (error || !user) {
    next(new HttpError(401, error ?? "Authentication required."));
    return;
  }

  const profile = await loadProfile(user.id, token);

  req.accessToken = token;
  req.user = user;
  req.profile = profile ?? undefined;
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.profile?.role !== "admin") {
    next(new HttpError(403, "Admin access required."));
    return;
  }

  next();
}
