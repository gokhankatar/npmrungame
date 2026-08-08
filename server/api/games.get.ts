import { igdbFetch, IGDB_LIST_FIELDS, isoDateRangeToUnix } from "../utils/igdb";
import {
  isSafeForPublicCatalog,
  mapIgdbGameToRawgShape,
  type IgdbGame,
} from "../utils/igdbMap";
import {
  MAX_IGDB_PAGE,
  PLATFORM_IDS,
  safeContentWhereParts,
} from "../utils/igdbFilters";

const buildWhere = (parts: string[]) =>
  parts.length ? `where ${parts.join(" & ")};` : "";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const page = Math.max(1, Number(query.page) || 1);
  const page_size = Math.min(Math.max(Number(query.page_size) || 40, 1), 50);

  const platform =
    query.platform && query.platform !== "" ? String(query.platform) : undefined;

  const dates =
    query.dates && String(query.dates).trim() !== ""
      ? String(query.dates)
      : undefined;

  const ordering =
    query.ordering && String(query.ordering).trim() !== ""
      ? String(query.ordering)
      : undefined;

  const whereParts: string[] = ["cover != null", ...safeContentWhereParts()];

  if (platform === "star" || ordering === "-metacritic") {
    whereParts.push("aggregated_rating != null");
  }

  if (platform && platform !== "star") {
    const ids = PLATFORM_IDS[platform];
    if (ids?.length) {
      whereParts.push(`platforms = (${ids.join(",")})`);
    }
  }

  const range = isoDateRangeToUnix(dates);
  if (range) {
    whereParts.push(`first_release_date >= ${range.fromTs}`);
    whereParts.push(`first_release_date <= ${range.toTs}`);
  }

  let sort = "sort total_rating_count desc;";
  if (platform === "star" || ordering === "-metacritic") {
    sort = "sort aggregated_rating desc;";
  } else if (ordering === "-released" || ordering === "released") {
    sort =
      ordering === "-released"
        ? "sort first_release_date desc;"
        : "sort first_release_date asc;";
  } else if (ordering === "-rating") {
    sort = "sort rating desc;";
  } else if (ordering === "-added" || ordering === "-created") {
    sort = "sort created_at desc;";
  }

  const offset = (page - 1) * page_size;

  const listBody = `
    fields ${IGDB_LIST_FIELDS};
    ${buildWhere(whereParts)}
    ${sort}
    limit ${page_size};
    offset ${offset};
  `;

  const countBody = `
    ${buildWhere(whereParts)}
  `;

  const [games, countRes] = await Promise.all([
    igdbFetch<IgdbGame[]>("games", listBody),
    igdbFetch<{ count: number } | { count: number }[]>("games/count", countBody),
  ]);

  const totalCount = Array.isArray(countRes)
    ? countRes?.[0]?.count ?? 0
    : countRes?.count ?? 0;
  const limitedTotalCount = Math.min(totalCount, MAX_IGDB_PAGE * page_size);
  const totalPages = Math.min(Math.ceil(totalCount / page_size) || 1, MAX_IGDB_PAGE);

  const makeProxyUrl = (targetPage: number | null) => {
    if (!targetPage || targetPage < 1 || targetPage > totalPages) return null;

    const extra = [
      platform ? `platform=${platform}` : "",
      dates ? `dates=${encodeURIComponent(dates)}` : "",
      ordering ? `ordering=${ordering}` : "",
    ]
      .filter(Boolean)
      .join("&");

    return `/api/games?page=${targetPage}&page_size=${page_size}${extra ? `&${extra}` : ""}`;
  };

  return {
    current: page,
    next: makeProxyUrl(page < totalPages ? page + 1 : null),
    previous: makeProxyUrl(page > 1 ? page - 1 : null),
    totalCount: limitedTotalCount,
    totalPages,
    results: (games ?? [])
      .filter(isSafeForPublicCatalog)
      .map((g) => mapIgdbGameToRawgShape(g)),
  };
});
