import { differenceInCalendarDays, isWithinInterval, subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { DashboardStats, PartOfSpeech, ReviewResult, VocabItem } from "@/lib/types";

type NewVocabInput = {
  word: string;
  translation: string;
  partOfSpeech: PartOfSpeech;
  notes?: string;
  sourceContext?: string;
  exampleSentence?: string;
  aiEnrichment?: Record<string, unknown>;
};

export type GrammarPrompt = {
  id: string;
  topic: string;
  prompt: string;
  expectedAnswer: string;
  hint: string;
  explanation: string;
};

export type GrammarAttemptResult = {
  isCorrect: boolean;
  feedback: string;
  hint?: string;
};

export type ReviewMode = "due" | "new" | "weak" | "advanced";

const DEMO_USER_ID = "demo-user";

let demoVocab: VocabItem[] = [];

const demoGrammarPrompts: GrammarPrompt[] = [
  {
    id: "g-1",
    topic: "preterite_vs_imperfect",
    prompt: "Ayer yo ___ (estudiar) dos horas.",
    expectedAnswer: "estudie",
    hint: "Completed action with a specific time marker.",
    explanation: "Use preterite for completed actions in a defined timeframe.",
  },
  {
    id: "g-2",
    topic: "por_vs_para",
    prompt: "Este regalo es ___ ti.",
    expectedAnswer: "para",
    hint: "Think destination or intended recipient.",
    explanation: "Use para for destination, recipient, and purpose.",
  },
];

function canUseSupabase() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function getUserId(): Promise<string> {
  if (!canUseSupabase()) {
    return DEMO_USER_ID;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return DEMO_USER_ID;
  }

  return data.user.id;
}

export async function addVocabItem(input: NewVocabInput): Promise<VocabItem> {
  const userId = await getUserId();

  if (!canUseSupabase() || userId === DEMO_USER_ID) {
    const newItem: VocabItem = {
      id: crypto.randomUUID(),
      user_id: DEMO_USER_ID,
      word: input.word,
      translation: input.translation,
      part_of_speech: input.partOfSpeech,
      notes: input.notes ?? null,
      source_context: input.sourceContext ?? null,
      example_sentence: input.exampleSentence ?? null,
      ai_enrichment: input.aiEnrichment ?? null,
      created_at: new Date().toISOString(),
    };

    demoVocab = [newItem, ...demoVocab];
    return newItem;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vocab_items")
    .insert({
      user_id: userId,
      word: input.word,
      translation: input.translation,
      part_of_speech: input.partOfSpeech,
      notes: input.notes ?? null,
      source_context: input.sourceContext ?? null,
      example_sentence: input.exampleSentence ?? null,
      ai_enrichment: input.aiEnrichment ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to save vocabulary item");
  }

  return data as VocabItem;
}

export async function getVocabByDateRange(start: string, end: string): Promise<VocabItem[]> {
  const userId = await getUserId();
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (!canUseSupabase() || userId === DEMO_USER_ID) {
    return demoVocab.filter((item) =>
      isWithinInterval(new Date(item.created_at), { start: startDate, end: endDate }),
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vocab_items")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .order("created_at", { ascending: true });

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to load vocabulary range");
  }

  return data as VocabItem[];
}

export async function getReviewItemsForMode(input: {
  mode: ReviewMode;
  start?: string;
  end?: string;
}): Promise<VocabItem[]> {
  const userId = await getUserId();

  if (!canUseSupabase() || userId === DEMO_USER_ID) {
    return demoVocab;
  }

  if (input.mode === "advanced") {
    if (!input.start || !input.end) {
      return [];
    }
    return getVocabByDateRange(input.start, input.end);
  }

  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [itemsResponse, progressResponse, reviewsResponse] = await Promise.all([
    supabase
      .from("vocab_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    supabase.from("vocab_progress").select("vocab_item_id,next_due_at").eq("user_id", userId),
    supabase
      .from("vocab_reviews")
      .select("vocab_item_id,result,reviewed_at")
      .eq("user_id", userId)
      .order("reviewed_at", { ascending: false })
      .limit(5000),
  ]);

  if (itemsResponse.error || !itemsResponse.data) {
    throw new Error(itemsResponse.error?.message ?? "Unable to load vocab items");
  }

  const items = itemsResponse.data as VocabItem[];
  const progressRows = progressResponse.data ?? [];
  const reviewsRows = reviewsResponse.data ?? [];

  const progressMap = new Map<string, string | null>();
  progressRows.forEach((row) => {
    progressMap.set(row.vocab_item_id, row.next_due_at);
  });

  const reviewStats = new Map<string, { attempts: number; incorrect: number }>();
  reviewsRows.forEach((row) => {
    const existing = reviewStats.get(row.vocab_item_id) ?? { attempts: 0, incorrect: 0 };
    existing.attempts += 1;
    if (row.result !== "correct") {
      existing.incorrect += 1;
    }
    reviewStats.set(row.vocab_item_id, existing);
  });

  if (input.mode === "new") {
    return items.filter((item) => !reviewStats.has(item.id));
  }

  if (input.mode === "weak") {
    const weakCandidates = items
      .map((item) => {
        const stats = reviewStats.get(item.id);
        if (!stats || stats.attempts === 0) {
          return null;
        }
        const errorRate = stats.incorrect / stats.attempts;
        return {
          item,
          attempts: stats.attempts,
          incorrect: stats.incorrect,
          errorRate,
        };
      })
      .filter((entry): entry is { item: VocabItem; attempts: number; incorrect: number; errorRate: number } => Boolean(entry))
      .filter((entry) => entry.attempts >= 2 && entry.errorRate >= 0.4)
      .sort((a, b) => b.errorRate - a.errorRate || b.incorrect - a.incorrect || b.attempts - a.attempts);

    if (weakCandidates.length > 0) {
      return weakCandidates.map((entry) => entry.item);
    }
  }

  // Default mode: due
  return items.filter((item) => {
    const nextDueAt = progressMap.get(item.id);
    if (!nextDueAt) {
      return true;
    }
    return nextDueAt <= nowIso;
  });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const userId = await getUserId();
  const sevenDaysAgo = subDays(new Date(), 7);

  if (!canUseSupabase() || userId === DEMO_USER_ID) {
    return {
      knownVerbs: 0,
      verbGoal: 500,
      activeReviewQueue: 0,
      streakDays: 0,
      grammarMasteryPct: 0,
      retentionRatePct: 0,
      avgAttemptsPerCorrect: 0,
      weeklyStudyMinutes: 0,
      weakestAreas: [],
    };
  }

  const supabase = await createClient();

  const [
    verbsResponse,
    progressResponse,
    correctReviewsResponse,
    attemptsResponse,
    grammarResponse,
  ] =
    await Promise.all([
      supabase
        .from("vocab_items")
        .select("id")
        .eq("user_id", userId)
        .eq("part_of_speech", "verb"),
      supabase
        .from("vocab_progress")
        .select("vocab_item_id,next_due_at")
        .eq("user_id", userId)
        .not("vocab_item_id", "is", null),
      supabase
        .from("vocab_reviews")
        .select("vocab_item_id")
        .eq("user_id", userId)
        .eq("result", "correct"),
      supabase
        .from("vocab_reviews")
        .select("result, reviewed_at, attempts_in_round")
        .eq("user_id", userId)
        .gte("reviewed_at", sevenDaysAgo.toISOString()),
      supabase
        .from("grammar_attempts")
        .select("topic, is_correct, attempted_at")
        .eq("user_id", userId)
        .gte("attempted_at", sevenDaysAgo.toISOString()),
    ]);

  const verbs = verbsResponse.data ?? [];
  const verbIds = new Set(verbs.map((row) => row.id));
  const progressRows = progressResponse.data ?? [];
  const nowIso = new Date().toISOString();

  const seenVerbIds = new Set(progressRows.map((row) => row.vocab_item_id));
  const dueVerbIds = new Set(
    progressRows
      .filter((row) => row.next_due_at && row.next_due_at <= nowIso)
      .map((row) => row.vocab_item_id),
  );
  const unseenVerbIds = [...verbIds].filter((id) => !seenVerbIds.has(id));

  const correctVerbIds = new Set(
    (correctReviewsResponse.data ?? [])
      .map((row) => row.vocab_item_id)
      .filter((id) => verbIds.has(id)),
  );

  const attempts = attemptsResponse.data ?? [];
  const grammarAttempts = grammarResponse.data ?? [];

  const correctCount = attempts.filter((attempt) => attempt.result === "correct").length;
  const retentionRatePct = attempts.length === 0 ? 0 : Math.round((correctCount / attempts.length) * 100);

  const avgAttemptsPerCorrectRaw = attempts
    .filter((attempt) => attempt.result === "correct")
    .map((attempt) => Number(attempt.attempts_in_round ?? 1));
  const avgAttemptsPerCorrect =
    avgAttemptsPerCorrectRaw.length === 0
      ? 0
      : Number(
          (
            avgAttemptsPerCorrectRaw.reduce((sum, value) => sum + value, 0) /
            avgAttemptsPerCorrectRaw.length
          ).toFixed(1),
        );

  const activeDays = new Set(
    attempts.map((attempt) => new Date(attempt.reviewed_at).toDateString()),
  ).size;

  const weakestMap = new Map<string, { total: number; incorrect: number }>();
  grammarAttempts.forEach((attempt) => {
    const existing = weakestMap.get(attempt.topic) ?? { total: 0, incorrect: 0 };
    existing.total += 1;
    if (!attempt.is_correct) {
      existing.incorrect += 1;
    }
    weakestMap.set(attempt.topic, existing);
  });

  const weakestAreas = [...weakestMap.entries()]
    .map(([topic, values]) => ({
      tag: topic,
      errorRatePct: values.total === 0 ? 0 : Math.round((values.incorrect / values.total) * 100),
    }))
    .sort((a, b) => b.errorRatePct - a.errorRatePct)
    .slice(0, 3);

  return {
    knownVerbs: correctVerbIds.size,
    verbGoal: verbIds.size,
    activeReviewQueue: dueVerbIds.size + unseenVerbIds.length,
    streakDays: activeDays,
    grammarMasteryPct:
      grammarAttempts.length === 0
        ? 0
        : Math.round(
            (grammarAttempts.filter((attempt) => attempt.is_correct).length / grammarAttempts.length) * 100,
          ),
    retentionRatePct,
    avgAttemptsPerCorrect,
    weeklyStudyMinutes: activeDays * 30,
    weakestAreas,
  };
}

export async function getGrammarPrompts(topic?: string): Promise<GrammarPrompt[]> {
  const userId = await getUserId();

  if (!canUseSupabase() || userId === DEMO_USER_ID) {
    return topic ? demoGrammarPrompts.filter((item) => item.topic === topic) : demoGrammarPrompts;
  }

  const supabase = await createClient();
  let query = supabase
    .from("grammar_questions")
    .select("id, topic, prompt, expected_answer, hint, explanation")
    .eq("is_active", true)
    .limit(20);

  if (topic) {
    query = query.eq("topic", topic);
  }

  const { data, error } = await query;

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to load grammar prompts");
  }

  return data.map((row) => ({
    id: row.id,
    topic: row.topic,
    prompt: row.prompt,
    expectedAnswer: row.expected_answer,
    hint: row.hint,
    explanation: row.explanation,
  }));
}

export async function submitGrammarAttempt(input: {
  questionId: string;
  topic: string;
  answer: string;
  expectedAnswer: string;
  attemptsInRound: number;
}): Promise<GrammarAttemptResult> {
  const userId = await getUserId();
  const normalizedAnswer = input.answer.trim().toLowerCase();
  const normalizedExpected = input.expectedAnswer.trim().toLowerCase();
  const isCorrect = normalizedAnswer === normalizedExpected;

  if (canUseSupabase() && userId !== DEMO_USER_ID) {
    const supabase = await createClient();
    await supabase.from("grammar_attempts").insert({
      user_id: userId,
      question_id: input.questionId,
      topic: input.topic,
      answer: input.answer,
      expected_answer: input.expectedAnswer,
      is_correct: isCorrect,
      attempts_in_round: input.attemptsInRound,
      attempted_at: new Date().toISOString(),
    });
  }

  if (isCorrect) {
    return {
      isCorrect: true,
      feedback: "Correct. Great recall and form.",
    };
  }

  if (input.attemptsInRound < 2) {
    return {
      isCorrect: false,
      feedback: "Not quite. Try once more before showing a hint.",
    };
  }

  const selectedPrompt = demoGrammarPrompts.find((prompt) => prompt.id === input.questionId);
  return {
    isCorrect: false,
    feedback: "Still incorrect. Review the hint and try again.",
    hint: selectedPrompt?.hint ?? "Check tense, agreement, and trigger words carefully.",
  };
}

export async function recordVocabReview(input: {
  vocabId: string;
  result: ReviewResult;
  userAnswer: string;
  expectedAnswer: string;
  responseTimeMs: number;
  attemptsInRound: number;
  nextDueAt: string;
  nextIntervalDays: number;
  failuresInRow: number;
}) {
  const userId = await getUserId();
  if (!canUseSupabase() || userId === DEMO_USER_ID) {
    return;
  }

  const supabase = await createClient();

  await supabase.from("vocab_reviews").insert({
    user_id: userId,
    vocab_item_id: input.vocabId,
    result: input.result,
    user_answer: input.userAnswer,
    expected_answer: input.expectedAnswer,
    response_time_ms: input.responseTimeMs,
    attempts_in_round: input.attemptsInRound,
    reviewed_at: new Date().toISOString(),
  });

  await supabase.from("vocab_progress").upsert(
    {
      user_id: userId,
      vocab_item_id: input.vocabId,
      next_due_at: input.nextDueAt,
      current_interval_days: input.nextIntervalDays,
      failures_in_row: input.failuresInRow,
      last_reviewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,vocab_item_id" },
  );
}

export async function getVocabProgress(vocabId: string): Promise<{
  currentIntervalDays: number | null;
  failuresInRow: number;
}> {
  const userId = await getUserId();
  if (!canUseSupabase() || userId === DEMO_USER_ID) {
    return { currentIntervalDays: 1, failuresInRow: 0 };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("vocab_progress")
    .select("current_interval_days, failures_in_row")
    .eq("user_id", userId)
    .eq("vocab_item_id", vocabId)
    .maybeSingle();

  return {
    currentIntervalDays: data?.current_interval_days ?? 1,
    failuresInRow: data?.failures_in_row ?? 0,
  };
}

export function computeStreakFromDates(dates: Date[]): number {
  const uniqueDays = [...new Set(dates.map((date) => date.toDateString()))]
    .map((value) => new Date(value))
    .sort((a, b) => a.getTime() - b.getTime());

  if (uniqueDays.length === 0) {
    return 0;
  }

  let streak = 1;
  for (let i = uniqueDays.length - 1; i > 0; i -= 1) {
    const delta = differenceInCalendarDays(uniqueDays[i], uniqueDays[i - 1]);
    if (delta === 1) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}
