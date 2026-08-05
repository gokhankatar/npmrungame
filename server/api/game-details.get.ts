export default defineEventHandler(async (event) => {
    const { id } = getQuery(event);

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: "Game ID is required",
        });
    }

    return await rawgFetch(`/games/${id}`);
});
