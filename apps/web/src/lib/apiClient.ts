import { supabase } from "@/lib/supabase";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

type ApiErrorBody = {
  error?: string;
  details?: unknown;
};

async function getAccessToken() {
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  const token = await getAccessToken();

  if (!token) {
    return { data: null, error: "You must be signed in.", status: 401 };
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    const payload = (await response.json().catch(() => ({}))) as T & ApiErrorBody;

    if (!response.ok) {
      const fallback =
        response.status === 500 && !payload.error
          ? "The API server may be offline. Run npm run dev to start the API and frontend together."
          : `Request failed with status ${response.status}.`;

      return {
        data: null,
        error: payload.error ?? fallback,
        status: response.status,
      };
    }

    return { data: payload as T, error: null, status: response.status };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network request failed.";
    return { data: null, error: message, status: 0 };
  }
}

export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) return false;
    const payload = (await response.json()) as { ok?: boolean };
    return payload.ok === true;
  } catch {
    return false;
  }
}
