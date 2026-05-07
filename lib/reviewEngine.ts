import { ReviewAttempt, ReviewQueueItem } from "@/lib/types";

export type ReviewSessionState = {
  queue: ReviewQueueItem[];
  pendingRetries: ReviewQueueItem[];
  current: ReviewQueueItem | null;
  attempts: ReviewAttempt[];
  completedCount: number;
};

export function buildReviewSession(items: ReviewQueueItem[]): ReviewSessionState {
  return {
    queue: [...items],
    pendingRetries: [],
    current: items[0] ?? null,
    attempts: [],
    completedCount: 0,
  };
}

export function submitReviewAttempt(
  state: ReviewSessionState,
  attempt: ReviewAttempt,
): ReviewSessionState {
  const current = state.current;
  if (!current) {
    return state;
  }

  const remainingQueue = state.queue.slice(1);
  const retryQueue = [...state.pendingRetries];

  if (attempt.result === "incorrect") {
    retryQueue.push(current);
  }

  let nextCurrent = remainingQueue[0] ?? null;
  let nextQueue = remainingQueue;
  let nextRetries = retryQueue;

  if (!nextCurrent && retryQueue.length > 0) {
    nextQueue = [...retryQueue];
    nextRetries = [];
    nextCurrent = nextQueue[0];
  }

  return {
    queue: nextQueue,
    pendingRetries: nextRetries,
    current: nextCurrent,
    attempts: [...state.attempts, attempt],
    completedCount: state.completedCount + (attempt.result === "correct" ? 1 : 0),
  };
}

export function isReviewSessionComplete(state: ReviewSessionState): boolean {
  return !state.current && state.queue.length === 0 && state.pendingRetries.length === 0;
}
