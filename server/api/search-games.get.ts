export default defineEventHandler(async (event) => {
    const { search, page } = getQuery(event);

    // Typeahead: fail fast instead of letting the user wait on a stalled upstream.
    const data: any = await rawgFetch("/games", {
        params: { search, page },
        timeout: 6000,
        retry: 0,
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
