export interface UpcomingGame {
  firestoreId: string;
  name: string;
  releaseDate: string;
  background_image?: string | null;
  rawgId?: number | null;
}

export interface CountdownChip {
  text: string;
  color: string;
  icon: string;
}

export const UPCOMING_GAMES_COLLECTION = "upcoming_games";

export const parseReleaseDate = (value: string) => {
  const isoDay = value.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDay)) {
    const [y, m, d] = isoDay.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(NaN) : parsed;
};

/** released veya releaseDate alanından çıkış günü */
export const resolveGameReleaseIso = (item: {
  released?: string | null;
  releaseDate?: string | null;
} | null | undefined): string | null => {
  const raw = item?.releaseDate || item?.released || null;
  if (!raw || raw === "TBA") return null;
  const d = parseReleaseDate(String(raw));
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const formatReleaseDate = (value: string) =>
  parseReleaseDate(value).toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const getDateParts = (value: string) => {
  const date = parseReleaseDate(value);
  return {
    day: date.getDate().toString().padStart(2, "0"),
    month: date.toLocaleDateString("tr-TR", { month: "short" }).toUpperCase(),
    year: date.getFullYear().toString(),
  };
};

export const getCountdownChip = (value: string): CountdownChip => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const release = parseReleaseDate(value);
  release.setHours(0, 0, 0, 0);
  const diffDays = Math.round((release.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) {
    return { text: `${Math.abs(diffDays)} gün önce çıktı`, color: "grey", icon: "mdi-check" };
  }
  if (diffDays === 0) {
    return { text: "Bugün çıkıyor", color: "warning", icon: "mdi-star" };
  }
  if (diffDays <= 30) {
    return { text: `${diffDays} gün kaldı`, color: "warning", icon: "mdi-timer-sand" };
  }
  return { text: `${diffDays} gün kaldı`, color: "grey-darken-1", icon: "mdi-calendar-clock" };
};

export const getCountdownHeadline = (value: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const release = parseReleaseDate(value);
  release.setHours(0, 0, 0, 0);
  const diffDays = Math.round((release.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) return { value: String(Math.abs(diffDays)), unit: "gün önce çıktı" };
  if (diffDays === 0) return { value: "Bugün", unit: "çıkıyor" };
  return { value: String(diffDays), unit: "gün kaldı" };
};

/** Çıkış günü yerel 00:00 */
export const getReleaseMidnight = (value: string) => {
  const release = parseReleaseDate(value);
  release.setHours(0, 0, 0, 0);
  return release;
};

export const getCalendarDaysUntilRelease = (value: string, now = new Date()) => {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const release = getReleaseMidnight(value);
  return Math.round((release.getTime() - today.getTime()) / 86400000);
};

export const getMsUntilReleaseMidnight = (value: string, now = new Date()) =>
  getReleaseMidnight(value).getTime() - now.getTime();

/** 2 gün veya daha az + henüz 00:00 gelmemiş → canlı countdown */
export const shouldShowLiveReleaseCountdown = (
  value: string,
  now = new Date()
) => {
  const ms = getMsUntilReleaseMidnight(value, now);
  const days = getCalendarDaysUntilRelease(value, now);
  return ms > 0 && days <= 2;
};

export type LiveCountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
};

export const getLiveCountdownParts = (
  value: string,
  now = new Date()
): LiveCountdownParts | null => {
  const totalMs = getMsUntilReleaseMidnight(value, now);
  if (totalMs <= 0) return null;
  const totalSec = Math.floor(totalMs / 1000);
  return {
    totalMs,
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
};

export const pad2 = (n: number) => String(n).padStart(2, "0");

export const sortByReleaseDate = (games: UpcomingGame[]) =>
  [...games].sort(
    (a, b) => parseReleaseDate(a.releaseDate).getTime() - parseReleaseDate(b.releaseDate).getTime()
  );

export const findNextUpcoming = (games: UpcomingGame[]) => {
  const sorted = sortByReleaseDate(games);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return sorted.find((g) => parseReleaseDate(g.releaseDate).getTime() >= today.getTime()) ?? sorted[0] ?? null;
};

export const countReleasingWithinDays = (games: UpcomingGame[], days: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limit = today.getTime() + days * 86400000;
  return games.filter((g) => {
    const t = parseReleaseDate(g.releaseDate).getTime();
    return t >= today.getTime() && t <= limit;
  }).length;
};

export const countReleasingThisYear = (games: UpcomingGame[]) => {
  const year = new Date().getFullYear();
  return games.filter((g) => parseReleaseDate(g.releaseDate).getFullYear() === year).length;
};
