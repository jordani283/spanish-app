import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-100 px-6 py-12">
      <section className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-wider text-zinc-500">Camino B2</p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-900">Train Spanish daily and track real progress</h1>
        <p className="mt-4 max-w-2xl text-zinc-600">
          Capture new vocabulary, review by date range with retry-until-correct sessions, and improve grammar with
          typed drills built for B1 to B2 progression.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white" href="/dashboard">
            Open dashboard
          </Link>
          <Link className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800" href="/review">
            Start review
          </Link>
          <Link className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800" href="/vocab/new">
            Add vocabulary
          </Link>
        </div>
      </section>
    </main>
  );
}
