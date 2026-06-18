import type { User } from "@supabase/supabase-js";
import type { Profile } from "./tickets.js";

declare global {
  namespace Express {
    interface Request {
      accessToken?: string;
      user?: User;
      profile?: Profile;
    }
  }
}

export {};
