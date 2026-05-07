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
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Review vocabulary</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Choose a date range and complete every card. Incorrect answers repeat until correct.
        </p>

        <form className="mt-6 grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 md:grid-cols-3" method="GET">
          <label className="text-sm">
            <span className="mb-1 block text-zinc-600">Start date</span>
            <input
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              type="date"
              name="start"
              defaultValue={formatISO(startDate, { representation: "date" })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-zinc-600">End date</span>
            <input
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
              type="date"
              name="end"
              defaultValue={formatISO(endDate, { representation: "date" })}
            />
          </label>
          <div className="flex items-end">
            <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white" type="submit">
              Load review set
            </button>
          </div>
        </form>

        <div className="mt-6">
          <ReviewSession items={queueItems} />
        </div>
      </main>
    </>
  );
}
