import { DashboardStats } from "@/lib/types";

export function DashboardStatsCards({ stats }: { stats: DashboardStats }) {
  const progressPct = Math.min(100, Math.round((stats.knownVerbs / stats.verbGoal) * 100));
  const cards = [
    {
      label: "Verb progress",
      value: `${stats.knownVerbs}/${stats.verbGoal}`,
      icon: "↗",
      detail: `${progressPct}% completed`,
    },
    {
      label: "Active review queue",
      value: `${stats.activeReviewQueue}`,
      icon: "↺",
      detail: stats.activeReviewQueue === 0 ? "No reviews due" : "Words ready now",
    },
    {
      label: "Consistency streak",
      value: `${stats.streakDays} days`,
      icon: "✦",
      detail: "Daily practice momentum",
    },
    {
      label: "Grammar mastery",
      value: `${stats.grammarMasteryPct}%`,
      icon: "✎",
      detail: "Recent grammar accuracy",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="metric-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{card.value}</p>
              <p className="mt-1 text-xs text-slate-500">{card.detail}</p>
            </div>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-sm font-semibold text-indigo-600">
              {card.icon}
            </span>
          </div>
          {card.label === "Verb progress" && (
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-indigo-600 transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>
          )}
        </article>
      ))}
    </section>
  );
}

export function DashboardTrends({ stats }: { stats: DashboardStats }) {
  return (
    <section className="mt-6 grid gap-4 md:grid-cols-3">
      <article className="metric-card">
        <p className="text-xs uppercase tracking-wide text-slate-500">Retention rate</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{stats.retentionRatePct}%</p>
        <p className="mt-1 text-xs text-slate-500">Correct answers in recent review sessions</p>
      </article>
      <article className="metric-card">
        <p className="text-xs uppercase tracking-wide text-slate-500">Attempts per correct</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{stats.avgAttemptsPerCorrect}</p>
        <p className="mt-1 text-xs text-slate-500">Lower is better for fluency and confidence</p>
      </article>
      <article className="metric-card">
        <p className="text-xs uppercase tracking-wide text-slate-500">Study time this week</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{stats.weeklyStudyMinutes} min</p>
        <p className="mt-1 text-xs text-slate-500">Estimated engaged practice minutes</p>
      </article>
    </section>
  );
}
