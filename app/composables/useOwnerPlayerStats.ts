import {
  collection,
  getCountFromServer,
  getDocs,
  type Firestore,
} from "firebase/firestore";
import {
  CHANNEL_OWNER_UID,
  gamesCollection,
  isChannelOwner,
  type UserGameListKey,
} from "~/utils/channelOwnerGames";

export type PlayerListCounts = {
  current_games: number;
  completed_games: number;
  upcoming_games: number;
  to_play_games: number;
  target_2026_games: number;
};

export type PlayerSteamLive = {
  personaname: string | null;
  avatar: string | null;
  gameName: string | null;
  /** public profilden okunamadı / API hatası */
  privateOrUnavailable: boolean;
};

export type PlayerOverviewRow = {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL: string | null;
  steamId: string | null;
  isOwner: boolean;
  createdAtMs: number | null;
  counts: PlayerListCounts;
  totalGames: number;
  steamLive?: PlayerSteamLive | null;
};

export const PLAYER_LIST_KEYS: UserGameListKey[] = [
  "current_games",
  "completed_games",
  "upcoming_games",
  "to_play_games",
  "target_2026_games",
];

export const PLAYER_LIST_LABELS: Record<UserGameListKey, string> = {
  current_games: "Oynuyor",
  completed_games: "Bitirdi",
  upcoming_games: "Radar",
  to_play_games: "Backlog",
  target_2026_games: "Bu yıl",
};

function createdAtMs(data: Record<string, any>): number | null {
  const ts =
    data.createdAt?.toMillis?.() ??
    (data.createdAt?.seconds != null ? data.createdAt.seconds * 1000 : null) ??
    data.created_time?.toMillis?.() ??
    (typeof data.created_time === "number" ? data.created_time : null);
  return typeof ts === "number" && !Number.isNaN(ts) ? ts : null;
}

function normalizePlayerEmail(email: string) {
  return email.trim().toLowerCase();
}

type PlayerBaseRow = Omit<PlayerOverviewRow, "counts" | "totalGames"> & {
  firestoreId: string;
};

/** Eski auto-id + uid-doc çiftlerini tek satıra indir */
function pickPreferredPlayer(a: PlayerBaseRow, b: PlayerBaseRow): PlayerBaseRow {
  let winner: PlayerBaseRow;
  if (a.isOwner !== b.isOwner) winner = a.isOwner ? a : b;
  else {
    const aCanon = a.firestoreId === a.uid;
    const bCanon = b.firestoreId === b.uid;
    if (aCanon !== bCanon) winner = aCanon ? a : b;
    else {
      const aTs = a.createdAtMs ?? 0;
      const bTs = b.createdAtMs ?? 0;
      winner = aTs >= bTs ? a : b;
    }
  }
  // steamId hangi dokümanda varsa koru
  if (!winner.steamId && (a.steamId || b.steamId)) {
    return { ...winner, steamId: a.steamId || b.steamId };
  }
  return winner;
}

function pickPreferredCounted(
  a: PlayerBaseRow & { totalGames: number },
  b: PlayerBaseRow & { totalGames: number }
) {
  if (a.isOwner !== b.isOwner) return a.isOwner ? a : b;
  const aCanon = a.firestoreId === a.uid;
  const bCanon = b.firestoreId === b.uid;
  if (aCanon !== bCanon) return aCanon ? a : b;
  if (a.totalGames !== b.totalGames) return a.totalGames > b.totalGames ? a : b;
  return pickPreferredPlayer(a, b) as typeof a;
}

async function countList(
  firestore: Firestore,
  uid: string,
  listKey: UserGameListKey
): Promise<number> {
  try {
    const snap = await getCountFromServer(
      gamesCollection(firestore, uid, listKey)
    );
    return snap.data().count;
  } catch {
    return 0;
  }
}

async function loadCountsForUid(
  firestore: Firestore,
  uid: string
): Promise<PlayerListCounts> {
  const entries = await Promise.all(
    PLAYER_LIST_KEYS.map(async (key) => [key, await countList(firestore, uid, key)] as const)
  );
  return Object.fromEntries(entries) as PlayerListCounts;
}

/** Kanal sahibi — tüm kayıtlı oyuncular + liste sayıları */
export async function fetchOwnerPlayerOverview(
  firestore: Firestore
): Promise<PlayerOverviewRow[]> {
  const usersSnap = await getDocs(collection(firestore, "registered_users"));

  const mapped: PlayerBaseRow[] = usersSnap.docs.map((d) => {
    const data = d.data() as Record<string, any>;
    const uid = (data.uid as string) || d.id;
    const email = normalizePlayerEmail((data.email as string) || "");
    const username =
      (data.username as string) ||
      (data.displayName as string) ||
      email.split("@")[0] ||
      "Oyuncu";
    const rawSteam = String(data.steamId || "").trim();
    return {
      firestoreId: d.id,
      uid,
      email,
      username,
      displayName: (data.displayName as string) || username,
      photoURL: (data.photoURL as string) || (data.avatarUrl as string) || null,
      steamId: /^\d{17}$/.test(rawSteam) ? rawSteam : null,
      isOwner: isChannelOwner(uid) || uid === CHANNEL_OWNER_UID,
      createdAtMs: createdAtMs(data),
    };
  });

  // Owner dokümanda yoksa yine de ekle (kök koleksiyonlar)
  if (!mapped.some((r) => r.uid === CHANNEL_OWNER_UID)) {
    mapped.unshift({
      firestoreId: CHANNEL_OWNER_UID,
      uid: CHANNEL_OWNER_UID,
      email: "npmrungame@gmail.com",
      username: "npmrungame",
      displayName: "npmrungame",
      photoURL: null,
      steamId: null,
      isOwner: true,
      createdAtMs: null,
    });
  }

  // Önce uid tekilleştir (aynı Auth hesabının çift doc’u)
  const byUid = new Map<string, PlayerBaseRow>();
  for (const row of mapped) {
    const prev = byUid.get(row.uid);
    byUid.set(row.uid, prev ? pickPreferredPlayer(prev, row) : row);
  }
  const uniqueByUid = [...byUid.values()];

  const counted = await Promise.all(
    uniqueByUid.map(async (row) => {
      const counts = await loadCountsForUid(firestore, row.uid);
      const totalGames = PLAYER_LIST_KEYS.reduce((sum, k) => sum + counts[k], 0);
      return { ...row, counts, totalGames };
    })
  );

  // Sonra email tekilleştir — owner / kanonik doc / daha dolu hesap
  const byEmail = new Map<string, (typeof counted)[number]>();
  const noEmail: (typeof counted)[number][] = [];
  for (const row of counted) {
    const email = normalizePlayerEmail(row.email);
    if (!email) {
      noEmail.push(row);
      continue;
    }
    const prev = byEmail.get(email);
    byEmail.set(email, prev ? pickPreferredCounted(prev, row) : row);
  }

  const withCounts: PlayerOverviewRow[] = [...byEmail.values(), ...noEmail].map(
    ({ firestoreId: _id, ...rest }) => rest
  );

  return withCounts.sort((a, b) => {
    if (a.isOwner !== b.isOwner) return a.isOwner ? -1 : 1;
    return b.totalGames - a.totalGames;
  });
}

export function summarizePlayerRows(rows: PlayerOverviewRow[]) {
  const totals: PlayerListCounts = {
    current_games: 0,
    completed_games: 0,
    upcoming_games: 0,
    to_play_games: 0,
    target_2026_games: 0,
  };
  for (const row of rows) {
    for (const key of PLAYER_LIST_KEYS) {
      totals[key] += row.counts[key];
    }
  }
  return {
    playerCount: rows.length,
    totals,
    libraryTotal: PLAYER_LIST_KEYS.reduce((s, k) => s + totals[k], 0),
    steamLinkedCount: rows.filter((r) => !!r.steamId).length,
  };
}

async function mapChunk<T, R>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    const slice = items.slice(i, i + size);
    const part = await Promise.all(slice.map(fn));
    out.push(...part);
  }
  return out;
}

/** Steam bağlı oyuncular için GetPlayerSummaries — 5’li paralel */
export async function enrichPlayersWithSteamLive(
  rows: PlayerOverviewRow[]
): Promise<PlayerOverviewRow[]> {
  const linked = rows.filter((r) => r.steamId);
  if (!linked.length) {
    return rows.map((r) => ({ ...r, steamLive: null }));
  }

  const liveBySteamId = new Map<string, PlayerSteamLive>();

  await mapChunk(linked, 5, async (row) => {
    const steamId = row.steamId!;
    try {
      const res = await $fetch<{
        success?: boolean;
        data?: {
          personaname?: string;
          avatarfull?: string;
          avatarmedium?: string;
          gameextrainfo?: string;
          communityvisibilitystate?: number;
        } | null;
      }>("/api/steam/player-summary", { query: { steamId } });

      const data = res?.data;
      if (!data) {
        liveBySteamId.set(steamId, {
          personaname: null,
          avatar: null,
          gameName: null,
          privateOrUnavailable: true,
        });
        return;
      }

      // 1 = private, 3 = public
      const visibility = Number(data.communityvisibilitystate ?? 0);
      const isPrivate = visibility > 0 && visibility < 3;

      liveBySteamId.set(steamId, {
        personaname: data.personaname || null,
        avatar: data.avatarfull || data.avatarmedium || null,
        gameName: data.gameextrainfo || null,
        privateOrUnavailable: isPrivate && !data.gameextrainfo,
      });
    } catch {
      liveBySteamId.set(steamId, {
        personaname: null,
        avatar: null,
        gameName: null,
        privateOrUnavailable: true,
      });
    }
  });

  return rows.map((r) => ({
    ...r,
    steamLive: r.steamId ? liveBySteamId.get(r.steamId) ?? null : null,
  }));
}
