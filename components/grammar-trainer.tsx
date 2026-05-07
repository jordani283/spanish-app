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
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-zinc-900">Grammar trainer</h2>
        <select
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
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
        <p className="mt-4 text-sm text-zinc-600">No prompts available for this topic yet.</p>
      ) : (
        <>
          <p className="mt-4 text-xs uppercase text-zinc-500">{topicLabels[current.topic] ?? current.topic}</p>
          <p className="mt-2 text-lg text-zinc-900">{current.prompt}</p>

          <form className="mt-4 flex gap-2" onSubmit={submitAttempt}>
            <input
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Type your answer"
              required
            />
            <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white" type="submit">
              Check
            </button>
          </form>
        </>
      )}

      {feedback && <p className="mt-3 text-sm text-zinc-700">{feedback}</p>}
      {hint && <p className="mt-1 text-sm text-zinc-500">Hint: {hint}</p>}
    </section>
  );
}
