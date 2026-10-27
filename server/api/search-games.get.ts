import { igdbFetch, IGDB_LIST_FIELDS } from "../utils/igdb";
import {
  mapIgdbGameToRawgShape,
  isSafeForPublicCatalog,
  type IgdbGame,
} from "../utils/igdbMap";
import { safeContentWhereParts } from "../utils/igdbFilters";
import { rawgFetch } from "../utils/rawg";

type IgdbGameSearch = IgdbGame & {
  alternative_names?: { name?: string }[];
  total_rating_count?: number;
  follows?: number;
};

type RawgSearchResponse = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: any[];
};

const SEARCH_FIELDS = `${IGDB_LIST_FIELDS},alternative_names.name,follows,total_rating_count`;

const escapeIgdb = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const normalizeQuery = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

const tokenize = (value: string) =>
  normalizeQuery(value)
    .split(/[^a-z0-9]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);

/** İsim / alternatif isim listesi */
const gameNames = (game: IgdbGameSearch) => {
  const names = [game.name ?? ""];
  for (const alt of game.alternative_names ?? []) {
    if (alt?.name) names.push(alt.name);
  }
  return names.map((n) => normalizeQuery(n)).filter(Boolean);
};

/**
 * Yazarken gelen kısmi sorguları (örn. "black my") doğru oyuna yaklaştır.
 * Tam yapıştırılan isimler zaten yüksek skor alır.
 */
const relevanceScore = (game: IgdbGameSearch, q: string, tokens: string[]) => {
  const names = gameNames(game);
  if (!names.length) return -Infinity;

  let best = 0;
  for (const name of names) {
    let score = 0;
    if (name === q) score += 10_000;
    else if (name.startsWith(q)) score += 6_000;
    else if (name.includes(` ${q}`) || name.includes(q)) score += 3_500;

    if (tokens.length > 1 && tokens.every((t) => name.includes(t))) {
      score += 2_800;
      let cursor = 0;
      let inOrder = true;
      for (const t of tokens) {
        const idx = name.indexOf(t, cursor);
        if (idx < 0) {
          inOrder = false;
          break;
        }
        cursor = idx + t.length;
      }
      if (inOrder) score += 1_200;
    } else if (tokens.length === 1 && name.includes(tokens[0])) {
      score += 1_500;
    }

    const nameWords = name.split(/[^a-z0-9]+/).filter(Boolean);
    const matchedPrefixWords = tokens.filter((t) =>
      nameWords.some((w) => w.startsWith(t))
    ).length;
    score += matchedPrefixWords * 400;

    best = Math.max(best, score);
  }

  const ratings = Number(game.total_rating_count ?? 0);
  const follows = Number(game.follows ?? 0);
  best += Math.min(250, ratings / 15) + Math.min(150, follows / 20);

  if (game.cover?.image_id) best += 40;

  return best;
};

const buildSafeWhere = (extra: string[] = []) => {
  const parts = [...safeContentWhereParts(), ...extra];
  return parts.length ? `where ${parts.join(" & ")};` : "";
};

const hasIgdbCredentials = () => {
  const config = useRuntimeConfig();
  return Boolean(
    String(config.twitch_client_id || "").trim() &&
      String(config.twitch_client_secret || "").trim()
  );
};

/** TWITCH_* yoksa veya IGDB boş dönerse — .env’deki RAWG API_KEY ile ara */
async function searchViaRawg(raw: string, currentPage: number, page_size: number) {
  const data = await rawgFetch<RawgSearchResponse>("/games", {
    params: {
      search: raw,
      page: currentPage,
      page_size,
      // fuzzy: "black my" → Black Myth: Wukong
      search_precise: false,
    },
    timeout: 10_000,
    retry: 1,
  });

  const results = Array.isArray(data?.results) ? data.results : [];

  return {
    count: Number(data?.count ?? results.length),
    next: data?.next
      ? `/api/search-games?search=${encodeURIComponent(raw)}&page=${currentPage + 1}`
      : null,
    previous:
      currentPage > 1
        ? `/api/search-games?search=${encodeURIComponent(raw)}&page=${currentPage - 1}`
        : null,
    results,
    source: "rawg" as const,
  };
}

async function searchViaIgdb(
  raw: string,
  q: string,
  tokens: string[],
  currentPage: number,
  page_size: number,
  offset: number
) {
  const escaped = escapeIgdb(raw.trim());
  const safeWhere = buildSafeWhere();

  const searchBody = `
    search "${escaped}";
    fields ${SEARCH_FIELDS};
    ${safeWhere}
    limit 40;
    offset ${offset};
  `;

  const nameClauses: string[] = [`name ~ *"${escaped}"*`];
  if (tokens.length > 1) {
    nameClauses.push(
      `(${tokens.map((t) => `name ~ *"${escapeIgdb(t)}"*`).join(" & ")})`
    );
  }

  const containsBody = `
    fields ${SEARCH_FIELDS};
    ${buildSafeWhere([`(${nameClauses.join(" | ")})`])}
    sort total_rating_count desc;
    limit 40;
    offset 0;
  `;

  const altBody = `
    fields ${SEARCH_FIELDS};
    ${buildSafeWhere([`alternative_names.name ~ *"${escaped}"*`])}
    sort total_rating_count desc;
    limit 20;
    offset 0;
  `;

  const [searchHits, nameHits, altHits] = await Promise.all([
    igdbFetch<IgdbGameSearch[]>("games", searchBody, {
      timeout: 7000,
      retry: 0,
    }).catch(() => [] as IgdbGameSearch[]),
    igdbFetch<IgdbGameSearch[]>("games", containsBody, {
      timeout: 7000,
      retry: 0,
    }).catch(() => [] as IgdbGameSearch[]),
    igdbFetch<IgdbGameSearch[]>("games", altBody, {
      timeout: 7000,
      retry: 0,
    }).catch(() => [] as IgdbGameSearch[]),
  ]);

  const byId = new Map<number, IgdbGameSearch>();
  for (const g of [...nameHits, ...altHits, ...searchHits]) {
    if (!g?.id || byId.has(g.id)) continue;
    byId.set(g.id, g);
  }

  const ranked = [...byId.values()]
    .filter(isSafeForPublicCatalog)
    .map((g) => ({
      game: g,
      score: relevanceScore(g, q, tokens),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const pageSlice = ranked.slice(0, page_size);
  const results = pageSlice.map((x) => mapIgdbGameToRawgShape(x.game));
  const hasMore = ranked.length > page_size || (searchHits?.length ?? 0) === 40;

  return {
    count: results.length + (hasMore ? 1 : 0),
    next: hasMore
      ? `/api/search-games?search=${encodeURIComponent(raw)}&page=${currentPage + 1}`
      : null,
    previous:
      currentPage > 1
        ? `/api/search-games?search=${encodeURIComponent(raw)}&page=${currentPage - 1}`
        : null,
    results,
    source: "igdb" as const,
  };
}

export default defineEventHandler(async (event) => {
  const { search, page } = getQuery(event);

  const raw = String(search ?? "").trim();
  const q = normalizeQuery(raw);
  const tokens = tokenize(raw);
  const currentPage = Math.max(1, Number(page) || 1);
  const page_size = 20;
  const offset = (currentPage - 1) * page_size;

  if (!q || q.length < 2) {
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  }

  // 1) IGDB (Twitch) — .env’de TWITCH_CLIENT_ID/SECRET doluysa
  if (hasIgdbCredentials()) {
    try {
      const igdb = await searchViaIgdb(
        raw,
        q,
        tokens,
        currentPage,
        page_size,
        offset
      );
      if (igdb.results.length) return igdb;
    } catch (e) {
      console.warn("[search-games] IGDB failed, falling back to RAWG:", e);
    }
  } else {
    console.warn(
      "[search-games] TWITCH_CLIENT_ID/SECRET boş — RAWG ile aranıyor"
    );
  }

  // 2) RAWG fallback (API_KEY)
  try {
    return await searchViaRawg(raw, currentPage, page_size);
  } catch (e: any) {
    console.error("[search-games] RAWG fallback failed:", e);
    throw createError({
      statusCode: e?.statusCode || 503,
      statusMessage: "Game search unavailable",
      data: {
        message:
          e?.data?.message ||
          "Oyun araması çalışmıyor. .env içinde API_KEY veya TWITCH_CLIENT_ID/SECRET kontrol et.",
      },
    });
  }
});
