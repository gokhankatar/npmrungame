import {
  requireSteamId,
  steamCoverCandidates,
  steamGet,
  steamIconUrl,
} from "../../utils/steamApi";

type OwnedGamesResponse = {
  response?: {
    game_count?: number;
    games?: Array<{
      appid: number;
      name?: string;
      playtime_forever?: number;
      playtime_2weeks?: number;
      img_icon_url?: string;
      rtime_last_played?: number;
    }>;
  };
};

export default defineEventHandler(async (event) => {
  const steamId = requireSteamId(getQuery(event).steamId);

  try {
    const data = await steamGet<OwnedGamesResponse>(
      "/IPlayerService/GetOwnedGames/v0001/",
      {
        steamid: steamId,
        include_appinfo: true,
        include_played_free_games: true,
      }
    );

    const games = (data.response?.games || []).map((g) => {
      const iconUrl = steamIconUrl(g.appid, g.img_icon_url);
      const coverUrls = steamCoverCandidates(g.appid, {
        iconHash: g.img_icon_url,
      });
      return {
        appId: g.appid,
        name: g.name || `App ${g.appid}`,
        playtimeForeverMin: g.playtime_forever || 0,
        playtime2WeeksMin: g.playtime_2weeks || 0,
        lastPlayed: g.rtime_last_played || 0,
        iconUrl,
        /** Geriye dönük: ilk aday */
        capsuleUrl: coverUrls[2] || coverUrls[0] || "",
        headerUrl: coverUrls[0] || "",
        /** Kartın sırayla deneyeceği kapaklar */
        coverUrls,
      };
    });

    games.sort((a, b) => b.playtimeForeverMin - a.playtimeForeverMin);

    const totalPlaytimeMin = games.reduce(
      (s, g) => s + g.playtimeForeverMin,
      0
    );

    return {
      success: true,
      data: {
        gameCount: data.response?.game_count ?? games.length,
        totalPlaytimeMin,
        games,
      },
    };
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || "Steam owned games hatası",
      data: {
        message:
          error?.data?.message ||
          "Kütüphane alınamadı. Profil gizliliği / API key kontrol et.",
      },
    });
  }
});
