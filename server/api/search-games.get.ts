export default defineEventHandler(async (event) => {
    const { search, page } = getQuery(event);
    const config = useRuntimeConfig();

    const data: any = await $fetch("https://api.rawg.io/api/games", {
        params: {
            key: config.rawg_api_key,
            search,
            page,
        },
    });

    const makeProxyUrl = (rawUrl: string | null) => {
        if (!rawUrl) return null;

        const url = new URL(rawUrl);

        return `/api/search-games?search=${url.searchParams.get("search")}&page=${url.searchParams.get("page")}`;
    };

    return {
        count: data?.count ?? 0,
        next: makeProxyUrl(data?.next ?? null),
        previous: makeProxyUrl(data?.previous ?? null),
        results: data?.results ?? [],
    };
});
