import { igdbFetch, IGDB_LIST_FIELDS } from "../utils/igdb";
import {
  isSafeForPublicCatalog,
  mapIgdbGameToRawgShape,
  type IgdbGame,
} from "../utils/igdbMap";
import {
  GENRE_AS_THEME_IDS,
  GENRE_IDS,
  KEYWORD_IDS,
  MAX_IGDB_PAGE,
  THEME_IDS,
  safeContentWhereParts,
} from "../utils/igdbFilters";

const buildWhere = (parts: string[]) =>
  parts.length ? `where ${parts.join(" & ")};` : "";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const type = query.type as string;
  const slug = query.slug as string;

  const page = Math.max(1, Number(query.page) || 1);
  const page_size = Math.min(Math.max(Number(query.page_size ?? 40), 1), 50);

  if (!type || !slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Both type and slug are required",
    });
  }

  if (!["genre", "tag", "genres", "tags"].includes(type)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Type must be 'genre'/'genres' or 'tag'/'tags'",
    });
  }

  const normalizedType = type.startsWith("genre") ? "genre" : "tag";
  const whereParts: string[] = ["cover != null", ...safeContentWhereParts()];

  if (normalizedType === "genre") {
    if (GENRE_AS_THEME_IDS[slug] != null) {
      whereParts.push(`themes = (${GENRE_AS_THEME_IDS[slug]})`);
    } else {
      const genreId = GENRE_IDS[slug];
      if (!genreId) {
        throw createError({
          statusCode: 400,
          statusMessage: `Unknown genre slug: ${slug}`,
        });
      }
      whereParts.push(`genres = (${genreId})`);
    }
  } else if (KEYWORD_IDS[slug] != null) {
    whereParts.push(`keywords = (${KEYWORD_IDS[slug]})`);
  } else {
    const themeId = THEME_IDS[slug];
    if (!themeId) {
      throw createError({
        statusCode: 400,
        statusMessage: `Unknown tag slug: ${slug}`,
      });
    }
    whereParts.push(`themes = (${themeId})`);
  }

  const offset = (page - 1) * page_size;

  const listBody = `
    fields ${IGDB_LIST_FIELDS};
    ${buildWhere(whereParts)}
    sort total_rating_count desc;
    limit ${page_size};
    offset ${offset};
  `;

  const countBody = `${buildWhere(whereParts)}`;

  const [games, countRes] = await Promise.all([
    igdbFetch<IgdbGame[]>("games", listBody),
    igdbFetch<{ count: number } | { count: number }[]>("games/count", countBody),
  ]);

  const totalCount = Array.isArray(countRes)
    ? countRes?.[0]?.count ?? 0
    : countRes?.count ?? 0;
  const totalPages = Math.min(
    Math.ceil(totalCount / page_size) || 1,
    MAX_IGDB_PAGE
  );

  const makeProxyUrl = (targetPage: number | null) => {
    if (!targetPage || targetPage < 1 || targetPage > totalPages) return null;
    return `/api/games-by-filter?page=${targetPage}&page_size=${page_size}&type=${type}&slug=${slug}`;
  };

  return {
    current: page,
    next: makeProxyUrl(page < totalPages ? page + 1 : null),
    previous: makeProxyUrl(page > 1 ? page - 1 : null),
    totalPages,
    totalCount: Math.min(totalCount, MAX_IGDB_PAGE * page_size),
    results: (games ?? [])
      .filter(isSafeForPublicCatalog)
      .map((g) => mapIgdbGameToRawgShape(g)),
  };
});
