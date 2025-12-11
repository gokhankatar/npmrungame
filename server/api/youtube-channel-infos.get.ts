export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    const channelId = config.youtube_channel_id;
    const apiKey = config.youtube_api_key;

    if (!channelId || !apiKey) {
        throw createError({
            statusCode: 500,
            statusMessage: "YouTube config is missing",
        });
    }

    const data: any = await $fetch(
        "https://www.googleapis.com/youtube/v3/channels",
        {
            params: {
                part: "statistics",
                id: channelId,
                key: apiKey, 
            },
        }
    );

    return {
        statistics: data?.items?.[0]?.statistics ?? null,
    };
});
