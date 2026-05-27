export function computeDaysStreak(finishedAt: (string | Date)[]): number {
  if (finishedAt.length === 0) return 0;
  const days = new Set(
    finishedAt
      .map((d) => (typeof d === "string" ? new Date(d) : d))
      .filter((d) => !Number.isNaN(d.getTime()))
      .map((d) => d.toISOString().slice(0, 10)),
  );
  if (days.size === 0) return 0;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  let cursor: Date;
  if (days.has(today.toISOString().slice(0, 10))) cursor = today;
  else if (days.has(yesterday.toISOString().slice(0, 10))) cursor = yesterday;
  else return 0;

  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
