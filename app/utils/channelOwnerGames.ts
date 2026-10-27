import {
  collection,
  doc,
  type CollectionReference,
  type DocumentReference,
  type Firestore,
} from "firebase/firestore";

/** npmrungame kanal hesabı — listeler admin kök koleksiyonlarında */
export const CHANNEL_OWNER_UID = "SKbks0jF2lfrh6GHBka5bi7j48f1";

export type UserGameListKey =
  | "current_games"
  | "completed_games"
  | "upcoming_games"
  | "to_play_games"
  | "target_2026_games";

/** Owner UUID → Firestore kök koleksiyon adı */
const OWNER_ROOT_COLLECTION: Partial<Record<UserGameListKey, string>> = {
  current_games: "current_games",
  completed_games: "completed_games",
  /** Panel “Bu yıl bitirdiklerim” → bu yıl bitenler koleksiyonu */
  target_2026_games: "completed_games_2026",
  upcoming_games: "upcoming_games",
  /** Panel “Bir ara oynayacaklarım” */
  to_play_games: "to_play_games",
};

export function isChannelOwner(uid: string | null | undefined): boolean {
  return !!uid && uid === CHANNEL_OWNER_UID;
}

/** Koleksiyon path segmentleri: ["completed_games"] veya ["user_games", uid, "…"] */
export function userGamesPath(
  uid: string,
  listKey: UserGameListKey
): [string, ...string[]] {
  if (isChannelOwner(uid)) {
    const root = OWNER_ROOT_COLLECTION[listKey];
    if (root) return [root];
  }
  return ["user_games", uid, listKey];
}

export function gamesCollection(
  firestore: Firestore,
  uid: string,
  listKey: UserGameListKey
): CollectionReference {
  return collection(firestore, ...userGamesPath(uid, listKey));
}

export function gameDoc(
  firestore: Firestore,
  uid: string,
  listKey: UserGameListKey,
  firestoreId: string
): DocumentReference {
  return doc(firestore, ...userGamesPath(uid, listKey), firestoreId);
}
