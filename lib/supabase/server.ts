import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getPublicSupabaseConfig } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getPublicSupabaseConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // In Server Components, cookie mutation can throw.
        // We ignore here and rely on route handlers/callback flows for session writes.
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // no-op
        }
      },
    },
  });
}
