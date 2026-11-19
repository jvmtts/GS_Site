
export function mergeQuizResult(current, guideId, score, total, when) {
  if (!guideId || !Number.isInteger(total) || total < 1 ||
      !Number.isInteger(score) || score < 0 || score > total) {
    return current;
  }
  const previous = current[guideId];
  const sameQuestionCount = previous?.total === total;
  return {
    ...current,
    [guideId]: {
      best: Math.max(score, sameQuestionCount ? previous.best : 0),
      latest: score,
      total,
      attempts: (previous?.attempts ?? 0) + 1,
      lastCompletedAt: when,
    },
  };
}

export function normalizeDisplayName(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
}
