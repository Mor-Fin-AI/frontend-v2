import { supabase } from "@/lib/supabase";

type InvokeOptions = {
  body?: Record<string, unknown>;
};

export async function invokeEdgeFunction<T>(
  functionName: string,
  options: InvokeOptions = {}
) {
  if (!supabase) {
    return { data: null as T | null, error: "Supabase is not configured." };
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: options.body ?? {},
  });

  if (error) {
    return { data: null, error: error.message };
  }

  const payload = data as { error?: string; ticket?: unknown } | null;

  if (payload?.error) {
    return { data: null, error: payload.error };
  }

  return { data: data as T, error: null };
}
