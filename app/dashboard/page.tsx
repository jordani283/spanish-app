import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { DashboardStatsCards, DashboardTrends } from "@/components/dashboard-stats";
import { getDashboardStats } from "@/lib/data";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const hasStarted = stats.knownVerbs > 0 || stats.activeReviewQueue > 0 || stats.weeklyStudyMinutes > 0;
  const todayFocus =
    stats.activeReviewQueue > 0
      ? `Review ${stats.activeReviewQueue} due word${stats.activeReviewQueue === 1 ? "" : "s"}`
      : "Add 5-10 words to unlock your first review cycle";

  return (
    <>
      <AppNav />
      <main className="page-shell mobile-bottom-safe flex-1">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="section-title">Progress dashboard</h1>
            <p className="section-subtitle">Track vocabulary volume, retention, streaks, and grammar weak spots in one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="btn-secondary" href="/review">
              Run review
            </Link>
            <Link className="btn-primary" href="/vocab/new">
              Add vocab
            </Link>
          </div>
        </div>

        <section className="surface-card mt-6 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Today&apos;s focus</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 sm:text-xl">{todayFocus}</p>
            </div>
            <span className="badge-success">Keep your streak alive</span>
          </div>
        </section>

        <div className="mt-6">
          <DashboardStatsCards stats={stats} />
          <DashboardTrends stats={stats} />
        </div>

        <section className="surface-card mt-6 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Weakest grammar areas</h2>
          <ul className="mt-4 space-y-2">
            {stats.weakestAreas.length === 0 ? (
              <li className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                No grammar attempts yet. Start a grammar session and you will see your weakest patterns here.
              </li>
            ) : (
              stats.weakestAreas.map((area) => (
                <li
                  key={area.tag}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition hover:bg-slate-100"
                >
                  <span className="font-medium capitalize text-slate-700">{area.tag.replaceAll("_", " ")}</span>
                  <span className="badge-muted">{area.errorRatePct}% error rate</span>
                </li>
              ))
            )}
          </ul>
        </section>

        {!hasStarted && (
          <section className="surface-card mt-6 border-dashed p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">Get started in 2 minutes</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>1. Add 10 words from today&apos;s reading or conversation.</li>
              <li>2. Run one review round and clear all retries.</li>
              <li>3. Complete one grammar prompt set to unlock trend insights.</li>
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
