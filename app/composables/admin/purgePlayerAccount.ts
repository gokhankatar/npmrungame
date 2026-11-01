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
 * - alsoBan !== false ise banned_users / banned_emails (tekrar giriş engeli)
 * Not: Firebase Auth hesabı Admin SDK olmadan silinemez; ban ile giriş kapatılır.
 */
export type BannedPlayerRow = {
  id: string;
  uid: string;
  email: string | null;
  username: string | null;
  displayName: string | null;
  reason: string | null;
  bannedAtMs: number | null;
  source: "banned_users" | "banned_emails";
};

function bannedAtMs(data: Record<string, any>): number | null {
  const ts =
    data.bannedAt?.toMillis?.() ??
    (data.bannedAt?.seconds != null ? data.bannedAt.seconds * 1000 : null) ??
    (typeof data.bannedAt === "number" ? data.bannedAt : null);
  return typeof ts === "number" && !Number.isNaN(ts) ? ts : null;
}

/** Banlı / silinen oyuncu kayıtları (banned_users + banned_emails) */
export async function fetchBannedPlayers(
  firestore: Firestore
): Promise<BannedPlayerRow[]> {
  const byKey = new Map<string, BannedPlayerRow>();

  const upsert = (row: BannedPlayerRow) => {
    const key = row.uid || row.email || row.id;
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, row);
      return;
    }
    // Daha dolu / daha yeni kaydı tut
    byKey.set(key, {
      ...prev,
      ...row,
      email: row.email || prev.email,
      username: row.username || prev.username,
      displayName: row.displayName || prev.displayName,
      reason: row.reason || prev.reason,
      bannedAtMs:
        (row.bannedAtMs ?? 0) >= (prev.bannedAtMs ?? 0)
          ? row.bannedAtMs
          : prev.bannedAtMs,
      source: prev.source === "banned_users" ? "banned_users" : row.source,
    });
  };

  try {
    const usersSnap = await getDocs(collection(firestore, "banned_users"));
    for (const d of usersSnap.docs) {
      const data = d.data() as Record<string, any>;
      upsert({
        id: d.id,
        uid: String(data.uid || d.id),
        email: data.email ? normalizeEmail(String(data.email)) : null,
        username: (data.username as string) || null,
        displayName: (data.displayName as string) || null,
        reason: (data.reason as string) || null,
        bannedAtMs: bannedAtMs(data),
        source: "banned_users",
      });
    }
  } catch (e) {
    console.error("fetchBannedPlayers banned_users:", e);
  }

  try {
    const emailsSnap = await getDocs(collection(firestore, "banned_emails"));
    for (const d of emailsSnap.docs) {
      const data = d.data() as Record<string, any>;
      const email = normalizeEmail(String(data.email || d.id));
      upsert({
        id: d.id,
        uid: String(data.uid || ""),
        email: email || null,
        username: (data.username as string) || null,
        displayName: (data.displayName as string) || null,
        reason: (data.reason as string) || null,
        bannedAtMs: bannedAtMs(data),
        source: "banned_emails",
      });
    }
  } catch (e) {
    console.error("fetchBannedPlayers banned_emails:", e);
  }

  return [...byKey.values()].sort(
    (a, b) => (b.bannedAtMs ?? 0) - (a.bannedAtMs ?? 0)
  );
}

export async function purgePlayerAccount(
  firestore: Firestore,
  opts: {
    uid: string;
    email?: string;
    username?: string;
    displayName?: string;
    /** true: ban + sil (tekrar giriş engeli). false: sadece veri sil, ban yok. */
    alsoBan?: boolean;
  }
) {
  const uid = opts.uid?.trim();
  if (!uid) throw new Error("uid gerekli");
  if (isChannelOwner(uid) || uid === CHANNEL_OWNER_UID) {
    throw new Error("Kanal sahibi hesabı silinemez.");
  }

  const email = opts.email ? normalizeEmail(opts.email) : "";
  const username = opts.username?.trim() || null;
  const displayName = opts.displayName?.trim() || null;
  const alsoBan = opts.alsoBan !== false;

  await deleteUserGameLists(firestore, uid);

  try {
    await deleteDoc(doc(firestore, TOP10_COLLECTION, uid));
  } catch {
    /* yoksa sorun değil */
  }

  await deleteRegisteredUserDocs(firestore, uid, email || undefined);

  if (!alsoBan) return;

  const banPayload = {
    uid,
    email: email || null,
    username,
    displayName,
    reason: "admin_delete",
    bannedAt: serverTimestamp(),
  };

  await setDoc(doc(firestore, "banned_users", uid), banPayload, { merge: true });

  if (email) {
    await setDoc(
      doc(firestore, "banned_emails", email),
      banPayload,
      { merge: true }
    );
  }
}

/** Ban kaydını kaldır (yeniden girişe izin verir) */
export async function removeBannedPlayer(
  firestore: Firestore,
  row: Pick<BannedPlayerRow, "uid" | "email">
) {
  const uid = row.uid?.trim();
  const email = row.email ? normalizeEmail(row.email) : "";

  const refs: ReturnType<typeof doc>[] = [];
  if (uid) refs.push(doc(firestore, "banned_users", uid));
  if (email) refs.push(doc(firestore, "banned_emails", email));

  if (!refs.length) throw new Error("Silinecek ban kaydı yok.");
  await batchDeleteRefs(firestore, refs);
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
