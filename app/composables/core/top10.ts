/** grid = kart · list = sıralı · wallpaper = 3×3 ekran/duvar kağıdı */
export type Top10DisplayMode = "grid" | "list" | "wallpaper";

export type Top10GameEntry = {
  rank: number;
  id: number;
  name: string;
  slug: string;
  background_image: string | null;
  /** IGDB dikey poster — kart/export için tercih */
  cover_image?: string | null;
  released?: string;
  metacritic?: number | null;
  genres?: { id: number; name: string; slug: string }[];
};

export type UserTop10List = {
  uid: string;
  username: string;
  slug: string;
  title: string;
  displayMode: Top10DisplayMode;
  games: Top10GameEntry[];
  gameCount: number;
  isPublic: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
  viewCount?: number;
};

export const TOP10_COLLECTION = "user_top10_lists";
/** Top 9 — 3×3 wallpaper / ekran görünümü için ideal */
export const TOP10_MAX_GAMES = 9;
export const TOP10_MIN_SHARE = 9;

export const snapshotTop10Game = (game: any, rank: number): Top10GameEntry => ({
  rank,
  id: game.id,
  name: game.name,
  slug: game.slug ?? game.name?.toLowerCase().replace(/\s+/g, "-") ?? String(game.id),
  background_image: game.background_image ?? game.cover_image ?? null,
  cover_image: game.cover_image ?? game.background_image ?? null,
  released: game.released,
  metacritic: game.metacritic ?? null,
  genres: (game.genres ?? []).map((g: any) => ({
    id: g.id,
    name: g.name,
    slug: g.slug,
  })),
});

/** Top 9 / paylaşım kartı görseli — poster öncelikli */
export const resolveTop10Cover = (game: {
  cover_image?: string | null;
  background_image?: string | null;
} | null | undefined): string | null =>
  game?.cover_image || game?.background_image || null;
