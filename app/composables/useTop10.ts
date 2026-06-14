import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { slugify } from "~/composables/core/basicFunc";
import {
  TOP10_COLLECTION,
  TOP10_MIN_SHARE,
  type Top10DisplayMode,
  type Top10GameEntry,
  type UserTop10List,
} from "~/composables/core/top10";

const buildBaseSlug = (username: string, uid: string) => {
  const base = slugify(username || "liste");
  return base || `liste-${uid.slice(0, 6)}`;
};

export const ensureUniqueTop10Slug = async (
  firestore: Firestore,
  slug: string,
  uid: string
) => {
  const q = query(collection(firestore, TOP10_COLLECTION), where("slug", "==", slug));
  const snap = await getDocs(q);
  const conflict = snap.docs.find((d) => d.id !== uid);
  if (!conflict) return slug;
  return `${slug}-${uid.slice(0, 6)}`;
};

export const fetchUserTop10List = async (firestore: Firestore, uid: string) => {
  const ref = doc(firestore, TOP10_COLLECTION, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as UserTop10List & { id: string };
};

export const fetchTop10BySlug = async (firestore: Firestore, slug: string) => {
  const q = query(collection(firestore, TOP10_COLLECTION), where("slug", "==", slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as UserTop10List & { id: string };
};

export const fetchRecentPublicTop10Lists = async (
  firestore: Firestore,
  max = 4
): Promise<UserTop10List[]> => {
  try {
    const q = query(
      collection(firestore, TOP10_COLLECTION),
      where("isPublic", "==", true),
      orderBy("updatedAt", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data() }) as UserTop10List);
  } catch {
    const snap = await getDocs(collection(firestore, TOP10_COLLECTION));
    return snap.docs
      .map((d) => d.data() as UserTop10List)
      .filter((l) => l.isPublic && l.gameCount >= TOP10_MIN_SHARE)
      .sort((a, b) => {
        const ta = (a.updatedAt as { seconds?: number })?.seconds ?? 0;
        const tb = (b.updatedAt as { seconds?: number })?.seconds ?? 0;
        return tb - ta;
      })
      .slice(0, max);
  }
};

export const saveUserTop10List = async (
  firestore: Firestore,
  uid: string,
  payload: {
    username: string;
    title: string;
    games: Top10GameEntry[];
    displayMode?: Top10DisplayMode;
    isPublic?: boolean;
    existingSlug?: string | null;
  }
) => {
  const ref = doc(firestore, TOP10_COLLECTION, uid);
  const existing = await getDoc(ref);

  let slug = payload.existingSlug ?? buildBaseSlug(payload.username, uid);
  if (!payload.existingSlug || !existing.exists()) {
    slug = await ensureUniqueTop10Slug(firestore, slug, uid);
  }

  const data: UserTop10List = {
    uid,
    username: payload.username,
    slug,
    title: payload.title.trim() || `${payload.username} · Top 10`,
    displayMode: payload.displayMode ?? existing.data()?.displayMode ?? "grid",
    games: payload.games.map((g, i) => ({ ...g, rank: i + 1 })),
    gameCount: payload.games.length,
    isPublic: payload.isPublic ?? true,
    updatedAt: serverTimestamp(),
    viewCount: existing.exists() ? (existing.data()?.viewCount ?? 0) : 0,
  };

  if (!existing.exists()) {
    data.createdAt = serverTimestamp();
  }

  await setDoc(ref, data, { merge: true });
  return data;
};

export const incrementTop10ViewCount = async (firestore: Firestore, uid: string) => {
  const ref = doc(firestore, TOP10_COLLECTION, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const current = snap.data()?.viewCount ?? 0;
  await updateDoc(ref, { viewCount: current + 1 });
};

export const getTop10ShareUrl = (slug: string) => {
  if (!import.meta.client) return `/top-10/${slug}`;
  return `${window.location.origin}/top-10/${slug}`;
};
