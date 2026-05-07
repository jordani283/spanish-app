import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getVocabProgress, recordVocabReview } from "@/lib/data";
import { calculateNextReview } from "@/lib/srsScheduler";

const attemptSchema = z.object({
  vocabId: z.string().min(1),
  userAnswer: z.string().min(1),
  expectedAnswer: z.string().min(1),
  result: z.enum(["correct", "incorrect"]),
  responseTimeMs: z.number().min(0),
  attemptsInRound: z.number().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = attemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const progress = await getVocabProgress(parsed.data.vocabId);
  const srs = calculateNextReview({
    currentIntervalDays: progress.currentIntervalDays,
    previousFailuresInRow: progress.failuresInRow,
    wasCorrect: parsed.data.result === "correct",
  });

  await recordVocabReview({
    ...parsed.data,
    nextDueAt: srs.nextDueAt.toISOString(),
    nextIntervalDays: srs.nextIntervalDays,
    failuresInRow: srs.failuresInRow,
  });

  return NextResponse.json({ schedule: srs });
}
