export type PartOfSpeech =
  | "verb"
  | "noun"
  | "adjective"
  | "adverb"
  | "phrase"
  | "other";

export type ReviewResult = "correct" | "incorrect";

export type VocabItem = {
  id: string;
  user_id: string;
  word: string;
  translation: string;
  part_of_speech: PartOfSpeech;
  notes: string | null;
  source_context: string | null;
  example_sentence: string | null;
  ai_enrichment: Record<string, unknown> | null;
  created_at: string;
};

export type ReviewQueueItem = {
  vocabId: string;
  word: string;
  translation: string;
  partOfSpeech: PartOfSpeech;
};

export type ReviewAttempt = {
  vocabId: string;
  userAnswer: string;
  expectedAnswer: string;
  result: ReviewResult;
  responseTimeMs: number;
};

export type DashboardStats = {
  knownVerbs: number;
  verbGoal: number;
  activeReviewQueue: number;
  streakDays: number;
  grammarMasteryPct: number;
  retentionRatePct: number;
  avgAttemptsPerCorrect: number;
  weeklyStudyMinutes: number;
  weakestAreas: Array<{ tag: string; errorRatePct: number }>;
};
