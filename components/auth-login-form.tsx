"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function AuthLoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setIsLoading(true);

    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setStatus(
          "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in this deployment build. Recheck Vercel env vars and redeploy.",
        );
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setStatus(error.message);
      } else {
        setStatus("Magic link sent. Open your email to complete sign in.");
      }
    } catch (error) {
      setStatus(
        `Supabase login failed: ${error instanceof Error ? error.message : "Unknown error. Check deployment logs."}`,
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <label className="block">
        <span className="mb-1 block text-sm text-zinc-700">Email</span>
        <input
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <button
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Send magic link"}
      </button>
      {status && <p className="text-sm text-zinc-600">{status}</p>}
    </form>
  );
}
