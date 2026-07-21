// Vercel serverless catch-all for `/api/*`.
// Forwards requests into the existing Express app in `server/app.ts`.

type VercelReq = {
  url?: string;
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
  [key: string]: unknown;
};

type VercelRes = {
  status?: (code: number) => VercelRes;
  json?: (body: unknown) => void;
  [key: string]: unknown;
};

let cachedApp: ((req: VercelReq, res: VercelRes) => unknown) | null = null;

async function getApp() {
  if (cachedApp) return cachedApp;
  const mod = await import("../server/app.js");
  cachedApp = mod.createApp();
  return cachedApp;
}

export default async function handler(req: VercelReq, res: VercelRes) {
  try {
    // In a catch-all function, Vercel may omit the `/api` prefix from `req.url`.
    // Express in this repo expects routes like `/api/agents/context`.
    if (typeof req?.url === "string" && !req.url.startsWith("/api")) {
      req.url = `/api${req.url}`;
    }

    const app = await getApp();
    return app(req, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Avoid throwing (which can cause a 502). Return a JSON 500 instead.
    if (typeof res?.status === "function" && typeof res?.json === "function") {
      res.status(500);
      res.json({ error: "Server initialization failed", details: message });
      return;
    }
    // Fallback: if Vercel provided a different response shape.
    return {
      statusCode: 500,
      body: { error: "Server initialization failed", details: message },
    };
  }
}

