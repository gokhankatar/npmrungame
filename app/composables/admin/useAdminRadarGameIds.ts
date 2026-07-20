import { collection, getDocs, type Firestore } from "firebase/firestore";

/** Radarımdaki oyunlar (upcoming_games) — RAWG id seti */
export async function fetchRadarRawgIds(firestore: Firestore): Promise<Set<number>> {
  const snapshot = await getDocs(collection(firestore, "upcoming_games"));
  const ids = new Set<number>();

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const raw = data.rawgId ?? data.id;
    if (raw != null && !Number.isNaN(Number(raw))) {
      ids.add(Number(raw));
    }
  }

  return ids;
}

export function isRawgGameOnRadar(
  game: { id?: number | string },
  radarIds: Set<number>
): boolean {
  if (game.id == null) return false;
  return radarIds.has(Number(game.id));
}
