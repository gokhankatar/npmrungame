export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig();

  const steamId = query.steamId as string;

  if (!steamId) {
    throw createError({
      statusCode: 400,
      statusMessage: "steamId parametresi gerekli",
    });
  }

  if (!config.steam_web_api_key) {
    throw createError({
      statusCode: 500,
      statusMessage: "Steam API key yapılandırılmamış",
    });
  }

  try {
    const url = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${config.steam_web_api_key}&steamid=${steamId}&format=json&include_appinfo=true`;
    
    const data = await $fetch(url);

    return {
      success: true,
      data: data.response,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Steam API hatası: ${error.message}`,
    });
  }
});
