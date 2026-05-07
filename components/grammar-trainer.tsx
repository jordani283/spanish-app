"use client";

import { useMemo, useState } from "react";
import { GrammarPrompt } from "@/lib/data";

const topicLabels: Record<string, string> = {
  preterite_vs_imperfect: "Preterite vs imperfect",
  subjunctive_triggers: "Subjunctive triggers",
  por_vs_para: "Por vs para",
  object_pronouns: "Object pronouns",
  ser_estar: "Ser vs estar",
};

export function GrammarTrainer({ prompts }: { prompts: GrammarPrompt[] }) {
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [attemptsInRound, setAttemptsInRound] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (selectedTopic === "all") {
      return prompts;
    }
    return prompts.filter((prompt) => prompt.topic === selectedTopic);
  }, [prompts, selectedTopic]);

  const current = filtered[index] ?? null;

  async function submitAttempt(event: React.FormEvent) {
    event.preventDefault();
    if (!current) {
      return;
    }

    const response = await fetch("/api/grammar/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: current.id,
        topic: current.topic,
        answer,
        expectedAnswer: current.expectedAnswer,
        attemptsInRound,
      }),
    });

    const result = (await response.json()) as { isCorrect: boolean; feedback: string; hint?: string };
    setFeedback(result.feedback);
    setHint(result.hint ?? null);

    if (result.isCorrect) {
      setAnswer("");
      setHint(null);
      setFeedback("Correct. Nice work.");
      setAttemptsInRound(1);
      setIndex((previous) => (filtered.length === 0 ? 0 : (previous + 1) % filtered.length));
      return;
    }

    setAttemptsInRound((previous) => previous + 1);
  }

  return (
    <section className="surface-card p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Grammar trainer</h2>
          <p className="mt-1 text-xs text-slate-500">Type your answer. Hints appear after repeat misses.</p>
        </div>
        <select
          className="input-base min-h-11 max-w-[12rem] text-sm"
          value={selectedTopic}
          onChange={(event) => {
            setSelectedTopic(event.target.value);
            setIndex(0);
            setFeedback(null);
            setHint(null);
            setAnswer("");
            setAttemptsInRound(1);
          }}
        >
          <option value="all">All topics</option>
          {Object.entries(topicLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {!current ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          No prompts available for this topic yet.
        </p>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="badge-primary">{topicLabels[current.topic] ?? current.topic}</span>
            <span className="badge-muted">Attempt {attemptsInRound}</span>
          </div>
          <p className="mt-3 text-xl font-medium text-slate-900">{current.prompt}</p>

          <form
            className="sticky bottom-20 mt-5 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur sm:static sm:flex-row"
            onSubmit={submitAttempt}
          >
            <input
              className="input-base min-h-12 flex-1"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Type your answer"
              required
            />
            <button className="btn-primary w-full sm:w-auto" type="submit">
              Check answer
            </button>
          </form>
        </>
      )}

      {feedback && <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{feedback}</p>}
      {hint && <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">Hint: {hint}</p>}
    </section>
  );
}
