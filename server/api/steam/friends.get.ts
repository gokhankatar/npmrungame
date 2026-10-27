import { requireSteamId, steamGet } from "../../utils/steamApi";

type FriendSummary = {
  steamId: string;
  personaname: string;
  avatarfull: string | null;
  personastate: number;
  gameId: string | null;
  gameExtraInfo: string | null;
  profileurl: string | null;
};

/**
 * GetFriendList + GetPlayerSummaries.
 * Query: steamId, optional appId (aynı oyunu oynayanlar)
 * Not: arkadaş listesi gizliyse boş döner.
 */
export default defineEventHandler(async (event) => {
  const q = getQuery(event);
  const steamId = requireSteamId(q.steamId);
  const filterAppId = String(q.appId || "").trim();

  let friendIds: string[] = [];
  try {
    const fl = await steamGet<{
      friendslist?: { friends?: Array<{ steamid?: string }> };
    }>("/ISteamUser/GetFriendList/v0001/", {
      steamid: steamId,
      relationship: "friend",
    });
    friendIds = (fl?.friendslist?.friends || [])
      .map((f) => String(f.steamid || ""))
      .filter((id) => /^\d{17}$/.test(id));
  } catch {
    return {
      success: false,
      message: "Arkadaş listesi gizli veya alınamadı",
      data: { friends: [] as FriendSummary[], total: 0, playing: [] as FriendSummary[] },
    };
  }

  if (!friendIds.length) {
    return {
      success: true,
      data: { friends: [] as FriendSummary[], total: 0, playing: [] as FriendSummary[] },
    };
  }

  const friends: FriendSummary[] = [];
  // Steam GetPlayerSummaries max ~100 per call
  const chunk = 90;
  for (let i = 0; i < friendIds.length; i += chunk) {
    const batch = friendIds.slice(i, i + chunk);
    try {
      const res = await steamGet<{
        response?: {
          players?: Array<{
            steamid?: string;
            personaname?: string;
            avatarfull?: string;
            personastate?: number;
            gameid?: string;
            gameextrainfo?: string;
            profileurl?: string;
          }>;
        };
      }>("/ISteamUser/GetPlayerSummaries/v0002/", {
        steamids: batch.join(","),
      });
      for (const p of res?.response?.players || []) {
        friends.push({
          steamId: String(p.steamid || ""),
          personaname: String(p.personaname || "Steam"),
          avatarfull: p.avatarfull || null,
          personastate: Number(p.personastate) || 0,
          gameId: p.gameid ? String(p.gameid) : null,
          gameExtraInfo: p.gameextrainfo || null,
          profileurl: p.profileurl || null,
        });
      }
    } catch {
      /* batch skip */
    }
  }

  const playingAll = friends.filter((f) => f.gameId);
  const playing = filterAppId
    ? playingAll.filter((f) => f.gameId === filterAppId)
    : playingAll;

  return {
    success: true,
    data: {
      total: friends.length,
      friends,
      playing,
    },
  };
});
