import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { DashboardStatsCards, DashboardTrends } from "@/components/dashboard-stats";
import { getDashboardStats } from "@/lib/data";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Progress dashboard</h1>
            <p className="mt-2 text-sm text-zinc-600">Track vocabulary volume, retention, streaks, and grammar weaknesses.</p>
          </div>
          <div className="flex gap-2">
            <Link className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800" href="/review">
              Run review
            </Link>
            <Link className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white" href="/vocab/new">
              Add vocab
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <DashboardStatsCards stats={stats} />
          <DashboardTrends stats={stats} />
        </div>

        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-zinc-900">Weakest grammar areas</h2>
          <ul className="mt-3 space-y-2">
            {stats.weakestAreas.length === 0 ? (
              <li className="text-sm text-zinc-600">No grammar attempts yet. Complete a grammar session to populate this.</li>
            ) : (
              stats.weakestAreas.map((area) => (
                <li key={area.tag} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm">
                  <span className="text-zinc-700">{area.tag}</span>
                  <span className="font-medium text-zinc-900">{area.errorRatePct}% error rate</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>
    </>
  );
}
