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
  const [wordStats, setWordStats] = useState<Record<string, { word: string; attempts: number; correct: number }>>({});

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

    setWordStats((previous) => {
      const existing = previous[current.vocabId] ?? {
        word: current.word,
        attempts: 0,
        correct: 0,
      };

      return {
        ...previous,
        [current.vocabId]: {
          ...existing,
          attempts: existing.attempts + 1,
          correct: existing.correct + (result === "correct" ? 1 : 0),
        },
      };
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
      <section className="surface-card p-6 sm:p-7">
        <h2 className="text-lg font-semibold text-slate-900">No reviews due for this range</h2>
        <p className="mt-2 text-sm text-slate-600">Expand your date range or add 10 new words to start seeing patterns.</p>
      </section>
    );
  }

  if (complete) {
    return (
      <section className="surface-card p-6 sm:p-7">
        <span className="badge-success">Completed</span>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Session complete</h2>
        <p className="mt-2 text-sm text-slate-600">
          You got {state.completedCount} answers correct and cleared the queue.
        </p>
      </section>
    );
  }

  const trackedStats = Object.values(wordStats).sort((a, b) => b.attempts - a.attempts);
  const uniqueTotal = items.length;
  const uniqueCorrect = state.completedCount;
  const totalAttempts = trackedStats.reduce((sum, stat) => sum + stat.attempts, 0);
  const totalCorrectAttempts = trackedStats.reduce((sum, stat) => sum + stat.correct, 0);

  return (
    <section className="surface-card p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge-primary">Current prompt</span>
        <span className="badge-muted capitalize">{current?.partOfSpeech}</span>
      </div>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{current?.word}</h2>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="badge-muted">
          Score: {uniqueCorrect}/{uniqueTotal} correct
        </span>
        <span className="badge-muted">
          Accuracy: {totalAttempts === 0 ? 0 : Math.round((totalCorrectAttempts / totalAttempts) * 100)}%
        </span>
        <span className="badge-muted">
          Queue: {state.queue.length} | Retries: {state.pendingRetries.length}
        </span>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
          style={{
            width: `${Math.max(5, Math.round((state.completedCount / Math.max(1, items.length)) * 100))}%`,
          }}
        />
      </div>

      <form
        className="sticky bottom-20 mt-6 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur sm:static sm:flex-row sm:items-center"
        onSubmit={handleSubmit}
      >
        <input
          className="input-base min-h-12 flex-1"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Type the meaning in English"
          required
        />
        <button className="btn-primary w-full sm:w-auto" type="submit">
          Check answer
        </button>
      </form>

      {lastFeedback && <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{lastFeedback}</p>}

      {trackedStats.length > 0 && (
        <section className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
          <h3 className="text-sm font-semibold text-slate-800">Per-verb performance (this session)</h3>
          <ul className="mt-2 space-y-1.5">
            {trackedStats.slice(0, 8).map((stat) => {
              const fails = stat.attempts - stat.correct;
              return (
                <li key={stat.word} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs sm:text-sm">
                  <span className="font-medium text-slate-700">{stat.word}</span>
                  <span className="text-slate-600">
                    {stat.correct}/{stat.attempts} correct {fails > 0 ? `(${fails} failed)` : "(mastered first try)"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </section>
  );
}
