import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { isAbortError } from "~/utils/isAbortError";

export type SpotlightGame = {
  firestoreId: string;
  name: string;
  releaseDate: string;
  background_image?: string | null;
  rawgId?: number | null;
};

const SETTINGS_DOC = ["site_settings", "dashboard_spotlight"] as const;

function parseReleaseDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return new Date(0);
  return d;
}

export function getDaysUntilRelease(releaseDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const release = parseReleaseDate(releaseDate);
  release.setHours(0, 0, 0, 0);
  return Math.round((release.getTime() - today.getTime()) / 86400000);
}

export function formatSpotlightDate(releaseDate: string, locale = "tr-TR") {
  return parseReleaseDate(releaseDate).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function useDashboardSpotlight() {
  const { $firestore } = useNuxtApp();

  async function fetchSpotlight(): Promise<SpotlightGame | null> {
    if (!$firestore) return null;

    try {
      const snap = await getDoc(doc($firestore, ...SETTINGS_DOC));
      if (snap.exists()) {
        const data = snap.data() as SpotlightGame;
        if (data?.name && data?.releaseDate) {
          return {
            firestoreId: data.firestoreId || snap.id,
            name: data.name,
            releaseDate: data.releaseDate,
            background_image: data.background_image ?? null,
            rawgId: data.rawgId ?? null,
          };
        }
      }
    } catch (e) {
      if (!isAbortError(e)) console.warn("[spotlight] settings read failed", e);
    }

    // Fallback: kanal radarındaki en yakın çıkış
    try {
      const col = await getDocs(collection($firestore, "upcoming_games"));
      const games = col.docs.map((d) => {
        const data = d.data();
        return {
          firestoreId: d.id,
          name: String(data.name || ""),
          releaseDate: String(data.releaseDate || ""),
          background_image: (data.background_image as string) || null,
          rawgId: (data.rawgId as number) || null,
        } satisfies SpotlightGame;
      }).filter((g) => g.name && g.releaseDate);

      if (!games.length) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      games.sort(
        (a, b) =>
          parseReleaseDate(a.releaseDate).getTime() -
          parseReleaseDate(b.releaseDate).getTime()
      );
      return (
        games.find(
          (g) => parseReleaseDate(g.releaseDate).getTime() >= today.getTime()
        ) ?? games[0]
      );
    } catch (e) {
      if (!isAbortError(e)) console.warn("[spotlight] upcoming fallback failed", e);
      return null;
    }
  }

  async function setSpotlight(game: SpotlightGame, uid?: string | null) {
    if (!$firestore) throw new Error("Firestore yok");
    await setDoc(
      doc($firestore, ...SETTINGS_DOC),
      {
        firestoreId: game.firestoreId,
        name: game.name,
        releaseDate: game.releaseDate,
        background_image: game.background_image ?? null,
        rawgId: game.rawgId ?? null,
        updatedAt: serverTimestamp(),
        updatedBy: uid || null,
      },
      { merge: true }
    );
  }

  async function getSpotlightId(): Promise<string | null> {
    if (!$firestore) return null;
    try {
      const snap = await getDoc(doc($firestore, ...SETTINGS_DOC));
      if (!snap.exists()) return null;
      return (snap.data()?.firestoreId as string) || null;
    } catch {
      return null;
    }
  }

  return {
    fetchSpotlight,
    setSpotlight,
    getSpotlightId,
  };
}
