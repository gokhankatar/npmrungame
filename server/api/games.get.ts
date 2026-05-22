export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig();

  const page = Number(query.page) || 1;
  const page_size = Number(query.page_size) || 40;
  const MAX_RAWG_PAGE = 1000;

  const platform = query.platform && query.platform !== ""
    ? String(query.platform)
    : undefined;

  const dates =
    query.dates && String(query.dates).trim() !== ""
      ? String(query.dates)
      : undefined;

  const ordering =
    query.ordering && String(query.ordering).trim() !== ""
      ? String(query.ordering)
      : undefined;

  const params: any = {
    key: config.rawg_api_key,
    page,
    page_size,
  };

  if (dates) {
    params.dates = dates;
  }

  if (ordering) {
    params.ordering = ordering;
  }

  // ⭐ STAR: Metacritic ordering
  if (platform === "star") {
    params.ordering = "-metacritic";
  }

  // 🎮 Platform filter
  if (platform && platform !== "star") {
    const platformMap: Record<string, number> = {
      pc: 1,
      ps5: 2,
      xbox: 3,
      nintendo: 7,
    };

    if (platformMap[platform]) {
      params.parent_platforms = platformMap[platform];
    }
  }

  // RAWG API 
  const data: any = await $fetch("https://api.rawg.io/api/games", { params });

  // Pagination URL for proxying through our API
  const makeProxyUrl = (rawUrl: string | null) => {
    if (!rawUrl) return null;

    const url = new URL(rawUrl);

    const nextPage = url.searchParams.get("page");

    const extra = [
      platform ? `platform=${platform}` : "",
      dates ? `dates=${encodeURIComponent(dates)}` : "",
      ordering ? `ordering=${ordering}` : "",
    ]
      .filter(Boolean)
      .join("&");

    return `/api/games?page=${nextPage}&page_size=${page_size}${extra ? `&${extra}` : ""}`;
  };


  const totalCount = data?.count || 0;
  const limitedTotalCount = Math.min(totalCount, MAX_RAWG_PAGE * page_size);
  const totalPages = Math.min(Math.ceil(totalCount / page_size), MAX_RAWG_PAGE);

  return {
    current: page,
    next: makeProxyUrl(data?.next),
    previous: makeProxyUrl(data?.previous),
    totalCount: limitedTotalCount,
    totalPages,
    results: data?.results,
  };
});
