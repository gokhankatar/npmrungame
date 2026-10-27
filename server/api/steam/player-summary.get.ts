import { requireSteamId, steamGet } from "../../utils/steamApi";

type SummaryResponse = {
  response?: {
    players?: Array<{
      steamid?: string;
      personaname?: string;
      avatarfull?: string;
      personastate?: number;
      gameextrainfo?: string;
      gameid?: string;
      profileurl?: string;
    }>;
  };
};

export default defineEventHandler(async (event) => {
  const steamId = requireSteamId(getQuery(event).steamId);

  try {
    const data = await steamGet<SummaryResponse>(
      "/ISteamUser/GetPlayerSummaries/v0002/",
      { steamids: steamId }
    );

    return {
      success: true,
      data: data.response?.players?.[0] || null,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || "Steam player summary hatası",
      data: {
        message: error?.data?.message || error?.message || "Profil alınamadı.",
      },
    });
  }
});
