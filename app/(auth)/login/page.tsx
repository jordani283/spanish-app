import Link from "next/link";
import { AuthLoginForm } from "@/components/auth-login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Sign in to sync progress</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Use email magic link login. If Supabase is not configured yet, the app falls back to local demo mode.
        </p>
        <AuthLoginForm />
        <p className="mt-4 text-sm text-zinc-500">
          Already studying? <Link className="text-blue-600" href="/dashboard">Open dashboard</Link>
        </p>
      </section>
    </main>
  );
}
