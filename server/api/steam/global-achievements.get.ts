import { steamGet } from "../../utils/steamApi";

type GlobalRow = { name: string; percent: number };

/**
 * ISteamUserStats/GetGlobalAchievementPercentagesForApp
 * Query: appId
 */
export default defineEventHandler(async (event) => {
  const appId = Number(getQuery(event).appId);
  if (!Number.isFinite(appId) || appId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Geçersiz appId",
    });
  }

  try {
    const res = await steamGet<{
      achievementpercentages?: { achievements?: Array<{ name?: string; percent?: number }> };
    }>("/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/", {
      gameid: appId,
    });

    const rows: GlobalRow[] = (res?.achievementpercentages?.achievements || [])
      .map((a) => ({
        name: String(a?.name || ""),
        percent: Number(a?.percent) || 0,
      }))
      .filter((a) => a.name);

    return {
      success: true,
      data: {
        appId,
        achievements: rows,
      },
    };
  } catch (e: any) {
    return {
      success: false,
      message:
        e?.data?.message ||
        e?.message ||
        "Global başarım oranları alınamadı",
      data: null,
    };
  }
});
