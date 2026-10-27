import { requireSteamApiKey, requireSteamId, steamGet } from "../../utils/steamApi";

type AchievementsResponse = {
  playerstats?: {
    steamID?: string;
    gameName?: string;
    success?: boolean;
    achievements?: Array<{
      apiname: string;
      achieved: number;
      unlocktime: number;
    }>;
    error?: string;
  };
};

type SchemaResponse = {
  game?: {
    gameName?: string;
    availableGameStats?: {
      achievements?: Array<{
        name: string;
        displayName?: string;
        description?: string;
        icon?: string;
        icongray?: string;
        hidden?: number;
      }>;
    };
  };
};

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const steamId = requireSteamId(query.steamId);
  const appId = String(query.appId || "").trim();
  /** summary=1 → sadece tamamlanma (kütüphane taraması; schema yok) */
  const summaryOnly =
    query.summary === "1" ||
    query.summary === "true" ||
    query.summary === true;

  if (!/^\d+$/.test(appId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "appId gerekli",
    });
  }

  const key = requireSteamApiKey();

  try {
    const player = await steamGet<AchievementsResponse>(
      "/ISteamUserStats/GetPlayerAchievements/v0001/",
      { steamid: steamId, appid: appId, l: "turkish" }
    ).catch(() => null);

    const stats = player?.playerstats;
    if (!stats || stats.success === false) {
      return {
        success: false,
        message:
          stats?.error ||
          "Bu oyun için başarımlar gizli veya desteklenmiyor.",
        data: null,
      };
    }

    const raw = stats.achievements || [];
    const unlocked = raw.filter((a) => a.achieved === 1).length;
    const total = raw.length;
    const completionPct = total ? Math.round((unlocked / total) * 100) : 0;
    const isComplete = total > 0 && unlocked === total;

    if (summaryOnly) {
      return {
        success: true,
        data: {
          gameName: stats.gameName || null,
          unlocked,
          total,
          completionPct,
          isComplete,
          achievements: [],
        },
      };
    }

    const schema = await $fetch<SchemaResponse>(
      "https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/",
      {
        params: { key, appid: appId, l: "turkish" },
        timeout: 12_000,
      }
    ).catch(() => null);

    const schemaMap = new Map(
      (schema?.game?.availableGameStats?.achievements || []).map((a) => [
        a.name,
        a,
      ])
    );

    const resolveIcon = (rawIcon?: string | null) => {
      const v = String(rawIcon || "").trim();
      if (!v) return null;
      // Schema çoğu oyunda tam URL döner — tekrar prefix ekleme
      if (/^https?:\/\//i.test(v)) return v;
      return `https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/${appId}/${v}`;
    };

    const list = raw.map((a) => {
      const meta = schemaMap.get(a.apiname);
      return {
        apiName: a.apiname,
        achieved: a.achieved === 1,
        unlockTime: a.unlocktime || 0,
        displayName: meta?.displayName || a.apiname,
        description: meta?.description || "",
        icon: resolveIcon(meta?.icon),
        iconGray: resolveIcon(meta?.icongray),
        hidden: meta?.hidden === 1,
      };
    });

    return {
      success: true,
      data: {
        gameName: stats.gameName || schema?.game?.gameName || null,
        unlocked,
        total,
        completionPct,
        /** Steam’de “platin” yok — %100 tamamlanma */
        isComplete,
        achievements: list,
      },
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: "Steam achievements hatası",
      data: {
        message:
          error?.data?.message ||
          "Başarımlar alınamadı (oyun stats API kapalı olabilir).",
      },
    });
  }
});
