export type SrsUpdateInput = {
  currentIntervalDays: number | null;
  previousFailuresInRow: number;
  wasCorrect: boolean;
};

export type SrsUpdateResult = {
  nextIntervalDays: number;
  nextDueAt: Date;
  failuresInRow: number;
};

const INTERVAL_STEPS = [1, 3, 7, 14, 30, 45, 60, 90];

function clampInterval(interval: number): number {
  if (interval < INTERVAL_STEPS[0]) {
    return INTERVAL_STEPS[0];
  }

  if (interval > INTERVAL_STEPS[INTERVAL_STEPS.length - 1]) {
    return INTERVAL_STEPS[INTERVAL_STEPS.length - 1];
  }

  return interval;
}

function getNextStep(interval: number): number {
  const currentIndex = INTERVAL_STEPS.findIndex((step) => step >= interval);
  if (currentIndex === -1) {
    return INTERVAL_STEPS[INTERVAL_STEPS.length - 1];
  }

  return INTERVAL_STEPS[Math.min(currentIndex + 1, INTERVAL_STEPS.length - 1)];
}

export function calculateNextReview(input: SrsUpdateInput): SrsUpdateResult {
  const now = new Date();
  let nextIntervalDays = 1;
  let failuresInRow = input.previousFailuresInRow;

  if (input.wasCorrect) {
    failuresInRow = 0;
    const normalized = clampInterval(input.currentIntervalDays ?? 1);
    nextIntervalDays = getNextStep(normalized);
  } else {
    failuresInRow = input.previousFailuresInRow + 1;
    nextIntervalDays = failuresInRow > 2 ? 1 : 3;
  }

  const nextDueAt = new Date(now);
  nextDueAt.setDate(nextDueAt.getDate() + nextIntervalDays);

  return {
    nextIntervalDays,
    nextDueAt,
    failuresInRow,
  };
}
