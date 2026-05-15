import { endOfDay, formatISO, startOfDay, subDays } from "date-fns";
import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { ReviewSession } from "@/components/review-session";
import { getReviewItemsForMode, ReviewMode } from "@/lib/data";
import { ReviewQueueItem } from "@/lib/types";

type SearchParams = Promise<{
  mode?: string;
  start?: string;
  end?: string;
}>;

export default async function ReviewPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const allowedModes: ReviewMode[] = ["due", "new", "weak", "advanced"];
  const mode = allowedModes.includes((params.mode as ReviewMode) ?? "due")
    ? ((params.mode as ReviewMode) ?? "due")
    : "due";

  const startDate = params.start ? new Date(params.start) : subDays(new Date(), 14);
  const endDate = params.end ? new Date(params.end) : new Date();

  const items = await getReviewItemsForMode({
    mode,
    start: formatISO(startOfDay(startDate)),
    end: formatISO(endOfDay(endDate)),
  });
  const queueItems: ReviewQueueItem[] = items.map((item) => ({
    vocabId: item.id,
    word: item.word,
    translation: item.translation,
    partOfSpeech: item.part_of_speech,
  }));

  return (
    <>
      <AppNav />
      <main className="page-shell mobile-bottom-safe flex-1">
        <h1 className="section-title">Review vocabulary</h1>
        <p className="section-subtitle">
          Start with due words by default. Incorrect answers repeat until correct.
        </p>

        <section className="surface-card mt-6 p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-700">Review mode</p>
            <span className="badge-muted">{queueItems.length} cards loaded</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-4">
            <Link className={mode === "due" ? "btn-primary" : "btn-secondary"} href="/review?mode=due">
              Due now
            </Link>
            <Link className={mode === "new" ? "btn-primary" : "btn-secondary"} href="/review?mode=new">
              New words
            </Link>
            <Link className={mode === "weak" ? "btn-primary" : "btn-secondary"} href="/review?mode=weak">
              Weak words
            </Link>
            <Link className={mode === "advanced" ? "btn-primary" : "btn-secondary"} href="/review?mode=advanced">
              Advanced
            </Link>
          </div>

          {mode === "advanced" && (
            <form className="mt-4 grid gap-3 sm:grid-cols-3" method="GET">
              <input type="hidden" name="mode" value="advanced" />
              <label className="text-sm">
                <span className="mb-1.5 block text-slate-600">Start date</span>
                <input
                  className="input-base min-h-11"
                  type="date"
                  name="start"
                  defaultValue={formatISO(startDate, { representation: "date" })}
                />
              </label>
              <label className="text-sm">
                <span className="mb-1.5 block text-slate-600">End date</span>
                <input
                  className="input-base min-h-11"
                  type="date"
                  name="end"
                  defaultValue={formatISO(endDate, { representation: "date" })}
                />
              </label>
              <div className="flex items-end">
                <button className="btn-primary w-full sm:w-auto" type="submit">
                  Load custom set
                </button>
              </div>
            </form>
          )}
        </section>

        <div className="mt-6">
          <ReviewSession items={queueItems} />
        </div>
      </main>
    </>
  );
}
