import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  serverTimestamp,
  where,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import { TOP10_COLLECTION } from "~/composables/core/top10";
import {
  CHANNEL_OWNER_UID,
  gamesCollection,
  isChannelOwner,
} from "~/utils/channelOwnerGames";
import { PLAYER_LIST_KEYS } from "~/composables/useOwnerPlayerStats";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function batchDeleteRefs(
  firestore: Firestore,
  refs: ReturnType<typeof doc>[]
) {
  const chunkSize = 400;
  for (let i = 0; i < refs.length; i += chunkSize) {
    const batch = writeBatch(firestore);
    refs.slice(i, i + chunkSize).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}

/** Oyuncunun tüm oyun listelerini sil */
async function deleteUserGameLists(firestore: Firestore, uid: string) {
  for (const listKey of PLAYER_LIST_KEYS) {
    const snap = await getDocs(gamesCollection(firestore, uid, listKey));
    if (!snap.empty) {
      await batchDeleteRefs(
        firestore,
        snap.docs.map((d) => d.ref)
      );
    }
  }
}

/** registered_users içinde uid veya email ile eşleşen tüm dokümanlar */
async function deleteRegisteredUserDocs(
  firestore: Firestore,
  uid: string,
  email?: string
) {
  const refs: ReturnType<typeof doc>[] = [];
  const seen = new Set<string>();

  const push = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    refs.push(doc(firestore, "registered_users", id));
  };

  push(uid);

  try {
    const byUid = await getDocs(
      query(collection(firestore, "registered_users"), where("uid", "==", uid))
    );
    byUid.docs.forEach((d) => push(d.id));
  } catch {
    /* index yoksa tüm koleksiyon taranır */
  }

  const emailNorm = email ? normalizeEmail(email) : "";
  if (emailNorm) {
    try {
      const byEmail = await getDocs(
        query(
          collection(firestore, "registered_users"),
          where("email", "==", emailNorm)
        )
      );
      byEmail.docs.forEach((d) => push(d.id));
    } catch {
      /* ignore */
    }
  }

  // Eski auto-id / farklı email yazımı için güvenli tarama
  const all = await getDocs(collection(firestore, "registered_users"));
  for (const d of all.docs) {
    const data = d.data() as Record<string, any>;
    const docUid = (data.uid as string) || d.id;
    const docEmail = normalizeEmail((data.email as string) || "");
    if (docUid === uid || d.id === uid) push(d.id);
    if (emailNorm && docEmail === emailNorm) push(d.id);
  }

  if (refs.length) await batchDeleteRefs(firestore, refs);
}

/**
 * Kanal sahibi: oyuncuyu platformdan kaldırır.
 * - Oyun listeleri + Top9 + registered_users
 * - banned_users / banned_emails ile tekrar giriş engeli
 * Not: Firebase Auth hesabı Admin SDK olmadan silinemez; ban ile giriş kapatılır.
 */
export async function purgePlayerAccount(
  firestore: Firestore,
  opts: { uid: string; email?: string }
) {
  const uid = opts.uid?.trim();
  if (!uid) throw new Error("uid gerekli");
  if (isChannelOwner(uid) || uid === CHANNEL_OWNER_UID) {
    throw new Error("Kanal sahibi hesabı silinemez.");
  }

  const email = opts.email ? normalizeEmail(opts.email) : "";

  await deleteUserGameLists(firestore, uid);

  try {
    await deleteDoc(doc(firestore, TOP10_COLLECTION, uid));
  } catch {
    /* yoksa sorun değil */
  }

  await deleteRegisteredUserDocs(firestore, uid, email || undefined);

  await setDoc(
    doc(firestore, "banned_users", uid),
    {
      uid,
      email: email || null,
      reason: "admin_delete",
      bannedAt: serverTimestamp(),
    },
    { merge: true }
  );

  if (email) {
    await setDoc(
      doc(firestore, "banned_emails", email),
      {
        email,
        uid,
        reason: "admin_delete",
        bannedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}

export async function isPlayerBanned(
  firestore: Firestore,
  uid: string,
  email?: string | null
): Promise<boolean> {
  try {
    const byUid = await getDoc(doc(firestore, "banned_users", uid));
    if (byUid.exists()) return true;
  } catch {
    /* ignore */
  }

  const emailNorm = email ? normalizeEmail(email) : "";
  if (!emailNorm) return false;

  try {
    const byEmail = await getDoc(doc(firestore, "banned_emails", emailNorm));
    return byEmail.exists();
  } catch {
    return false;
  }
}
