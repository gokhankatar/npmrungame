export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig();

  const type = query.type as string;
  const slug = query.slug as string;

  const page = Number(query.page) || 1;
  const page_size = Number(query.page_size ?? 40);

  const MAX_RAWG_PAGE = 1000;

  if (!type || !slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Both type and slug are required",
    });
  }

  if (!["genres", "tags"].includes(type)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Type must be 'genres' or 'tags'",
    });
  }

  const params: any = {
    key: config.rawg_api_key,
    [type]: slug,
    page,
    page_size,
  };

  const data: any = await $fetch("https://api.rawg.io/api/games", { params });

  const makeProxyUrl = (rawUrl: string | null) => {
    if (!rawUrl) return null;

    const url = new URL(rawUrl);
    const nextPage = url.searchParams.get("page");

    return `/api/games-by-filter?page=${nextPage}&page_size=${page_size}&type=${type}&slug=${slug}`;
  };

  const totalCount = data?.count || 0;
  const totalPages = Math.min(
    Math.ceil(totalCount / page_size),
    MAX_RAWG_PAGE
  );

  return {
    current: page,
    next: makeProxyUrl(data?.next),
    previous: makeProxyUrl(data?.previous),
    totalPages,
    totalCount,
    results: data?.results ?? [],
  };
});