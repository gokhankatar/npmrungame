export default defineEventHandler(async (event) => {
    const { page, page_size } = getQuery(event);
    const config = useRuntimeConfig();

    const data: any = await $fetch("https://api.rawg.io/api/games", {
        params: {
            key: config.rawg_api_key,
            page: page || 1,
            page_size: page_size || 40,
        },
    });

    const makeProxyUrl = (rawUrl: string | null) => {
        if (!rawUrl) return null;

        const url = new URL(rawUrl);

        return `/api/get-games?page=${url.searchParams.get("page")}&page_size=${url.searchParams.get("page_size")}`;
    };

    return {
        count: data?.count,
        next: makeProxyUrl(data?.next),
        previous: makeProxyUrl(data?.previous),
        results: data?.results,
    };
});
