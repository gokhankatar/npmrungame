export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig();

  const page = Number(query.page) || 1;
  const page_size = Number(query.page_size) || 40;

  const platform = query.platform && query.platform !== ""
    ? String(query.platform)
    : undefined;

  const params: any = {
    key: config.rawg_api_key,
    page,
    page_size,
  };

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

    return `/api/games?page=${nextPage}&page_size=${page_size}${platform ? `&platform=${platform}` : ""
      }`;
  };

  return {
    current: page,
    next: makeProxyUrl(data?.next),
    previous: makeProxyUrl(data?.previous),
    results: data?.results,
  };
});
