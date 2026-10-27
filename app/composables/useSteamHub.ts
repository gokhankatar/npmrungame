import { useUserProfile } from "~/composables/useUserProfile";

export type SteamGame = {
  appId: number;
  name: string;
  playtimeForeverMin: number;
  playtime2WeeksMin: number;
  lastPlayed?: number;
  iconUrl: string | null;
  capsuleUrl: string;
  headerUrl: string;
  /** Sırayla denenecek kapaklar (store hash + CDN + icon) */
  coverUrls?: string[];
};

export type SteamAchProgress = {
  unlocked: number;
  total: number;
  completionPct: number;
  isComplete: boolean;
  status: "ready" | "none";
};

export type SteamAchievementRow = {
  apiName: string;
  achieved: boolean;
  unlockTime: number;
  displayName: string;
  description: string;
  icon: string | null;
  iconGray: string | null;
  hidden: boolean;
};

export const STEAM_MIN_PLAY_MINUTES = 60;

export function steamHours(min: number) {
  if (!min) return "0";
  const h = min / 60;
  return h >= 100 ? Math.round(h).toString() : h.toFixed(1);
}

export function steamHeaderUrl(appId: number | string) {
  return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;
}

/** Panel genelinde paylaşılan Steam kütüphane + başarım özeti */
export function useSteamHub() {
  const { user } = useUserProfile();

  const steamId = computed(() => String(user.value?.steamId || "").trim());
  const steamLinked = computed(() => /^\d{17}$/.test(steamId.value));

  const library = useState<SteamGame[]>("steam-hub-library", () => []);
  const gameCount = useState<number>("steam-hub-game-count", () => 0);
  const totalPlaytimeMin = useState<number>("steam-hub-playtime", () => 0);
  const progressByApp = useState<Record<number, SteamAchProgress>>(
    "steam-hub-progress",
    () => ({})
  );
  const progressScanning = useState<boolean>("steam-hub-scanning", () => false);
  const libraryLoaded = useState<boolean>("steam-hub-loaded", () => false);

  const progressGen = useState<number>("steam-hub-progress-gen", () => 0);

  const playedLibrary = computed(() =>
    library.value.filter((g) => g.playtimeForeverMin >= STEAM_MIN_PLAY_MINUTES)
  );

  const underOneHourCount = computed(
    () =>
      library.value.filter((g) => g.playtimeForeverMin < STEAM_MIN_PLAY_MINUTES)
        .length
  );

  const platinumCount = computed(
    () => Object.values(progressByApp.value).filter((p) => p.isComplete).length
  );

  function getProgress(appId: number): SteamAchProgress | null {
    return progressByApp.value[appId] || null;
  }

  function findGame(appId: number): SteamGame | undefined {
    return library.value.find((g) => g.appId === appId);
  }

  async function scanAchievementProgress(games: SteamGame[]) {
    const gen = progressGen.value + 1;
    progressGen.value = gen;
    progressScanning.value = true;
    const queue = [...games].sort(
      (a, b) => b.playtimeForeverMin - a.playtimeForeverMin
    );
    const concurrency = 4;
    let i = 0;

    async function worker() {
      while (i < queue.length) {
        if (gen !== progressGen.value) return;
        const idx = i++;
        const g = queue[idx];
        if (!g) continue;
        try {
          const res = await $fetch<{
            success: boolean;
            data: {
              unlocked: number;
              total: number;
              completionPct: number;
              isComplete: boolean;
            } | null;
          }>("/api/steam/player-achievements", {
            query: {
              steamId: steamId.value,
              appId: g.appId,
              summary: "1",
            },
          });
          if (gen !== progressGen.value) return;
          if (res?.success && res.data && res.data.total > 0) {
            progressByApp.value = {
              ...progressByApp.value,
              [g.appId]: {
                unlocked: res.data.unlocked,
                total: res.data.total,
                completionPct: res.data.completionPct,
                isComplete: res.data.isComplete,
                status: "ready",
              },
            };
          } else {
            progressByApp.value = {
              ...progressByApp.value,
              [g.appId]: {
                unlocked: 0,
                total: 0,
                completionPct: 0,
                isComplete: false,
                status: "none",
              },
            };
          }
        } catch {
          if (gen !== progressGen.value) return;
          progressByApp.value = {
            ...progressByApp.value,
            [g.appId]: {
              unlocked: 0,
              total: 0,
              completionPct: 0,
              isComplete: false,
              status: "none",
            },
          };
        }
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(concurrency, queue.length) }, () =>
        worker()
      )
    );
    if (gen === progressGen.value) progressScanning.value = false;
  }

  async function loadOwnedGames(force = false) {
    if (!steamLinked.value) return null;
    if (libraryLoaded.value && !force && library.value.length) {
      return { games: library.value, gameCount: gameCount.value };
    }

    const ownedRes = await $fetch<{
      success: boolean;
      data: {
        gameCount: number;
        totalPlaytimeMin: number;
        games: SteamGame[];
      };
    }>("/api/steam/owned-games", { query: { steamId: steamId.value } });

    library.value = ownedRes?.data?.games || [];
    gameCount.value = ownedRes?.data?.gameCount || library.value.length;
    totalPlaytimeMin.value = ownedRes?.data?.totalPlaytimeMin || 0;
    libraryLoaded.value = true;
    return ownedRes?.data || null;
  }

  async function ensureProgressScan(force = false) {
    await loadOwnedGames(force);
    const toScan = playedLibrary.value;
    if (!toScan.length) return;
    // Tarama zaten sürüyorsa veya yeterli özet varsa tekrar başlatma
    if (!force && progressScanning.value) return;
    if (
      !force &&
      Object.keys(progressByApp.value).length >= Math.max(1, toScan.length * 0.4)
    ) {
      return;
    }
    progressByApp.value = {};
    await scanAchievementProgress(toScan);
  }

  function setProgressFromDetail(
    appId: number,
    data: {
      unlocked: number;
      total: number;
      completionPct: number;
      isComplete: boolean;
    }
  ) {
    if (!data.total) return;
    progressByApp.value = {
      ...progressByApp.value,
      [appId]: {
        unlocked: data.unlocked,
        total: data.total,
        completionPct: data.completionPct,
        isComplete: data.isComplete,
        status: "ready",
      },
    };
  }

  return {
    steamId,
    steamLinked,
    library,
    gameCount,
    totalPlaytimeMin,
    progressByApp,
    progressScanning,
    libraryLoaded,
    playedLibrary,
    underOneHourCount,
    platinumCount,
    getProgress,
    findGame,
    loadOwnedGames,
    ensureProgressScan,
    scanAchievementProgress,
    setProgressFromDetail,
  };
}
