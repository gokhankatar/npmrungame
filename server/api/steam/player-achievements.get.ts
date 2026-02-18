export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig();

  const steamId = query.steamId as string;
  const appId = query.appId as string;

  if (!steamId || !appId) {
    throw createError({
      statusCode: 400,
      statusMessage: "steamId ve appId parametreleri gerekli",
    });
  }

  if (!config.steam_web_api_key) {
    throw createError({
      statusCode: 500,
      statusMessage: "Steam API key yapılandırılmamış",
    });
  }

  try {
    const url = `http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appId}&key=${config.steam_web_api_key}&steamid=${steamId}`;
    
    const data = await $fetch(url);

    return {
      success: true,
      data: data.playerstats,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Steam API hatası: ${error.message}`,
    });
  }
});
