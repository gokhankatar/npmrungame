export default defineEventHandler(async (event) => {
    const { id } = getQuery(event);
    const config = useRuntimeConfig();

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: "Game ID is required",
        });
    }

    const data: any = await $fetch(`https://api.rawg.io/api/games/${id}`, {
        params: {
            key: config.rawg_api_key,
        },
    });

    return data;
});
