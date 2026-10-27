import { getDocs } from "firebase/firestore";
import { useUserProfile } from "~/composables/useUserProfile";
import { useSteamHub, type SteamGame } from "~/composables/useSteamHub";
import store from "~/store/store";
import {
  gamesCollection,
  type UserGameListKey,
} from "~/utils/channelOwnerGames";
import {
  extractSteamAppId,
  formatSteamMoney,
  namesLikelyMatch,
} from "~/utils/steamMatch";
import { resolveGameCardImage } from "~/composables/data/handleData";

export type SteamPriceRow = {
  appId: number;
  name: string | null;
  currency: string | null;
  final: number | null;
  initial: number | null;
  discountPct: number;
  isFree: boolean;
  headerUrl: string | null;
};

export type RadarSteamRow = {
  id: string;
  name: string;
  listKey: UserGameListKey;
  steamAppId: number | null;
  owned: boolean;
  onWishlist: boolean;
  matchBy: "appId" | "name" | "none";
  imageUrl: string;
};

export type YearRecap = {
  year: number;
  gamesTouched: number;
  hoursApprox: number;
  topGames: Array<{ appId: number; name: string; playtimeForeverMin: number; headerUrl: string }>;
  platinumInLibrary: number;
};

const RADAR_LISTS: UserGameListKey[] = [
  "upcoming_games",
  "to_play_games",
  "current_games",
];

export function useSteamInsights() {
  const { user } = useUserProfile();
  const _store = store();
  const { $firestore } = useNuxtApp();
  const hub = useSteamHub();

  const steamId = computed(() => String(user.value?.steamId || "").trim());

  /** displayCurrency: kullanıcı TRY veya USD görür; toplam her zaman TRY kuruş saklanır */
  const libraryValue = useState<{
    loading: boolean;
    /** Steam'den gelen ham para birimi */
    sourceCurrency: string;
    /** Gösterim: TRY | USD */
    displayCurrency: "TRY" | "USD";
    /** Toplam TRY kuruş (normalize) */
    totalFinalTry: number | null;
    totalInitialTry: number | null;
    /** 1 USD = ? TRY (Frankfurter) */
    usdTryRate: number | null;
    pricedCount: number;
    scannedCount: number;
    sampleNote: boolean;
  }>("steam-ins-value", () => ({
    loading: false,
    sourceCurrency: "TRY",
    displayCurrency: "TRY",
    totalFinalTry: null,
    totalInitialTry: null,
    usdTryRate: null,
    pricedCount: 0,
    scannedCount: 0,
    sampleNote: false,
  }));

  const yearRecap = useState<YearRecap | null>("steam-ins-year", () => null);

  const radarMatch = useState<{
    loading: boolean;
    rows: RadarSteamRow[];
    ownedCount: number;
    missingCount: number;
  }>("steam-ins-radar", () => ({
    loading: false,
    rows: [],
    ownedCount: 0,
    missingCount: 0,
  }));

  const discounts = useState<{
    loading: boolean;
    items: Array<{
      appId: number;
      name: string;
      discountPct: number;
      final: number | null;
      currency: string | null;
      source: "wishlist" | "radar";
      headerUrl: string | null;
    }>;
  }>("steam-ins-sale", () => ({
    loading: false,
    items: [],
  }));

  const friendsLive = useState<{
    loading: boolean;
    total: number;
    playing: Array<{
      steamId: string;
      personaname: string;
      avatarfull: string | null;
      gameId: string | null;
      gameExtraInfo: string | null;
      profileurl: string | null;
    }>;
    privateOrFail: boolean;
  }>("steam-ins-friends", () => ({
    loading: false,
    total: 0,
    playing: [],
    privateOrFail: false,
  }));

  function buildYearRecap(games: SteamGame[], platinumCount: number): YearRecap {
    const year = new Date().getFullYear();
    const start = Math.floor(new Date(year, 0, 1).getTime() / 1000);
    const end = Math.floor(new Date(year + 1, 0, 1).getTime() / 1000);
    const touched = games.filter((g) => {
      const lp = g.lastPlayed || 0;
      return lp >= start && lp < end;
    });
    const top = [...touched]
      .sort((a, b) => b.playtimeForeverMin - a.playtimeForeverMin)
      .slice(0, 5)
      .map((g) => ({
        appId: g.appId,
        name: g.name,
        playtimeForeverMin: g.playtimeForeverMin,
        headerUrl: g.headerUrl,
      }));
    const hoursApprox = Math.round(
      touched.reduce((s, g) => s + g.playtimeForeverMin, 0) / 60
    );
    return {
      year,
      gamesTouched: touched.length,
      hoursApprox,
      topGames: top,
      platinumInLibrary: platinumCount,
    };
  }

  function setDisplayCurrency(cur: "TRY" | "USD") {
    libraryValue.value = { ...libraryValue.value, displayCurrency: cur };
  }

  /** Ham Steam toplamını TRY kuruşa çevir */
  function toTryCents(
    cents: number,
    currency: string | null | undefined,
    usdTry: number | null
  ) {
    const c = (currency || "TRY").toUpperCase();
    if (c === "TRY" || c === "TL") return cents;
    if ((c === "USD" || c === "US") && usdTry && usdTry > 0) {
      return Math.round(cents * usdTry);
    }
    // Diğer para birimleri için şimdilik olduğu gibi (nadir)
    return cents;
  }

  async function loadLibraryValue(games: SteamGame[]) {
    if (!games.length) return;
    libraryValue.value.loading = true;
    try {
      const sample = [...games]
        .sort((a, b) => b.playtimeForeverMin - a.playtimeForeverMin)
        .slice(0, 36);
      const appIds = sample.map((g) => g.appId).join(",");

      const [res, fx] = await Promise.all([
        $fetch<{
          success: boolean;
          data: { currency: string; items: SteamPriceRow[] };
        }>("/api/steam/store-prices", { query: { appIds, cc: "TR" } }),
        $fetch<{
          success: boolean;
          data: { rate: number } | null;
        }>("/api/fx/usd-try").catch(() => null),
      ]);

      const usdTry = fx?.success && fx.data?.rate ? fx.data.rate : null;
      const items = res?.data?.items || [];
      const sourceCurrency = (res?.data?.currency || "TRY").toUpperCase();

      let totalFinalTry = 0;
      let totalInitialTry = 0;
      let priced = 0;
      for (const row of items) {
        if (row.final == null) continue;
        priced += 1;
        const cur = row.currency || sourceCurrency;
        totalFinalTry += toTryCents(row.final, cur, usdTry);
        totalInitialTry += toTryCents(
          row.initial ?? row.final,
          cur,
          usdTry
        );
      }

      libraryValue.value = {
        loading: false,
        sourceCurrency,
        displayCurrency: libraryValue.value.displayCurrency || "TRY",
        totalFinalTry: priced ? totalFinalTry : null,
        totalInitialTry: priced ? totalInitialTry : null,
        usdTryRate: usdTry,
        pricedCount: priced,
        scannedCount: sample.length,
        sampleNote: games.length > sample.length,
      };
    } catch {
      libraryValue.value.loading = false;
    }
  }

  /** Gösterilecek tutar (kuruş, seçili para biriminde) */
  const libraryValueDisplay = computed(() => {
    const v = libraryValue.value;
    const tryCents = v.totalFinalTry;
    if (tryCents == null) {
      return { cents: null as number | null, currency: v.displayCurrency };
    }
    if (v.displayCurrency === "USD") {
      if (!v.usdTryRate || v.usdTryRate <= 0) {
        return { cents: null as number | null, currency: "USD" as const };
      }
      return {
        cents: Math.round(tryCents / v.usdTryRate),
        currency: "USD" as const,
      };
    }
    return { cents: tryCents, currency: "TRY" as const };
  });

  async function loadRadarMatch(
    owned: SteamGame[],
    wishlistAppIds: number[]
  ) {
    const uid = _store.user?.uid;
    if (!uid || !$firestore) return;
    radarMatch.value.loading = true;
    try {
      const ownedIds = new Set(owned.map((g) => g.appId));
      const wish = new Set(wishlistAppIds);
      const rows: RadarSteamRow[] = [];

      for (const listKey of RADAR_LISTS) {
        const snap = await getDocs(gamesCollection($firestore, uid, listKey));
        for (const docSnap of snap.docs) {
          const data = docSnap.data() as Record<string, any>;
          const name = String(data.name || data.title || "").trim();
          if (!name) continue;
          let steamAppId = extractSteamAppId(data);
          let matchBy: RadarSteamRow["matchBy"] = steamAppId ? "appId" : "none";
          let ownedFlag = steamAppId ? ownedIds.has(steamAppId) : false;

          if (!ownedFlag) {
            const hit = owned.find((g) => namesLikelyMatch(g.name, name));
            if (hit) {
              ownedFlag = true;
              steamAppId = steamAppId || hit.appId;
              matchBy = steamAppId && matchBy === "appId" ? "appId" : "name";
            }
          }

          rows.push({
            id: `${listKey}:${docSnap.id}`,
            name,
            listKey,
            steamAppId,
            owned: ownedFlag,
            onWishlist: steamAppId ? wish.has(steamAppId) : false,
            matchBy,
            imageUrl: resolveGameCardImage(data),
          });
        }
      }

      // Önce Steam’de olanlar (Var), sonra yoklar
      rows.sort(
        (a, b) =>
          Number(b.owned) - Number(a.owned) ||
          Number(b.onWishlist) - Number(a.onWishlist) ||
          a.name.localeCompare(b.name, "tr")
      );
      radarMatch.value = {
        loading: false,
        rows,
        ownedCount: rows.filter((r) => r.owned).length,
        missingCount: rows.filter((r) => !r.owned).length,
      };
    } catch {
      radarMatch.value.loading = false;
    }
  }

  async function loadDiscounts(
    wishlist: Array<{ appId: number; name: string; discountPct: number; headerUrl?: string }>,
    radarRows: RadarSteamRow[]
  ) {
    discounts.value.loading = true;
    try {
      const fromWish = wishlist
        .filter((w) => w.discountPct > 0)
        .map((w) => ({
          appId: w.appId,
          name: w.name,
          discountPct: w.discountPct,
          final: null as number | null,
          currency: null as string | null,
          source: "wishlist" as const,
          headerUrl: w.headerUrl || null,
        }));

      const radarIds = [
        ...new Set(
          radarRows
            .filter((r) => !r.owned && r.steamAppId)
            .map((r) => r.steamAppId!)
        ),
      ].slice(0, 24);

      let fromRadar: typeof fromWish = [];
      if (radarIds.length) {
        const res = await $fetch<{
          data: { items: SteamPriceRow[] };
        }>("/api/steam/store-prices", {
          query: { appIds: radarIds.join(","), cc: "TR" },
        });
        fromRadar = (res?.data?.items || [])
          .filter((p) => p.discountPct > 0)
          .map((p) => {
            const name =
              p.name ||
              radarRows.find((r) => r.steamAppId === p.appId)?.name ||
              `#${p.appId}`;
            return {
              appId: p.appId,
              name,
              discountPct: p.discountPct,
              final: p.final,
              currency: p.currency,
              source: "radar" as const,
              headerUrl: p.headerUrl,
            };
          });
      }

      const byId = new Map<number, (typeof fromWish)[0]>();
      for (const row of [...fromWish, ...fromRadar]) {
        const prev = byId.get(row.appId);
        if (!prev || row.discountPct > prev.discountPct) byId.set(row.appId, row);
      }
      discounts.value = {
        loading: false,
        items: [...byId.values()].sort((a, b) => b.discountPct - a.discountPct),
      };
    } catch {
      discounts.value.loading = false;
    }
  }

  async function loadFriendsPlaying() {
    if (!/^\d{17}$/.test(steamId.value)) return;
    friendsLive.value.loading = true;
    friendsLive.value.privateOrFail = false;
    try {
      const res = await $fetch<{
        success: boolean;
        data: {
          total: number;
          playing: typeof friendsLive.value.playing;
        };
      }>("/api/steam/friends", { query: { steamId: steamId.value } });
      friendsLive.value = {
        loading: false,
        total: res?.data?.total || 0,
        playing: res?.data?.playing || [],
        privateOrFail: !res?.success,
      };
    } catch {
      friendsLive.value = {
        loading: false,
        total: 0,
        playing: [],
        privateOrFail: true,
      };
    }
  }

  async function refreshInsights(opts: {
    games: SteamGame[];
    platinumCount: number;
    wishlist: Array<{
      appId: number;
      name: string;
      discountPct: number;
      headerUrl?: string;
    }>;
  }) {
    yearRecap.value = buildYearRecap(opts.games, opts.platinumCount);
    await Promise.all([
      loadLibraryValue(opts.games),
      loadFriendsPlaying(),
      (async () => {
        await loadRadarMatch(
          opts.games,
          opts.wishlist.map((w) => w.appId)
        );
        await loadDiscounts(opts.wishlist, radarMatch.value.rows);
      })(),
    ]);
  }

  return {
    hub,
    libraryValue,
    libraryValueDisplay,
    setDisplayCurrency,
    yearRecap,
    radarMatch,
    discounts,
    friendsLive,
    formatSteamMoney,
    refreshInsights,
    buildYearRecap,
  };
}
