/** Varsayılan yıllık bitirme hedefi */
export const DEFAULT_YEARLY_GAME_GOAL = 50;

export const MIN_YEARLY_GAME_GOAL = 1;
export const MAX_YEARLY_GAME_GOAL = 500;

export const clampYearlyGameGoal = (value: unknown) => {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return DEFAULT_YEARLY_GAME_GOAL;
  return Math.min(MAX_YEARLY_GAME_GOAL, Math.max(MIN_YEARLY_GAME_GOAL, n));
};

export const resolveYearlyGameGoal = (raw: unknown) => {
  if (raw == null || raw === "") return DEFAULT_YEARLY_GAME_GOAL;
  return clampYearlyGameGoal(raw);
};

export const yearlyGoalProgressPct = (done: number, goal: number) => {
  const g = Math.max(1, goal);
  return Math.min(100, Math.round((Math.max(0, done) / g) * 100));
};
