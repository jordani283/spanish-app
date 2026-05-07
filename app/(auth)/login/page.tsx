import Link from "next/link";
import { AuthLoginForm } from "@/components/auth-login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
      <section className="surface-card w-full max-w-md p-6 sm:p-7">
        <span className="badge-primary">Secure magic link</span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">Sign in to sync progress</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Use email magic link login. If Supabase is not configured yet, the app falls back to local demo mode.
        </p>
        <AuthLoginForm />
        <p className="mt-5 text-sm text-slate-500">
          Already studying?{" "}
          <Link className="font-medium text-indigo-600 hover:text-indigo-700" href="/dashboard">
            Open dashboard
          </Link>
        </p>
      </section>
    </main>
  );
}
