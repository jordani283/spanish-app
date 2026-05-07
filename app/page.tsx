import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <section className="surface-card w-full max-w-4xl p-8 sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-primary">B1 to B2 Path</span>
          <span className="badge-success">Cross-device sync</span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Train Spanish daily and build momentum that lasts
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          Capture new vocabulary, review by date range with retry-until-correct sessions, and improve grammar with
          typed drills built for B1 to B2 progression.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="btn-primary" href="/dashboard">
            Open dashboard
          </Link>
          <Link className="btn-secondary" href="/review">
            Start review
          </Link>
          <Link className="btn-secondary" href="/vocab/new">
            Add vocabulary
          </Link>
        </div>
      </section>
    </main>
  );
}
