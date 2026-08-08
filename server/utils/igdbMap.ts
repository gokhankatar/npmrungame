import { igdbImageUrl, unixToIsoDate } from "./igdb";
import { EXCLUDED_THEME_IDS } from "./igdbFilters";

type IgdbNamed = { id?: number; name?: string; slug?: string };
type IgdbCover = { image_id?: string };
type IgdbScreenshot = { image_id?: string };
type IgdbWebsite = { category?: number; url?: string };
type IgdbInvolvedCompany = {
  developer?: boolean;
  publisher?: boolean;
  company?: { name?: string };
};

export type IgdbGame = {
  id: number;
  name?: string;
  slug?: string;
  summary?: string;
  storyline?: string;
  url?: string;
  first_release_date?: number;
  aggregated_rating?: number;
  aggregated_rating_count?: number;
  rating?: number;
  total_rating?: number;
  cover?: IgdbCover;
  genres?: IgdbNamed[];
  themes?: IgdbNamed[];
  platforms?: IgdbNamed[];
  screenshots?: IgdbScreenshot[];
  websites?: IgdbWebsite[];
  involved_companies?: IgdbInvolvedCompany[];
  keywords?: IgdbNamed[];
  game_modes?: IgdbNamed[];
  player_perspectives?: IgdbNamed[];
};

/** IGDB website category → mağaza adı */
const WEBSITE_STORE_MAP: Record<number, string> = {
  1: "Official",
  13: "Steam",
  16: "Epic Games",
  17: "GOG",
  22: "itch.io",
  14: "Reddit",
  10: "YouTube",
  18: "Discord",
  4: "Facebook",
  5: "Twitter",
  6: "Twitch",
  9: "Wikipedia",
};

const slugifyName = (value?: string) =>
  (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const mapGenres = (genres?: IgdbNamed[]) =>
  (genres ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    slug: g.slug ?? slugifyName(g.name),
  }));

const mapPlatforms = (platforms?: IgdbNamed[]) =>
  (platforms ?? []).map((p) => ({
    platform: {
      id: p.id,
      name: p.name,
      slug: p.slug ?? slugifyName(p.name),
    },
  }));

const mapTags = (game: IgdbGame) => {
  const tags = [
    ...(game.themes ?? []),
    ...(game.keywords ?? []),
    ...(game.game_modes ?? []),
    ...(game.player_perspectives ?? []),
  ];

  return tags.map((t, index) => ({
    id: t.id ?? index,
    name: t.name,
    slug: t.slug ?? slugifyName(t.name),
  }));
};

const mapStores = (websites?: IgdbWebsite[]) => {
  const storeCategories = new Set([13, 16, 17, 22]);
  return (websites ?? [])
    .filter((w) => w.category != null && storeCategories.has(w.category) && w.url)
    .map((w, index) => ({
      id: index,
      url: w.url,
      store: {
        id: w.category,
        name: WEBSITE_STORE_MAP[w.category!] ?? "Store",
        slug: slugifyName(WEBSITE_STORE_MAP[w.category!] ?? "store"),
        image_background: null,
      },
    }));
};

const pickOfficialWebsite = (websites?: IgdbWebsite[]) => {
  const official = (websites ?? []).find((w) => w.category === 1 && w.url);
  return official?.url ?? null;
};

const mapCompanies = (game: IgdbGame, role: "developer" | "publisher") =>
  (game.involved_companies ?? [])
    .filter((c) => (role === "developer" ? c.developer : c.publisher) && c.company?.name)
    .map((c, index) => ({
      id: index,
      name: c.company!.name!,
    }));

const metacriticFromIgdb = (game: IgdbGame) => {
  const score = game.aggregated_rating ?? game.total_rating ?? null;
  if (score == null) return null;
  return Math.round(score);
};

/** Frontend'in beklediği RAWG-benzeri oyun objesi */
export const mapIgdbGameToRawgShape = (game: IgdbGame, detailed = false) => {
  const background =
    igdbImageUrl(game.cover?.image_id, "cover_big_2x") ??
    igdbImageUrl(game.screenshots?.[0]?.image_id, "screenshot_huge");

  const base: Record<string, any> = {
    id: game.id,
    igdbId: game.id,
    source: "igdb",
    slug: game.slug ?? slugifyName(game.name),
    name: game.name ?? "Unknown",
    released: unixToIsoDate(game.first_release_date),
    background_image: background,
    metacritic: metacriticFromIgdb(game),
    rating: game.rating != null ? Number((game.rating / 20).toFixed(2)) : null,
    genres: mapGenres(game.genres),
    platforms: mapPlatforms(game.platforms),
    tags: mapTags(game),
    short_screenshots: (game.screenshots ?? []).slice(0, 8).map((s, index) => ({
      id: index,
      image: igdbImageUrl(s.image_id, "screenshot_big"),
    })),
    playtime: null,
    parent_platforms: mapPlatforms(game.platforms).map((p) => ({
      platform: p.platform,
    })),
  };

  if (!detailed) return base;

  const descriptionParts = [game.summary, game.storyline].filter(Boolean);
  const descriptionHtml = descriptionParts
    .map((p) => `<p>${String(p).replace(/\n+/g, "</p><p>")}</p>`)
    .join("");

  return {
    ...base,
    description: descriptionHtml || null,
    description_raw: descriptionParts.join("\n\n") || null,
    website: pickOfficialWebsite(game.websites) ?? game.url ?? null,
    metacritic_url: null,
    developers: mapCompanies(game, "developer"),
    publishers: mapCompanies(game, "publisher"),
    stores: mapStores(game.websites),
  };
};

export const mapIgdbScreenshots = (game: IgdbGame) =>
  (game.screenshots ?? []).map((s, index) => ({
    id: index,
    image: igdbImageUrl(s.image_id, "screenshot_huge"),
  }));

/** Erotik / excluded theme içeren oyunları listeden düş */
export const isSafeForPublicCatalog = (game: IgdbGame) => {
  const themeIds = new Set((game.themes ?? []).map((t) => t.id).filter(Boolean));
  return !EXCLUDED_THEME_IDS.some((id) => themeIds.has(id));
};
