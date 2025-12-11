export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig();

  const page = Number(query.page) || 1;
  const page_size = Number(query.page_size) || 40;

  // RAWG API’ye backend üzerinden istek
  const data: any = await $fetch("https://api.rawg.io/api/games", {
    params: {
      key: config.rawg_api_key, // gizli kalıyor
      page,
      page_size,
    },
  });

  // frontend için "clean" URL üretici
  const makeProxyUrl = (rawUrl: string | null) => {
    if (!rawUrl) return null;

    const url = new URL(rawUrl);

    return `/api/games?page=${url.searchParams.get(
      "page"
    )}&page_size=${url.searchParams.get("page_size")}`;
  };

  return {
    current: page, // <---- önemli (store’a gidecek)
    next: makeProxyUrl(data?.next),
    previous: makeProxyUrl(data?.previous),
    results: data?.results,
  };
});
