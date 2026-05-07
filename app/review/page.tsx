import { endOfDay, formatISO, startOfDay, subDays } from "date-fns";
import { AppNav } from "@/components/app-nav";
import { ReviewSession } from "@/components/review-session";
import { getVocabByDateRange } from "@/lib/data";
import { ReviewQueueItem } from "@/lib/types";

type SearchParams = Promise<{
  start?: string;
  end?: string;
}>;

export default async function ReviewPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const startDate = params.start ? new Date(params.start) : subDays(new Date(), 14);
  const endDate = params.end ? new Date(params.end) : new Date();

  const items = await getVocabByDateRange(formatISO(startOfDay(startDate)), formatISO(endOfDay(endDate)));
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
          Choose a date range and complete every card. Incorrect answers repeat until correct.
        </p>

        <section className="surface-card mt-6 p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-700">Session filter</p>
            <span className="badge-muted">{queueItems.length} cards loaded</span>
          </div>
          <form className="grid gap-3 sm:grid-cols-3" method="GET">
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
                Load review set
              </button>
            </div>
          </form>
        </section>

        <div className="mt-6">
          <ReviewSession items={queueItems} />
        </div>
      </main>
    </>
  );
}
