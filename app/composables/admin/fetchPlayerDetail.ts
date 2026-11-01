import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type Firestore,
} from "firebase/firestore";
import {
  CHANNEL_OWNER_UID,
  gamesCollection,
  isChannelOwner,
  type UserGameListKey,
} from "~/utils/channelOwnerGames";
import {
  PLAYER_LIST_KEYS,
  PLAYER_LIST_LABELS,
  type PlayerListCounts,
} from "~/composables/useOwnerPlayerStats";
import { resolveYearlyGameGoal } from "~/utils/yearlyGoal";

export type PlayerDetailProfile = {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL: string | null;
  steamId: string | null;
  isOwner: boolean;
  yearlyGameGoal: number;
  createdAtMs: number | null;
};

export type PlayerListGame = {
  firestoreId: string;
  name: string;
  cover: string;
  released?: string | null;
  metacritic?: number | null;
  [key: string]: unknown;
};

export type PlayerDetailLists = Record<UserGameListKey, PlayerListGame[]>;

function createdAtMs(data: Record<string, any>): number | null {
  const ts =
    data.createdAt?.toMillis?.() ??
    (data.createdAt?.seconds != null ? data.createdAt.seconds * 1000 : null) ??
    data.created_time?.toMillis?.() ??
    (typeof data.created_time === "number" ? data.created_time : null);
  return typeof ts === "number" && !Number.isNaN(ts) ? ts : null;
}

function mapGameDoc(d: { id: string; data: () => Record<string, any> }): PlayerListGame {
  const data = d.data();
  return {
    firestoreId: d.id,
    ...data,
    name: String(data.name || "İsimsiz oyun"),
    cover:
      data.cover_image ||
      data.background_image ||
      "https://f4.bcbits.com/img/0016409163_71.jpg",
    released: data.released || data.releaseDate || null,
    metacritic: data.metacritic ?? null,
  };
}

/** registered_users içinden uid ile profil bul */
export async function fetchPlayerProfile(
  firestore: Firestore,
  uid: string
): Promise<PlayerDetailProfile | null> {
  const byId = await getDoc(doc(firestore, "registered_users", uid));
  let data: Record<string, any> | null = byId.exists() ? byId.data() : null;

  if (!data) {
    try {
      const q = await getDocs(
        query(collection(firestore, "registered_users"), where("uid", "==", uid))
      );
      if (!q.empty) data = q.docs[0]!.data();
    } catch {
      /* ignore */
    }
  }

  // Owner kök listeleri — doc olmayabilir
  if (!data && (uid === CHANNEL_OWNER_UID || isChannelOwner(uid))) {
    data = {
      uid,
      email: "npmrungame@gmail.com",
      username: "npmrungame",
      displayName: "npmrungame",
    };
  }

  if (!data && uid !== CHANNEL_OWNER_UID) return null;

  const email = String(data?.email || "").trim().toLowerCase();
  const username =
    String(data?.username || data?.displayName || "").trim() ||
    email.split("@")[0] ||
    "Oyuncu";
  const rawSteam = String(data?.steamId || "").trim();

  return {
    uid,
    email,
    username,
    displayName: String(data?.displayName || username),
    photoURL:
      (data?.photoURL as string) || (data?.avatarUrl as string) || null,
    steamId: /^\d{17}$/.test(rawSteam) ? rawSteam : null,
    isOwner: isChannelOwner(uid) || uid === CHANNEL_OWNER_UID,
    yearlyGameGoal: resolveYearlyGameGoal(data?.yearlyGameGoal),
    createdAtMs: data ? createdAtMs(data) : null,
  };
}

export async function fetchPlayerLists(
  firestore: Firestore,
  uid: string
): Promise<{ lists: PlayerDetailLists; counts: PlayerListCounts }> {
  const lists = {} as PlayerDetailLists;
  const counts = {} as PlayerListCounts;

  await Promise.all(
    PLAYER_LIST_KEYS.map(async (key) => {
      try {
        const snap = await getDocs(gamesCollection(firestore, uid, key));
        const games = snap.docs.map((d) => mapGameDoc(d));
        lists[key] = games;
        counts[key] = games.length;
      } catch {
        lists[key] = [];
        counts[key] = 0;
      }
    })
  );

  return { lists, counts };
}

export const PLAYER_DETAIL_TABS: {
  key: UserGameListKey | "steam";
  label: string;
  icon: string;
}[] = [
  { key: "current_games", label: PLAYER_LIST_LABELS.current_games, icon: "mdi-play-circle-outline" },
  { key: "completed_games", label: PLAYER_LIST_LABELS.completed_games, icon: "mdi-trophy-outline" },
  { key: "target_2026_games", label: PLAYER_LIST_LABELS.target_2026_games, icon: "mdi-calendar-check" },
  { key: "upcoming_games", label: PLAYER_LIST_LABELS.upcoming_games, icon: "mdi-radar" },
  { key: "to_play_games", label: PLAYER_LIST_LABELS.to_play_games, icon: "mdi-playlist-play" },
  { key: "steam", label: "Steam", icon: "mdi-steam" },
];
