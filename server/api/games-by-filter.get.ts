export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const type = query.type as string;
    const slug = query.slug as string;
    const page_size = Number(query.page_size ?? 40);
    const config = useRuntimeConfig();

    if (!type || !slug) {
        throw createError({
            statusCode: 400,
            statusMessage: "Both type and slug are required",
        });
    }

    const allowed = ["genres", "tags"];
    if (!allowed.includes(type)) {
        throw createError({
            statusCode: 400,
            statusMessage: "Type must be 'genres' or 'tags'",
        });
    }

    const data: any = await $fetch("https://api.rawg.io/api/games", {
        params: {
            key: config.rawg_api_key,
            [type]: slug,
            page_size,
        },
    });

    return {
        results: data.results ?? [],
        count: data.count ?? 0,
        next: data.next ?? null,
        previous: data.previous ?? null,
    };
});
