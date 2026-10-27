import { writeBatch, type Firestore } from "firebase/firestore";
import { useAdminBulkDelete } from "~/composables/admin/useAdminBulkDelete";
import {
  gameDoc,
  type UserGameListKey,
} from "~/utils/channelOwnerGames";

/** Panel listelerinde çoklu seçim + silme */
export function usePanelBulkEdit() {
  return useAdminBulkDelete((item) => item.firestoreId);
}

export async function batchDeleteUserListGames(
  firestore: Firestore,
  uid: string,
  listKey: UserGameListKey,
  ids: string[]
) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return;

  const chunkSize = 400;
  for (let i = 0; i < uniqueIds.length; i += chunkSize) {
    const batch = writeBatch(firestore);
    uniqueIds.slice(i, i + chunkSize).forEach((id) => {
      batch.delete(gameDoc(firestore, uid, listKey, id));
    });
    await batch.commit();
  }
}
