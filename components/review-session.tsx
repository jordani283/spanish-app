"use client";

import { useMemo, useState } from "react";
import { buildReviewSession, isReviewSessionComplete, submitReviewAttempt } from "@/lib/reviewEngine";
import { ReviewQueueItem } from "@/lib/types";

type Props = {
  items: ReviewQueueItem[];
};

export function ReviewSession({ items }: Props) {
  const initial = useMemo(() => buildReviewSession(items), [items]);
  const [state, setState] = useState(initial);
  const [answer, setAnswer] = useState("");
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [attemptsThisRound, setAttemptsThisRound] = useState(1);
  const [startedAt, setStartedAt] = useState(() => Date.now());

  const current = state.current;
  const complete = isReviewSessionComplete(state);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!current) {
      return;
    }

    const normalizedAnswer = answer.trim().toLowerCase();
    const expected = current.translation.trim().toLowerCase();
    const result = normalizedAnswer === expected ? "correct" : "incorrect";
    const responseTimeMs = Date.now() - startedAt;

    await fetch("/api/review/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vocabId: current.vocabId,
        userAnswer: answer.trim(),
        expectedAnswer: current.translation,
        result,
        responseTimeMs,
        attemptsInRound: attemptsThisRound,
      }),
    });

    const nextState = submitReviewAttempt(state, {
      vocabId: current.vocabId,
      userAnswer: answer.trim(),
      expectedAnswer: current.translation,
      result,
      responseTimeMs,
    });

    setState(nextState);
    setLastFeedback(
      result === "correct" ? "Correct. Moving to next item." : "Incorrect. This card will repeat later in this session.",
    );
    setAnswer("");
    setStartedAt(Date.now());
    setAttemptsThisRound(result === "correct" ? 1 : attemptsThisRound + 1);
  }

  if (items.length === 0) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <p className="text-sm text-zinc-600">No vocabulary in this date range. Expand your range and try again.</p>
      </section>
    );
  }

  if (complete) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-zinc-900">Session complete</h2>
        <p className="mt-2 text-sm text-zinc-600">
          You got {state.completedCount} answers correct and cleared the queue.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <p className="text-xs uppercase text-zinc-500">Current prompt</p>
      <h2 className="mt-2 text-2xl font-semibold text-zinc-900">{current?.word}</h2>
      <p className="mt-1 text-sm text-zinc-500">{current?.partOfSpeech}</p>

      <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
        <input
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Type the meaning in English"
          required
        />
        <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white" type="submit">
          Check
        </button>
      </form>

      {lastFeedback && <p className="mt-3 text-sm text-zinc-600">{lastFeedback}</p>}
      <p className="mt-4 text-xs text-zinc-500">
        Remaining queue: {state.queue.length} | Pending retries: {state.pendingRetries.length}
      </p>
    </section>
  );
}
