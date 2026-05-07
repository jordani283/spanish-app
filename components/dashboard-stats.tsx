import { DashboardStats } from "@/lib/types";

export function DashboardStatsCards({ stats }: { stats: DashboardStats }) {
  const progressPct = Math.min(100, Math.round((stats.knownVerbs / stats.verbGoal) * 100));

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-xs uppercase text-zinc-500">Verb progress</p>
        <p className="mt-2 text-2xl font-semibold text-zinc-900">
          {stats.knownVerbs}/{stats.verbGoal}
        </p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
          <div className="h-full rounded-full bg-blue-600" style={{ width: `${progressPct}%` }} />
        </div>
      </article>

      <article className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-xs uppercase text-zinc-500">Active review queue</p>
        <p className="mt-2 text-2xl font-semibold text-zinc-900">{stats.activeReviewQueue}</p>
      </article>

      <article className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-xs uppercase text-zinc-500">Consistency streak</p>
        <p className="mt-2 text-2xl font-semibold text-zinc-900">{stats.streakDays} days</p>
      </article>

      <article className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-xs uppercase text-zinc-500">Grammar mastery</p>
        <p className="mt-2 text-2xl font-semibold text-zinc-900">{stats.grammarMasteryPct}%</p>
      </article>
    </section>
  );
}

export function DashboardTrends({ stats }: { stats: DashboardStats }) {
  return (
    <section className="mt-6 grid gap-4 md:grid-cols-3">
      <article className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-xs uppercase text-zinc-500">Retention rate</p>
        <p className="mt-2 text-xl font-semibold text-zinc-900">{stats.retentionRatePct}%</p>
      </article>
      <article className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-xs uppercase text-zinc-500">Attempts per correct</p>
        <p className="mt-2 text-xl font-semibold text-zinc-900">{stats.avgAttemptsPerCorrect}</p>
      </article>
      <article className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-xs uppercase text-zinc-500">Study time this week</p>
        <p className="mt-2 text-xl font-semibold text-zinc-900">{stats.weeklyStudyMinutes} min</p>
      </article>
    </section>
  );
}
