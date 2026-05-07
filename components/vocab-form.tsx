"use client";

import { FormEvent, useState } from "react";

const partOptions = ["verb", "noun", "adjective", "adverb", "phrase", "other"] as const;

export function VocabForm() {
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState<(typeof partOptions)[number]>("verb");
  const [sourceContext, setSourceContext] = useState("");
  const [notes, setNotes] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichment, setEnrichment] = useState<Record<string, unknown> | null>(null);

  async function enrichWithAi() {
    setStatus(null);
    setIsEnriching(true);
    try {
      const response = await fetch("/api/ai/enrich-vocab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, translation, partOfSpeech }),
      });

      const payload = (await response.json()) as { enrichment?: Record<string, unknown> };
      if (!response.ok || !payload.enrichment) {
        setStatus("AI enrichment failed. You can still save manually.");
        return;
      }

      setEnrichment(payload.enrichment);
      if (typeof payload.enrichment.generatedExample === "string" && !exampleSentence) {
        setExampleSentence(payload.enrichment.generatedExample);
      }
      setStatus("AI suggestions loaded.");
    } catch {
      setStatus("AI enrichment failed. You can still save manually.");
    } finally {
      setIsEnriching(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/vocab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word,
          translation,
          partOfSpeech,
          sourceContext,
          notes,
          exampleSentence,
          aiEnrichment: enrichment ?? undefined,
        }),
      });

      if (!response.ok) {
        setStatus("Unable to save vocab item.");
        return;
      }

      setWord("");
      setTranslation("");
      setPartOfSpeech("verb");
      setSourceContext("");
      setNotes("");
      setExampleSentence("");
      setEnrichment(null);
      setStatus("Vocabulary saved and added to your review pool.");
    } catch {
      setStatus("Unable to save vocab item.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-700">Word</span>
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            value={word}
            onChange={(event) => setWord(event.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-700">Translation</span>
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            value={translation}
            onChange={(event) => setTranslation(event.target.value)}
            required
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm text-zinc-700">Part of speech</span>
        <select
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          value={partOfSpeech}
          onChange={(event) => setPartOfSpeech(event.target.value as (typeof partOptions)[number])}
        >
          {partOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-zinc-700">Source context</span>
        <input
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          value={sourceContext}
          onChange={(event) => setSourceContext(event.target.value)}
          placeholder="e.g. podcast, conversation, article"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-zinc-700">Example sentence</span>
        <input
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          value={exampleSentence}
          onChange={(event) => setExampleSentence(event.target.value)}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-zinc-700">Notes</span>
        <textarea
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50"
          type="button"
          onClick={enrichWithAi}
          disabled={isEnriching || !word || !translation}
        >
          {isEnriching ? "Generating..." : "AI enrich"}
        </button>
        <button
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save vocabulary"}
        </button>
      </div>

      {enrichment && (
        <pre className="overflow-x-auto rounded-lg bg-zinc-100 p-3 text-xs text-zinc-700">
          {JSON.stringify(enrichment, null, 2)}
        </pre>
      )}
      {status && <p className="text-sm text-zinc-600">{status}</p>}
    </form>
  );
}
