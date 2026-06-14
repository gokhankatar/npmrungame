export type Top10DisplayMode = "grid" | "list";

export type Top10GameEntry = {
  rank: number;
  id: number;
  name: string;
  slug: string;
  background_image: string | null;
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
export const TOP10_MAX_GAMES = 10;
export const TOP10_MIN_SHARE = 10;

export const snapshotTop10Game = (game: any, rank: number): Top10GameEntry => ({
  rank,
  id: game.id,
  name: game.name,
  slug: game.slug ?? game.name?.toLowerCase().replace(/\s+/g, "-") ?? String(game.id),
  background_image: game.background_image ?? null,
  released: game.released,
  metacritic: game.metacritic ?? null,
  genres: (game.genres ?? []).map((g: any) => ({
    id: g.id,
    name: g.name,
    slug: g.slug,
  })),
});
