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
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
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
