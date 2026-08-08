import { igdbFetch, IGDB_LIST_FIELDS } from "../utils/igdb";
import { mapIgdbGameToRawgShape, isSafeForPublicCatalog, type IgdbGame } from "../utils/igdbMap";
import { safeContentWhereParts } from "../utils/igdbFilters";

const escapeSearch = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

export default defineEventHandler(async (event) => {
  const { search, page } = getQuery(event);

  const q = String(search ?? "").trim();
  const currentPage = Math.max(1, Number(page) || 1);
  const page_size = 20;
  const offset = (currentPage - 1) * page_size;

  if (!q) {
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  }

  const where = safeContentWhereParts().length
    ? `where ${safeContentWhereParts().join(" & ")};`
    : "";

  const body = `
    search "${escapeSearch(q)}";
    fields ${IGDB_LIST_FIELDS};
    ${where}
    limit ${page_size};
    offset ${offset};
  `;

  const games = await igdbFetch<IgdbGame[]>("games", body, {
    timeout: 6000,
    retry: 0,
  });

  const results = (games ?? [])
    .filter(isSafeForPublicCatalog)
    .map((g) => mapIgdbGameToRawgShape(g));
  const hasMore = (games ?? []).length === page_size;

  return {
    count: results.length + (hasMore ? 1 : 0),
    next: hasMore
      ? `/api/search-games?search=${encodeURIComponent(q)}&page=${currentPage + 1}`
      : null,
    previous:
      currentPage > 1
        ? `/api/search-games?search=${encodeURIComponent(q)}&page=${currentPage - 1}`
        : null,
    results,
  };
});
