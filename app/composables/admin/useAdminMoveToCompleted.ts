import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
  type Firestore,
} from "firebase/firestore";

/** Şuan oynananlardan bitirilenlere taşırken completed_games ile aynı alanları yazar. */
export function buildCompletedGamePayload(game: Record<string, unknown>) {
  const { firestoreId: _id, ...rest } = game;
  return {
    ...rest,
    completed_at: new Date().toISOString(),
    added_at: serverTimestamp(),
  };
}

export function isCompletedInCurrentYear(): boolean {
  return new Date().getFullYear() === 2026;
}

export async function moveGameToCompletedCollections(
  firestore: Firestore,
  sourceCollection: string,
  firestoreId: string,
  game: Record<string, unknown>
) {
  const payload = buildCompletedGamePayload(game);
  const batch = writeBatch(firestore);

  batch.set(doc(collection(firestore, "completed_games")), payload);

  if (isCompletedInCurrentYear()) {
    batch.set(doc(collection(firestore, "completed_games_2026")), payload);
  }

  batch.delete(doc(firestore, sourceCollection, firestoreId));

  await batch.commit();
}
