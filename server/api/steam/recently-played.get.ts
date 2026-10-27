import {
  requireSteamId,
  steamCoverCandidates,
  steamGet,
  steamIconUrl,
} from "../../utils/steamApi";

type RecentResponse = {
  response?: {
    total_count?: number;
    games?: Array<{
      appid: number;
      name?: string;
      playtime_2weeks?: number;
      playtime_forever?: number;
      img_icon_url?: string;
    }>;
  };
};

export default defineEventHandler(async (event) => {
  const steamId = requireSteamId(getQuery(event).steamId);

  try {
    const data = await steamGet<RecentResponse>(
      "/IPlayerService/GetRecentlyPlayedGames/v0001/",
      { steamid: steamId, count: 12 }
    );

    const games = (data.response?.games || []).map((g) => {
      const iconUrl = steamIconUrl(g.appid, g.img_icon_url);
      const coverUrls = steamCoverCandidates(g.appid, {
        iconHash: g.img_icon_url,
      });
      return {
        appId: g.appid,
        name: g.name || `App ${g.appid}`,
        playtime2WeeksMin: g.playtime_2weeks || 0,
        playtimeForeverMin: g.playtime_forever || 0,
        iconUrl,
        capsuleUrl: coverUrls[2] || coverUrls[0] || "",
        headerUrl: coverUrls[0] || "",
        coverUrls,
      };
    });

    return { success: true, data: { games } };
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: "Steam recently played hatası",
      data: {
        message: error?.data?.message || "Son oynananlar alınamadı.",
      },
    });
  }
});
