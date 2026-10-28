<script setup lang="ts">
import PanelEmptyState from "~/components/panel/PanelEmptyState.vue";
import PanelPageTitle from "~/components/panel/PanelPageTitle.vue";
import SteamAchievementsPanel from "~/components/panel/SteamAchievementsPanel.vue";
import SteamGameSkeleton from "~/components/panel/SteamGameSkeleton.vue";
import SteamInsightsPanel from "~/components/panel/SteamInsightsPanel.vue";
import { useAppLocale } from "~/composables/useAppLocale";
import { useUserProfile } from "~/composables/useUserProfile";
import { useSteamHub } from "~/composables/useSteamHub";
import {
  clearPortraitCoverFit,
  syncPortraitCoverFit,
} from "~/utils/portraitCoverFit";
import {
  advanceSteamPortraitCover,
  enrichSteamCoversFromStore,
  steamPortraitSrc,
} from "~/utils/steamCover";

definePageMeta({
  layout: "panel",
  ssr: false,
  middleware: "auth",
});

const { tx, locale } = useAppLocale();
const { user } = useUserProfile();
useSeoMeta({
  title: () => `${tx("panel.steam.title")} | npmrungame`,
  robots: "noindex, nofollow",
});

type SteamGame = {
  appId: number;
  name: string;
  playtimeForeverMin: number;
  playtime2WeeksMin: number;
  lastPlayed?: number;
  iconUrl: string | null;
  capsuleUrl: string;
  headerUrl: string;
};

type WishlistItem = {
  appId: number;
  name: string;
  priority: number;
  added: number;
  headerUrl: string;
  reviewScore: number | null;
  discountPct: number;
};

const steamHub = useSteamHub();

const steamId = computed(() => String(user.value?.steamId || "").trim());
const steamLinked = computed(() => /^\d{17}$/.test(steamId.value));

const tab = ref<"library" | "recent" | "insights" | "achievements">(
  "insights"
);
const loading = ref(false);
const errorMsg = ref("");
const search = ref("");
const sortBy = ref<"playtime" | "name" | "recent" | "completion">("recent");
const sortMenuOpen = ref(false);
const sortRoot = ref<HTMLElement | null>(null);
const filterPlatinum = ref(false);
const filterUnderOneHour = ref(false);
const LIBRARY_VIEW_KEY = "npmrungame.steam.libraryView";
const libraryView = ref<"grid" | "list">("grid");

function clearAllListCoverFits() {
  document
    .querySelectorAll<HTMLImageElement>(
      ".steam-card--list .steam-card__img:not(.steam-card__img--bleed)"
    )
    .forEach((img) => clearPortraitCoverFit(img, steamCardCoverFit));
}

function resyncGridCoverFits() {
  document
    .querySelectorAll<HTMLImageElement>(
      ".steam-card:not(.steam-card--list) .steam-card__img:not(.steam-card__img--bleed)"
    )
    .forEach((img) => {
      if (img.complete && img.naturalWidth) {
        syncPortraitCoverFit(img, steamCardCoverFit);
      }
    });
}

watch(libraryView, (v) => {
  try {
    localStorage.setItem(LIBRARY_VIEW_KEY, v);
  } catch {
    /* ignore */
  }
  nextTick(() => {
    if (v === "list") clearAllListCoverFits();
    else resyncGridCoverFits();
  });
});

function onDocClick(e: MouseEvent) {
  if (!sortMenuOpen.value || !sortRoot.value) return;
  if (!sortRoot.value.contains(e.target as Node)) sortMenuOpen.value = false;
}

onMounted(() => {
  document.addEventListener("click", onDocClick);
  try {
    const v = localStorage.getItem(LIBRARY_VIEW_KEY);
    if (v === "grid" || v === "list") libraryView.value = v;
  } catch {
    /* ignore */
  }
});
onBeforeUnmount(() => document.removeEventListener("click", onDocClick));

const sortOptions = computed(() => [
  { value: "completion" as const, label: tx("panel.steam.sortCompletion"), icon: "mdi-trophy-outline" },
  { value: "playtime" as const, label: tx("panel.steam.sortPlaytime"), icon: "mdi-clock-outline" },
  { value: "name" as const, label: tx("panel.steam.sortName"), icon: "mdi-sort-alphabetical-ascending" },
  { value: "recent" as const, label: tx("panel.steam.sortRecent"), icon: "mdi-history" },
]);

const sortLabel = computed(
  () => sortOptions.value.find((o) => o.value === sortBy.value)?.label || ""
);

function pickSort(value: typeof sortBy.value) {
  sortBy.value = value;
  sortMenuOpen.value = false;
}

function togglePlatinumFilter() {
  filterPlatinum.value = !filterPlatinum.value;
  if (filterPlatinum.value) filterUnderOneHour.value = false;
}

function toggleUnderOneHourFilter() {
  filterUnderOneHour.value = !filterUnderOneHour.value;
  if (filterUnderOneHour.value) filterPlatinum.value = false;
}

const summary = ref<{
  personaname?: string;
  avatarfull?: string;
  gameextrainfo?: string;
  personastate?: number;
  gameid?: string;
  profileurl?: string;
} | null>(null);

const steamProfileUrl = computed(() => {
  const fromApi = String(summary.value?.profileurl || "").trim();
  if (fromApi) return fromApi;
  if (steamLinked.value) {
    return `https://steamcommunity.com/profiles/${steamId.value}`;
  }
  return "";
});

const library = ref<SteamGame[]>([]);
const gameCount = ref(0);
const totalPlaytimeMin = ref(0);
const recent = ref<SteamGame[]>([]);
const wishlist = ref<WishlistItem[]>([]);
const wishlistMsg = ref("");

type AchProgress = {
  unlocked: number;
  total: number;
  completionPct: number;
  isComplete: boolean;
  status: "ready" | "none";
};

/** appId → başarım özeti (arka plan taraması) */
const progressByApp = ref<Record<number, AchProgress>>({});
const progressScanning = ref(false);
let progressGen = 0;

const MIN_PLAY_MINUTES = 60;

function hours(min: number) {
  if (!min) return "0";
  const h = min / 60;
  return h >= 100 ? Math.round(h).toString() : h.toFixed(1);
}

function formatHoursLabel(min: number) {
  if (!min) return tx("panel.steam.neverPlayed");
  return `${hours(min)} ${tx("panel.steam.hours")}`;
}

function formatLastPlayed(ts?: number) {
  if (!ts) return tx("panel.steam.lastPlayedNever");
  return new Date(ts * 1000).toLocaleDateString(
    locale.value === "en" ? "en-GB" : "tr-TR",
    { day: "numeric", month: "short", year: "numeric" }
  );
}

function listCoverSrc(g: SteamGame) {
  return g.headerUrl || steamPortraitSrc(g);
}

const steamCardCoverFit = {
  mediaSelector: ".steam-card__media",
  imgBaseClass: "steam-card__img",
  bleedClass: "steam-card__img--bleed",
  fgClass: "steam-card__img--fg",
  mediaWideClass: "steam-card__media--wide",
} as const;

function onCoverLoad(e: Event) {
  const el = e.target as HTMLImageElement;
  /* Liste: tek kapak — bleed/fg yok */
  if (el.closest(".steam-card--list")) {
    clearPortraitCoverFit(el, steamCardCoverFit);
    return;
  }
  syncPortraitCoverFit(el, steamCardCoverFit);
}

function onCoverError(e: Event, g: SteamGame) {
  clearPortraitCoverFit(e.target as HTMLImageElement, steamCardCoverFit);
  advanceSteamPortraitCover(e, g);
}

/** 1 saatten az oynananlar listede yok — chip’te sayılır */
const underOneHourCount = computed(
  () => library.value.filter((g) => g.playtimeForeverMin < MIN_PLAY_MINUTES).length
);

const playedLibrary = computed(() =>
  library.value.filter((g) => g.playtimeForeverMin >= MIN_PLAY_MINUTES)
);

function getProgress(appId: number): AchProgress | null {
  return progressByApp.value[appId] || null;
}

function platinumFirst(a: SteamGame, b: SteamGame) {
  const pa = getProgress(a.appId);
  const pb = getProgress(b.appId);
  const ca = pa?.isComplete ? 1 : 0;
  const cb = pb?.isComplete ? 1 : 0;
  if (ca !== cb) return cb - ca;
  const pctA = pa?.status === "ready" ? pa.completionPct : -1;
  const pctB = pb?.status === "ready" ? pb.completionPct : -1;
  if (pctA !== pctB) return pctB - pctA;
  return b.playtimeForeverMin - a.playtimeForeverMin;
}

const underOneHourLibrary = computed(() =>
  library.value.filter((g) => g.playtimeForeverMin < MIN_PLAY_MINUTES)
);

const filteredLibrary = computed(() => {
  const q = search.value.trim().toLowerCase();
  let list = filterUnderOneHour.value
    ? underOneHourLibrary.value
    : playedLibrary.value;
  if (filterPlatinum.value) {
    list = list.filter((g) => getProgress(g.appId)?.isComplete);
  }
  if (q) list = list.filter((g) => g.name.toLowerCase().includes(q));
  const sorted = [...list];
  if (sortBy.value === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name, "tr"));
  } else if (sortBy.value === "recent") {
    sorted.sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
  } else if (sortBy.value === "completion") {
    sorted.sort(platinumFirst);
  } else {
    sorted.sort((a, b) => {
      const ca = getProgress(a.appId)?.isComplete ? 1 : 0;
      const cb = getProgress(b.appId)?.isComplete ? 1 : 0;
      if (ca !== cb) return cb - ca;
      return b.playtimeForeverMin - a.playtimeForeverMin;
    });
  }
  return sorted;
});

const recentVisible = computed(() =>
  recent.value.filter((g) => g.playtimeForeverMin >= MIN_PLAY_MINUTES)
);

const underOneHourChip = computed(() =>
  tx(
    filterUnderOneHour.value
      ? "panel.steam.underOneHourOn"
      : "panel.steam.underOneHour"
  ).replace("{n}", String(underOneHourCount.value))
);

const platinumCount = computed(
  () =>
    Object.values(progressByApp.value).filter((p) => p.isComplete).length
);

const platinumChip = computed(() =>
  tx(
    filterPlatinum.value
      ? "panel.steam.platinumChipOn"
      : "panel.steam.platinumChip"
  ).replace("{n}", String(platinumCount.value))
);

/** Banner arka planı: şu an oynanan veya en çok oynanan oyun kapakı */
const bannerBg = computed(() => {
  const playingId = String(summary.value?.gameid || "").trim();
  if (playingId) {
    const hit = library.value.find((g) => String(g.appId) === playingId);
    if (hit?.headerUrl) return hit.headerUrl;
    return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${playingId}/header.jpg`;
  }
  const top =
    playedLibrary.value[0] ||
    [...library.value].sort(
      (a, b) => b.playtimeForeverMin - a.playtimeForeverMin
    )[0];
  return top?.headerUrl || "";
});

const bannerPlaying = computed(() =>
  String(summary.value?.gameextrainfo || "").trim()
);

async function scanAchievementProgress(games: SteamGame[]) {
  const gen = ++progressGen;
  progressByApp.value = {};
  progressScanning.value = true;
  const queue = [...games].sort(
    (a, b) => b.playtimeForeverMin - a.playtimeForeverMin
  );
  const concurrency = 4;
  let i = 0;

  async function worker() {
    while (i < queue.length) {
      if (gen !== progressGen) return;
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
        if (gen !== progressGen) return;
        if (res?.success && res.data && res.data.total > 0) {
          const row = {
            unlocked: res.data.unlocked,
            total: res.data.total,
            completionPct: res.data.completionPct,
            isComplete: res.data.isComplete,
            status: "ready" as const,
          };
          progressByApp.value = { ...progressByApp.value, [g.appId]: row };
          steamHub.progressByApp.value = {
            ...steamHub.progressByApp.value,
            [g.appId]: row,
          };
        } else {
          const row = {
            unlocked: 0,
            total: 0,
            completionPct: 0,
            isComplete: false,
            status: "none" as const,
          };
          progressByApp.value = { ...progressByApp.value, [g.appId]: row };
          steamHub.progressByApp.value = {
            ...steamHub.progressByApp.value,
            [g.appId]: row,
          };
        }
      } catch {
        if (gen !== progressGen) return;
        const row = {
          unlocked: 0,
          total: 0,
          completionPct: 0,
          isComplete: false,
          status: "none" as const,
        };
        progressByApp.value = { ...progressByApp.value, [g.appId]: row };
        steamHub.progressByApp.value = {
          ...steamHub.progressByApp.value,
          [g.appId]: row,
        };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, queue.length) }, () => worker())
  );
  if (gen === progressGen) {
    progressScanning.value = false;
    steamHub.progressScanning.value = false;
  }
}

async function loadAll() {
  if (!steamLinked.value) return;
  loading.value = true;
  errorMsg.value = "";
  wishlistMsg.value = "";
  progressGen += 1;
  progressScanning.value = false;
  progressByApp.value = {};
  try {
    const sid = steamId.value;
    const [sumRes, ownedRes, recentRes, wishRes] = await Promise.all([
      $fetch<{ success: boolean; data: typeof summary.value }>(
        "/api/steam/player-summary",
        { query: { steamId: sid } }
      ),
      $fetch<{
        success: boolean;
        data: {
          gameCount: number;
          totalPlaytimeMin: number;
          games: SteamGame[];
        };
      }>("/api/steam/owned-games", { query: { steamId: sid } }),
      $fetch<{ success: boolean; data: { games: SteamGame[] } }>(
        "/api/steam/recently-played",
        { query: { steamId: sid } }
      ),
      $fetch<{
        success: boolean;
        data: { count: number; items: WishlistItem[] };
        message?: string;
      }>("/api/steam/wishlist", { query: { steamId: sid } }),
    ]);

    summary.value = sumRes?.data || null;
    library.value = ownedRes?.data?.games || [];
    gameCount.value = ownedRes?.data?.gameCount || library.value.length;
    totalPlaytimeMin.value = ownedRes?.data?.totalPlaytimeMin || 0;
    recent.value = recentRes?.data?.games || [];

    // Yeni oyunlar hash’li store kapağı kullanır — klasik header.jpg 404 oluyor
    await enrichSteamCoversFromStore(library.value);
    await enrichSteamCoversFromStore(recent.value);

    steamHub.library.value = library.value;
    steamHub.gameCount.value = gameCount.value;
    steamHub.totalPlaytimeMin.value = totalPlaytimeMin.value;
    steamHub.libraryLoaded.value = true;
    steamHub.progressByApp.value = {};
    steamHub.progressScanning.value = true;

    const wishItems = (wishRes?.data?.items || []).filter(
      (w) =>
        Number.isFinite(w.appId) &&
        w.appId > 0 &&
        typeof w.name === "string" &&
        w.name.length > 0
    );
    // Bozuk API yanıtı (HTML→char map) tarayıcıyı kilitlemesin
    wishlist.value = wishItems.length > 5000 ? [] : wishItems;
    if (wishItems.length > 5000) {
      wishlistMsg.value = tx("panel.steam.wishlistEmpty");
    } else if (!wishRes?.success) {
      wishlistMsg.value = wishRes?.message || tx("panel.steam.wishlistEmpty");
    }

    const toScan = library.value.filter(
      (g) => g.playtimeForeverMin >= MIN_PLAY_MINUTES
    );
    void scanAchievementProgress(toScan);
  } catch (e: any) {
    errorMsg.value =
      e?.data?.message || e?.message || tx("panel.steam.loadFail");
  } finally {
    loading.value = false;
  }
}

function progressLabel(appId: number) {
  const p = getProgress(appId);
  if (!p || p.status !== "ready" || !p.total) return "";
  if (p.isComplete) return tx("panel.steam.platinum");
  return `%${p.completionPct}`;
}

/** Kart gövdesi hep aynı yükseklik — başarım gizli/yoksa yer tutucu */
function cardAchMeta(appId: number): {
  kind: "ready" | "scanning" | "none";
  pct: number;
  label: string;
} {
  const p = getProgress(appId);
  if (p?.status === "ready" && p.total > 0) {
    return {
      kind: "ready",
      pct: p.completionPct,
      label: tx("panel.steam.achProgress")
        .replace("{u}", String(p.unlocked))
        .replace("{t}", String(p.total)),
    };
  }
  if (progressScanning.value && !p) {
    return {
      kind: "scanning",
      pct: 0,
      label: tx("panel.steam.platinumScanning"),
    };
  }
  return {
    kind: "none",
    pct: 0,
    label: tx("panel.steam.achPrivate"),
  };
}

watch(
  steamId,
  (id) => {
    if (/^\d{17}$/.test(id)) loadAll();
  },
  { immediate: true }
);

const route = useRoute();
onMounted(() => {
  const q = String(route.query.tab || "");
  if (
    q === "insights" ||
    q === "recent" ||
    q === "library" ||
    q === "achievements"
  ) {
    tab.value = q;
  }
});
</script>

<template>
  <div
    class="steam-hub"
    :class="{
      'steam-hub--shelf':
        tab === 'library' || tab === 'achievements' || tab === 'recent',
    }"
  >
    <header class="steam-hub__head">
      <div>
        <PanelPageTitle :text="tx('panel.steam.title')" />
        <p class="steam-hub__sub">{{ tx("panel.steam.subtitle") }}</p>
      </div>
      <div v-if="steamLinked" class="steam-hub__actions">
        <button
          type="button"
          class="steam-btn"
          :disabled="loading"
          @click="loadAll"
        >
          <v-icon icon="mdi-refresh" size="18" />
          {{ tx("panel.steam.refresh") }}
        </button>
      </div>
    </header>

    <div v-if="!steamLinked" class="steam-empty">
      <v-icon icon="mdi-steam" size="40" />
      <p>{{ tx("panel.steam.connectCta") }}</p>
      <NuxtLink to="/dashboard/account" class="steam-btn steam-btn--primary">
        {{ tx("panel.steam.openAccount") }}
      </NuxtLink>
    </div>

    <template v-else>
      <section
        v-if="summary || gameCount"
        class="steam-banner"
        :class="{ 'steam-banner--bg': !!bannerBg }"
      >
        <div
          v-if="bannerBg"
          class="steam-banner__bg"
          :style="{ backgroundImage: `url(${bannerBg})` }"
          aria-hidden="true"
        />
        <div class="steam-banner__veil" aria-hidden="true" />
        <div class="steam-banner__inner">
          <div class="steam-banner__profile">
            <img
              v-if="summary?.avatarfull"
              :src="summary.avatarfull"
              alt=""
              class="steam-banner__av"
              width="88"
              height="88"
            />
            <div class="steam-banner__meta">
              <span class="steam-banner__brand">
                <v-icon icon="mdi-steam" size="18" />
                Steam
              </span>
              <h2 class="steam-banner__name">
                {{ summary?.personaname || "Steam" }}
              </h2>
              <p v-if="bannerPlaying" class="steam-banner__playing">
                <span class="steam-banner__live" />
                {{ tx("panel.steam.playingNow") }}: {{ bannerPlaying }}
              </p>
              <a
                v-if="steamProfileUrl"
                class="steam-banner__profile-link"
                :href="steamProfileUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <v-icon icon="mdi-open-in-new" size="16" />
                {{ tx("panel.steam.profileLink") }}
              </a>
            </div>
          </div>
          <div class="steam-banner__stats">
            <div class="steam-banner__stat">
              <span class="steam-banner__stat-n">{{ gameCount }}</span>
              <span class="steam-banner__stat-l">{{ tx("panel.steam.games") }}</span>
            </div>
            <div class="steam-banner__stat">
              <span class="steam-banner__stat-n">{{ hours(totalPlaytimeMin) }}</span>
              <span class="steam-banner__stat-l">{{ tx("panel.steam.hours") }}</span>
            </div>
            <div class="steam-banner__stat steam-banner__stat--plat">
              <v-icon icon="mdi-trophy" size="16" class="steam-banner__stat-ico" />
              <span class="steam-banner__stat-n">{{ platinumCount }}</span>
              <span class="steam-banner__stat-l">{{ tx("panel.steam.platinum") }}</span>
            </div>
          </div>
        </div>
      </section>

      <p v-if="errorMsg" class="steam-msg steam-msg--err">{{ errorMsg }}</p>
      <div class="steam-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          class="steam-tab"
          :class="{ 'steam-tab--on': tab === 'insights' }"
          :aria-selected="tab === 'insights'"
          @click="tab = 'insights'"
        >
          {{ tx("panel.steam.insights") }}
        </button>
        <button
          type="button"
          role="tab"
          class="steam-tab"
          :class="{ 'steam-tab--on': tab === 'library' }"
          :aria-selected="tab === 'library'"
          @click="tab = 'library'"
        >
          {{ tx("panel.steam.library") }}
          <span class="steam-tab__count">{{ playedLibrary.length }}</span>
        </button>
        <button
          type="button"
          role="tab"
          class="steam-tab"
          :class="{ 'steam-tab--on': tab === 'achievements' }"
          :aria-selected="tab === 'achievements'"
          @click="tab = 'achievements'"
        >
          <v-icon icon="mdi-trophy-outline" size="16" />
          {{ tx("panel.steam.allAchievements") }}
        </button>
        <button
          type="button"
          role="tab"
          class="steam-tab"
          :class="{ 'steam-tab--on': tab === 'recent' }"
          :aria-selected="tab === 'recent'"
          @click="tab = 'recent'"
        >
          {{ tx("panel.steam.recent") }}
          <span class="steam-tab__count">{{ recentVisible.length }}</span>
        </button>
      </div>

      <div
        v-if="loading && tab !== 'insights'"
        class="steam-pane steam-skel"
      >
        <div class="steam-skel__toolbar" aria-hidden="true">
          <span class="steam-skel__search" />
          <span class="steam-skel__sort" />
          <span class="steam-skel__chip" />
        </div>
        <SteamGameSkeleton :count="8" />
      </div>

      <SteamInsightsPanel
        v-else-if="tab === 'insights'"
        :games="library"
        :platinum-count="platinumCount"
        :wishlist="wishlist"
        :ready="!loading"
      />

      <div
        v-else-if="tab === 'achievements'"
        class="steam-pane steam-pane--ach"
      >
        <SteamAchievementsPanel
          :games="playedLibrary"
          :platinum-count="platinumCount"
          :progress-scanning="progressScanning"
          :loading="loading"
          :get-progress="getProgress"
        />
      </div>

      <div
        v-else-if="tab === 'library'"
        class="steam-pane"
      >
        <div class="steam-toolbar">
          <input
            v-model="search"
            type="search"
            class="steam-search steam-search--compact"
            :placeholder="tx('panel.steam.search')"
          />

          <div ref="sortRoot" class="steam-sort">
            <button
              type="button"
              class="steam-sort__btn"
              :aria-expanded="sortMenuOpen"
              aria-haspopup="listbox"
              @click="sortMenuOpen = !sortMenuOpen"
            >
              <v-icon icon="mdi-sort-variant" size="18" />
              <span class="steam-sort__label">{{ sortLabel }}</span>
              <v-icon
                :icon="sortMenuOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                size="18"
              />
            </button>
            <ul
              v-if="sortMenuOpen"
              class="steam-sort__menu"
              role="listbox"
            >
              <li v-for="opt in sortOptions" :key="opt.value">
                <button
                  type="button"
                  class="steam-sort__opt"
                  :class="{ 'steam-sort__opt--on': sortBy === opt.value }"
                  role="option"
                  :aria-selected="sortBy === opt.value"
                  @click="pickSort(opt.value)"
                >
                  <v-icon :icon="opt.icon" size="18" />
                  {{ opt.label }}
                  <v-icon
                    v-if="sortBy === opt.value"
                    icon="mdi-check"
                    size="16"
                    class="steam-sort__check"
                  />
                </button>
              </li>
            </ul>
          </div>

          <div class="steam-view" role="group" :aria-label="tx('panel.steam.library')">
            <button
              type="button"
              class="steam-view__btn"
              :class="{ 'steam-view__btn--on': libraryView === 'grid' }"
              :aria-pressed="libraryView === 'grid'"
              :title="tx('panel.steam.viewGrid')"
              @click="libraryView = 'grid'"
            >
              <v-icon icon="mdi-view-grid-outline" size="20" />
            </button>
            <button
              type="button"
              class="steam-view__btn"
              :class="{ 'steam-view__btn--on': libraryView === 'list' }"
              :aria-pressed="libraryView === 'list'"
              :title="tx('panel.steam.viewList')"
              @click="libraryView = 'list'"
            >
              <v-icon icon="mdi-view-list-outline" size="20" />
            </button>
          </div>
        </div>

        <div
          v-if="platinumCount > 0 || progressScanning || underOneHourCount > 0"
          class="steam-filters"
        >
          <button
            v-if="platinumCount > 0 || progressScanning"
            type="button"
            class="steam-chip steam-chip--plat"
            :class="{
              'steam-chip--on': filterPlatinum,
              'steam-chip--scan': progressScanning && !platinumCount,
            }"
            :disabled="progressScanning && !platinumCount"
            :title="platinumChip"
            @click="togglePlatinumFilter"
          >
            <v-progress-circular
              v-if="progressScanning && !platinumCount"
              indeterminate
              size="14"
              width="2"
              color="#69f0ae"
            />
            <v-icon v-else icon="mdi-trophy" size="16" />
            {{
              progressScanning && !platinumCount
                ? tx("panel.steam.platinumScanning")
                : platinumChip
            }}
          </button>
          <button
            v-if="underOneHourCount > 0"
            type="button"
            class="steam-chip steam-chip--low"
            :class="{ 'steam-chip--on': filterUnderOneHour }"
            :title="underOneHourChip"
            @click="toggleUnderOneHourFilter"
          >
            <v-icon icon="mdi-timer-sand" size="16" />
            {{ underOneHourChip }}
          </button>
        </div>

        <ul
          :class="libraryView === 'list' ? 'steam-list' : 'steam-grid'"
        >
          <li v-for="g in filteredLibrary" :key="g.appId">
            <NuxtLink
              :to="`/dashboard/platforms/steam/games/${g.appId}`"
              class="steam-card"
              :class="{
                'steam-card--plat': getProgress(g.appId)?.isComplete,
                'steam-card--list': libraryView === 'list',
              }"
              :aria-label="g.name"
            >
              <div class="steam-card__media">
                <img
                  :src="
                    libraryView === 'list'
                      ? listCoverSrc(g)
                      : steamPortraitSrc(g)
                  "
                  :alt="g.name"
                  class="steam-card__img"
                  loading="lazy"
                  @load="onCoverLoad"
                  @error="onCoverError($event, g)"
                />
                <div class="steam-card__shade" aria-hidden="true" />
                <template v-if="libraryView !== 'list'">
                  <span class="steam-card__hours">
                    <v-icon icon="mdi-clock-outline" size="14" />
                    {{ formatHoursLabel(g.playtimeForeverMin) }}
                  </span>
                  <span
                    v-if="getProgress(g.appId)?.isComplete"
                    class="steam-card__plat"
                  >
                    <v-icon icon="mdi-trophy" size="14" />
                    {{ tx("panel.steam.platinum") }} · %100
                  </span>
                  <span
                    v-else-if="progressLabel(g.appId)"
                    class="steam-card__pct"
                  >
                    {{ progressLabel(g.appId) }}
                  </span>
                </template>
              </div>
              <div class="steam-card__body">
                <strong class="steam-card__name" :title="g.name">{{
                  g.name
                }}</strong>
                <div v-if="libraryView === 'list'" class="steam-card__facts">
                  <div class="steam-card__fact">
                    <span class="steam-card__fact-l">{{
                      tx("panel.steam.totalPlay")
                    }}</span>
                    <strong class="steam-card__fact-v">
                      <v-icon icon="mdi-clock-outline" size="15" />
                      {{ formatHoursLabel(g.playtimeForeverMin) }}
                    </strong>
                  </div>
                  <div class="steam-card__fact">
                    <span class="steam-card__fact-l">{{
                      tx("panel.steam.completionLabel")
                    }}</span>
                    <strong
                      class="steam-card__fact-v"
                      :class="{
                        'steam-card__fact-v--plat': getProgress(g.appId)
                          ?.isComplete,
                      }"
                    >
                      <v-icon
                        :icon="
                          getProgress(g.appId)?.isComplete
                            ? 'mdi-trophy'
                            : 'mdi-chart-arc'
                        "
                        size="15"
                      />
                      <template v-if="getProgress(g.appId)?.isComplete">
                        {{ tx("panel.steam.platinum") }} · %100
                      </template>
                      <template v-else-if="progressLabel(g.appId)">
                        {{ progressLabel(g.appId) }}
                      </template>
                      <template v-else>
                        {{ cardAchMeta(g.appId).label }}
                      </template>
                    </strong>
                  </div>
                  <div class="steam-card__fact">
                    <span class="steam-card__fact-l">{{
                      tx("panel.steam.lastPlayedLabel")
                    }}</span>
                    <strong class="steam-card__fact-v">
                      <v-icon icon="mdi-calendar-outline" size="15" />
                      {{ formatLastPlayed(g.lastPlayed) }}
                    </strong>
                  </div>
                  <div
                    v-if="g.playtime2WeeksMin > 0"
                    class="steam-card__fact"
                  >
                    <span class="steam-card__fact-l">{{
                      tx("panel.steam.weeksPlay")
                    }}</span>
                    <strong class="steam-card__fact-v">
                      <v-icon icon="mdi-history" size="15" />
                      {{ hours(g.playtime2WeeksMin) }}
                      {{ tx("panel.steam.hours") }}
                    </strong>
                  </div>
                </div>
                <span
                  class="steam-card__bar-wrap"
                  :class="{
                    'steam-card__bar-wrap--muted':
                      cardAchMeta(g.appId).kind !== 'ready',
                  }"
                >
                  <span class="steam-card__bar-track">
                    <span
                      class="steam-card__bar"
                      :style="{
                        width: `${cardAchMeta(g.appId).pct}%`,
                      }"
                    />
                  </span>
                  <em>{{ cardAchMeta(g.appId).label }}</em>
                </span>
                <v-icon
                  v-if="libraryView === 'list'"
                  icon="mdi-chevron-right"
                  size="22"
                  class="steam-card__chev"
                />
              </div>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div
        v-else-if="tab === 'recent'"
        class="steam-pane"
      >
        <div v-if="!recentVisible.length" class="steam-recent-empty">
          <PanelEmptyState
            icon="mdi-calendar-clock-outline"
            :title="tx('panel.steam.recentEmptyTitle')"
            :description="tx('panel.steam.recentEmptyBody')"
            :tips="[
              {
                icon: 'mdi-information-outline',
                text: tx('panel.steam.recentEmptyTip'),
              },
            ]"
            :primary-action-text="tx('panel.steam.recentEmptyCta')"
            primary-action-icon="mdi-bookshelf"
            @primary-action="tab = 'library'"
          />
        </div>
        <ul v-else class="steam-grid">
          <li v-for="g in recentVisible" :key="g.appId">
            <NuxtLink
              :to="`/dashboard/platforms/steam/games/${g.appId}`"
              class="steam-card"
              :aria-label="g.name"
            >
              <div class="steam-card__media">
                <img
                  :src="steamPortraitSrc(g)"
                  :alt="g.name"
                  class="steam-card__img"
                  loading="lazy"
                  @load="onCoverLoad"
                  @error="onCoverError($event, g)"
                />
                <div class="steam-card__shade" aria-hidden="true" />
                <span class="steam-card__hours">
                  <v-icon icon="mdi-clock-outline" size="14" />
                  {{ hours(g.playtime2WeeksMin) }} {{ tx("panel.steam.hours") }}
                  · 2w
                </span>
                <div class="steam-card__body">
                  <strong class="steam-card__name">{{ g.name }}</strong>
                </div>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </div>

    </template>
  </div>
</template>

<style scoped>
.steam-hub {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  width: 100%;
  max-width: 1280px;
  margin-inline: auto;
  box-sizing: border-box;
}
.steam-hub__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.steam-hub__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  align-items: center;
}
.steam-hub__sub {
  margin: 0.45rem 0 0;
  max-width: 48rem;
  color: var(--panel-muted, #64748b);
  font-size: 0.95rem;
  line-height: 1.45;
}
.steam-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.95rem;
  border-radius: 10px;
  border: 1px solid var(--panel-card-border, rgb(15 23 42 / 0.1));
  background: var(--panel-card, #e8edf4);
  color: var(--panel-text, #0f172a);
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  text-decoration: none;
  box-shadow: none;
}
.steam-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.steam-btn--primary {
  background: var(--panel-accent, #059669);
  border-color: transparent;
  color: var(--panel-accent-ink, #fff);
  box-shadow: none;
}
.steam-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  padding: 2.5rem 1.25rem;
  border-radius: 16px;
  border: 1px dashed var(--panel-border, rgb(15 23 42 / 0.12));
  color: var(--panel-muted, #64748b);
  text-align: center;
  background: var(--panel-soft, #c2cad6);
}
.steam-empty--inline {
  border-style: solid;
  padding: 1.5rem;
}
.steam-banner {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 24px;
  min-height: 300px;
  border: 1px solid rgba(105, 240, 174, 0.18);
  background: linear-gradient(135deg, #0a1813 0%, #143028 55%, #07140f 100%);
  box-shadow:
    0 22px 48px rgba(4, 16, 12, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.steam-banner__bg {
  position: absolute;
  inset: -2%;
  background-size: cover;
  /* Steam header’larda logo/üst kompozisyon genelde üstte; cover kırpınca top’a yasla */
  background-position: center top;
  filter: saturate(1.15) brightness(0.62) contrast(1.05);
  transform: scale(1.01);
  z-index: 0;
}
.steam-banner__veil {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    radial-gradient(
      80% 90% at 12% 50%,
      rgba(4, 14, 10, 0.88) 0%,
      rgba(4, 14, 10, 0.35) 55%,
      transparent 78%
    ),
    linear-gradient(
      100deg,
      rgba(4, 14, 10, 0.94) 0%,
      rgba(4, 14, 10, 0.55) 48%,
      rgba(4, 14, 10, 0.28) 100%
    ),
    linear-gradient(180deg, transparent 50%, rgba(2, 8, 6, 0.65) 100%);
}
.steam-banner__inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 2.15rem 1.9rem 1.85rem;
  min-height: 300px;
}
.steam-banner__profile {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  min-width: 0;
}
.steam-banner__av {
  width: 120px;
  height: 120px;
  border-radius: 28px;
  object-fit: cover;
  border: 3px solid rgba(105, 240, 174, 0.65);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.5),
    0 0 0 6px rgba(105, 240, 174, 0.08);
  background: #0a1612;
}
.steam-banner__meta {
  min-width: 0;
}
.steam-banner__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.35rem;
  padding: 0.28rem 0.65rem;
  border-radius: 999px;
  background: rgba(105, 240, 174, 0.16);
  border: 1px solid rgba(105, 240, 174, 0.35);
  color: #9ff5c0;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
}
.steam-banner__name {
  margin: 0;
  font-size: clamp(1.65rem, 3vw, 2.35rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #f3fff8;
  line-height: 1.1;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.55);
}
.steam-banner__playing {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0.45rem 0 0;
  color: #69f0ae;
  font-size: 0.92rem;
  font-weight: 700;
}
.steam-banner__live {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #69f0ae;
  box-shadow: 0 0 0 0 rgba(105, 240, 174, 0.7);
  animation: steam-pulse 1.6s ease infinite;
}
@keyframes steam-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(105, 240, 174, 0.55);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(105, 240, 174, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(105, 240, 174, 0);
  }
}
.steam-banner__profile-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.65rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(105, 240, 174, 0.35);
  background: rgba(105, 240, 174, 0.12);
  color: #9ff5c0;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  width: fit-content;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.steam-banner__profile-link:hover {
  background: rgba(105, 240, 174, 0.22);
  border-color: rgba(105, 240, 174, 0.55);
}
.steam-banner__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.steam-banner__stat {
  position: relative;
  min-width: 7rem;
  padding: 1rem 1.2rem 0.9rem;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.48);
  border: 1px solid rgba(105, 240, 174, 0.22);
  backdrop-filter: blur(14px);
  text-align: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
.steam-banner__stat-n {
  display: block;
  font-size: 1.7rem;
  font-weight: 800;
  color: #9ff5c0;
  line-height: 1.05;
  letter-spacing: -0.02em;
}
.steam-banner__stat-l {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(210, 255, 230, 0.58);
}
.steam-banner__stat-ico {
  position: absolute;
  top: 0.45rem;
  right: 0.5rem;
  color: rgba(245, 215, 110, 0.85) !important;
  opacity: 0.9;
}
.steam-banner__stat--plat {
  border-color: rgba(245, 215, 110, 0.5);
  background:
    linear-gradient(
      160deg,
      rgba(245, 215, 110, 0.2),
      rgba(0, 0, 0, 0.45) 55%
    );
  box-shadow:
    inset 0 1px 0 rgba(255, 236, 170, 0.18),
    0 8px 22px rgba(120, 90, 20, 0.18);
}
.steam-banner__stat--plat .steam-banner__stat-n {
  color: #f5d76e;
}
.steam-msg {
  margin: 0;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  font-size: 0.9rem;
}
.steam-msg--err {
  background: color-mix(in srgb, #dc2626 12%, var(--panel-card, #fff));
  color: #b91c1c;
  border: 1px solid color-mix(in srgb, #dc2626 28%, transparent);
}
.steam-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.steam-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  border: 1.5px solid var(--panel-card-border, rgb(15 23 42 / 0.18));
  background: transparent;
  color: var(--panel-muted, #64748b);
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  text-decoration: none;
  transition:
    border-color 0.15s ease,
    color 0.15s ease,
    background 0.15s ease;
}
.steam-tab:hover {
  color: var(--panel-text, #0f172a);
  border-color: color-mix(in srgb, var(--panel-accent, #059669) 45%, transparent);
  background: transparent;
}
.steam-tab--on {
  background: color-mix(in srgb, var(--panel-accent, #047857) 18%, var(--panel-soft, #c2cad6));
  border-color: var(--panel-accent, #047857);
  color: var(--panel-accent, #047857);
  box-shadow: none;
}
.steam-tab__count {
  font-size: 0.75rem;
  opacity: 0.75;
}
/*
 * Banner/başlık tüm sekmelerde aynı — Keşif’te sorun yok.
 * Kütüphane/Başarım: soft kart dolgusu yok → boş #b9c1cf deniz + toolbar
 * (panel-card #ced5e0 zeminden DAHA AÇIK) = “sayfa parladı”.
 */
.steam-pane {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.steam-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 0.55rem;
  padding: 0;
  border-radius: 0;
  background: transparent;
  border: none;
}
.steam-search {
  flex: 1 1 200px;
  min-width: 0;
  height: 2.75rem;
  box-sizing: border-box;
  padding: 0 0.95rem;
  border-radius: 12px;
  border: 1px solid var(--panel-card-border, rgb(15 23 42 / 0.12));
  background: var(--panel-card, #0c1220);
  color: var(--panel-text, #0f172a);
  font-size: 0.9rem;
  box-shadow: none;
}
.steam-search--compact {
  flex: 0 1 240px;
  max-width: 260px;
  min-width: 160px;
}
/* Light: Keşif ile aynı token’lar — ekstra gri kabuk yok */
:global(.panel-shell[data-theme="light"] .steam-hub--shelf .steam-pane) {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
}
.steam-search::placeholder {
  color: var(--panel-muted, #64748b);
  opacity: 1;
}
.steam-sort {
  position: relative;
  flex: 0 0 auto;
}
.steam-sort__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  height: 2.75rem;
  box-sizing: border-box;
  min-width: 10.5rem;
  padding: 0 0.85rem;
  border-radius: 12px;
  border: 1px solid var(--panel-card-border, rgb(15 23 42 / 0.12));
  background: var(--panel-card, #0c1220);
  color: var(--panel-text, #0f172a);
  cursor: pointer;
  box-shadow: none;
}
.steam-sort__label {
  flex: 1;
  font-size: 0.88rem;
  font-weight: 700;
  text-align: left;
  white-space: nowrap;
}
.steam-view {
  display: inline-flex;
  align-items: stretch;
  height: 2.75rem;
  margin-left: auto;
  padding: 0.2rem;
  border-radius: 12px;
  border: 1px solid var(--panel-card-border, rgb(15 23 42 / 0.12));
  background: var(--panel-card, #0c1220);
  box-sizing: border-box;
}
.steam-view__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.35rem;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--panel-muted, #64748b);
  cursor: pointer;
}
.steam-view__btn--on {
  background: var(--panel-icon-bg, rgb(105 240 174 / 0.14));
  color: var(--panel-accent, #047857);
}
.steam-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.15rem;
}
.steam-sort__menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 20;
  min-width: 100%;
  margin: 0;
  padding: 0.35rem;
  list-style: none;
  border-radius: 14px;
  border: 1px solid var(--panel-card-border, rgb(15 23 42 / 0.12));
  background: var(--panel-card, #0c1220);
  box-shadow: var(--panel-card-shadow, 0 12px 28px rgb(0 0 0 / 0.22));
}
.steam-sort__opt {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.55rem 0.65rem;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--panel-text, #0f172a);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}
.steam-sort__opt:hover {
  background: var(--panel-soft, rgb(0 0 0 / 0.22));
}
.steam-sort__opt--on {
  background: var(--panel-icon-bg, rgb(105 240 174 / 0.12));
  color: var(--panel-accent, #69f0ae);
}
.steam-sort__check {
  margin-left: auto;
  color: var(--panel-accent, #69f0ae);
}
.steam-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, #d97706 50%, var(--panel-card-border));
  background: color-mix(in srgb, #d97706 14%, var(--panel-card, #ced5e0));
  color: #9a3412;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1.2;
  white-space: nowrap;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    background 0.12s ease;
}
.steam-chip:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgb(15 23 42 / 0.1);
}
.steam-chip:disabled {
  cursor: default;
  opacity: 0.75;
}
.steam-chip--plat {
  border-color: color-mix(in srgb, #ca8a04 50%, var(--panel-card-border));
  background: color-mix(in srgb, #ca8a04 16%, var(--panel-card, #ced5e0));
  color: #854d0e;
}
.steam-chip--low {
  border-color: var(--panel-card-border);
  background: var(--panel-soft, #c2cad6);
  color: var(--panel-muted, #334155);
}
.steam-chip--on {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--panel-accent) 40%, transparent);
  background: color-mix(in srgb, var(--panel-accent) 16%, var(--panel-card));
  border-color: var(--panel-accent);
  color: var(--panel-accent);
}
.steam-chip--scan {
  border-color: var(--panel-icon-border);
  background: var(--panel-icon-bg);
  color: var(--panel-accent);
}
:global(.panel-shell[data-theme="dark"] .steam-chip) {
  background: color-mix(in srgb, #f59e0b 18%, var(--panel-card));
  border-color: color-mix(in srgb, #f59e0b 45%, transparent);
  color: #fde68a;
}
:global(.panel-shell[data-theme="dark"] .steam-chip--plat) {
  background: color-mix(in srgb, #f5d76e 22%, var(--panel-card));
  border-color: color-mix(in srgb, #f5d76e 50%, transparent);
  color: #f5d76e;
}
:global(.panel-shell[data-theme="dark"] .steam-chip--low) {
  background: color-mix(in srgb, #94a3b8 14%, var(--panel-card));
  border-color: color-mix(in srgb, #94a3b8 35%, transparent);
  color: #cbd5e1;
}
:global(.panel-shell[data-theme="dark"] .steam-chip--on) {
  background: color-mix(in srgb, var(--panel-accent) 18%, var(--panel-card));
  border-color: var(--panel-accent);
  color: var(--panel-accent);
}
:global(.panel-shell[data-theme="dark"] .steam-msg--err) {
  background: rgba(180, 40, 60, 0.18);
  color: #ffb4c0;
  border-color: rgba(255, 120, 140, 0.28);
}
.steam-skel {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.steam-skel__banner {
  position: relative;
  overflow: hidden;
  min-height: 190px;
  border-radius: 22px;
  border: 1px solid rgba(105, 240, 174, 0.14);
  background: linear-gradient(135deg, #0a1813, #143028 55%, #07140f);
}
.steam-skel__shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 20%,
    rgba(105, 240, 174, 0.07) 48%,
    transparent 70%
  );
  background-size: 220% 100%;
  animation: steam-skel-shine 1.4s ease-in-out infinite;
}
.steam-skel__banner-row {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  min-height: 190px;
}
.steam-skel__av {
  width: 96px;
  height: 96px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}
.steam-skel__banner-meta {
  flex: 1 1 160px;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.steam-skel__banner-meta i {
  display: block;
  height: 0.75rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}
.steam-skel__banner-meta i:nth-child(1) {
  width: 4.5rem;
  height: 1.1rem;
}
.steam-skel__banner-meta i:nth-child(2) {
  width: 9rem;
  height: 1.35rem;
}
.steam-skel__banner-meta i:nth-child(3) {
  width: 11rem;
}
.steam-skel__stats {
  display: flex;
  gap: 0.55rem;
  margin-left: auto;
}
.steam-skel__stats span {
  width: 5.5rem;
  height: 3.6rem;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(105, 240, 174, 0.12);
}
.steam-skel__tabs,
.steam-skel__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
.steam-skel__tabs span {
  width: 6.5rem;
  height: 2.2rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--panel-muted, #64748b) 18%, transparent);
}
.steam-skel__search {
  flex: 1 1 200px;
  height: 2.65rem;
  border-radius: 12px;
  background: var(--panel-card, #0c1220);
  border: 1px solid var(--panel-card-border, transparent);
}
.steam-skel__sort {
  width: 11.5rem;
  height: 2.65rem;
  border-radius: 12px;
  background: var(--panel-card, #0c1220);
  border: 1px solid var(--panel-card-border, transparent);
}
.steam-skel__chip {
  width: 8.5rem;
  height: 2.2rem;
  border-radius: 999px;
  background: color-mix(in srgb, #f59e0b 22%, var(--panel-card, #0c1220));
}
@keyframes steam-skel-shine {
  0% {
    background-position: 120% 0;
  }
  100% {
    background-position: -80% 0;
  }
}
.steam-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  /* masaüstünde satırda 6 — 8 kolonda kartlar çok küçülüyordu */
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.95rem;
  align-items: stretch;
}
@media (max-width: 1100px) {
  .steam-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (max-width: 720px) {
  .steam-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }
}
.steam-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.steam-list > li {
  display: block;
  width: 100%;
}
.steam-grid > li {
  display: flex;
  min-height: 0;
}
.steam-card {
  /* Diğer panel sayfalarındaki Game_Card ile aynı dil: dikey koyu kapak */
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  overflow: hidden;
  background: #0a0e14;
  color: #e8eef7;
  text-align: left;
  text-decoration: none !important;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.28);
  transition:
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}
.steam-card:hover,
.steam-card:focus,
.steam-card:focus-visible,
.steam-card:active,
.steam-card:visited {
  text-decoration: none !important;
  color: inherit;
  outline: none;
}
.steam-card:hover {
  border-color: rgba(105, 240, 174, 0.45);
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.38);
}
.steam-card:hover .steam-card__img {
  transform: scale(1.04);
  filter: brightness(0.88) contrast(1.03) saturate(0.96);
}
.steam-card:hover .steam-card__cta {
  opacity: 1;
  transform: translateY(0);
}
.steam-card--plat {
  border-color: rgba(245, 215, 110, 0.55);
  box-shadow:
    0 6px 18px rgba(0, 0, 0, 0.28),
    0 0 0 1px rgba(245, 215, 110, 0.25);
}
.steam-card--plat:hover {
  border-color: rgba(245, 215, 110, 0.8);
}

.steam-recent-empty {
  width: 100%;
  margin: 0.15rem 0 0.5rem;
}
.steam-recent-empty :deep(.panel-empty) {
  margin: 0;
  width: 100%;
  max-width: none;
  box-sizing: border-box;
}

.steam-card--link {
  text-decoration: none !important;
  color: inherit;
}
.steam-card__media {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  aspect-ratio: 2 / 3;
  width: 100%;
  background: #0a0e14;
  line-height: 0;
  flex: 1 1 auto;
}
.steam-card__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 18%;
  display: block;
  border: 0;
  outline: none;
  transform: scale(1.001);
  transform-origin: center center;
  filter: brightness(0.78) contrast(1.04) saturate(0.94);
  transition: transform 0.35s ease, filter 0.35s ease;
}
/* Yatay kapak: blur zemin + ortada tam görünen poster */
.steam-card__media--wide {
  background: #05080c;
}
.steam-card__img--bleed {
  inset: -18%;
  width: auto;
  height: auto;
  min-width: 136%;
  min-height: 136%;
  object-fit: cover;
  object-position: center;
  filter: blur(16px) brightness(0.38) saturate(1.05);
  transform: none;
  z-index: 0;
}
.steam-card__img--fg {
  inset: auto;
  top: 50%;
  left: 50%;
  width: 92%;
  height: auto;
  max-height: 46%;
  object-fit: contain;
  object-position: center;
  transform: translate(-50%, -58%);
  border-radius: 8px;
  box-shadow:
    0 10px 28px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(255, 255, 255, 0.08);
  filter: brightness(0.92) contrast(1.04) saturate(1.02);
  z-index: 1;
}
.steam-card:hover .steam-card__img--fg {
  transform: translate(-50%, -58%) scale(1.03);
}
.steam-card__media--wide .steam-card__shade {
  z-index: 2;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.25) 0%,
    transparent 35%,
    rgba(0, 0, 0, 0.55) 70%,
    rgba(0, 0, 0, 0.92) 100%
  );
}
.steam-card--list .steam-card__img--fg {
  width: 88%;
  max-height: 58%;
  transform: translate(-50%, -50%);
}
.steam-card--list:hover .steam-card__img--fg {
  transform: translate(-50%, -50%) scale(1.03);
}
.steam-card__body,
.steam-card__name,
.steam-card__bar-wrap,
.steam-card__bar-wrap em {
  text-decoration: none !important;
}
.steam-card__shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.18) 0%,
    transparent 28%,
    transparent 42%,
    rgba(0, 0, 0, 0.55) 68%,
    rgba(0, 0, 0, 0.92) 100%
  );
}
.steam-card__hours {
  position: absolute;
  top: 0.55rem;
  left: 0.55rem;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.62);
  border: 1px solid rgba(105, 240, 174, 0.25);
  color: #c8ffe0;
  font-size: 0.72rem;
  font-weight: 700;
  backdrop-filter: blur(6px);
}
.steam-card__plat,
.steam-card__pct {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
  backdrop-filter: blur(6px);
}
.steam-card__plat {
  background: linear-gradient(135deg, #f5d76e, #c9a227);
  color: #1a1405;
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 4px 14px rgba(201, 162, 39, 0.45);
}
.steam-card__pct {
  background: rgba(0, 0, 0, 0.62);
  border: 1px solid rgba(105, 240, 174, 0.35);
  color: #9ff5c0;
}
.steam-card__cta {
  position: absolute;
  right: 0.55rem;
  bottom: 0.55rem;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  background: rgba(105, 240, 174, 0.18);
  border: 1px solid rgba(105, 240, 174, 0.4);
  color: #9ff5c0;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  opacity: 0.85;
  transform: translateY(2px);
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.steam-card__sale {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  z-index: 1;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  background: rgba(105, 240, 174, 0.2);
  border: 1px solid rgba(105, 240, 174, 0.45);
  color: #69f0ae;
  font-size: 0.78rem;
  font-weight: 800;
}
.steam-card__body {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.65rem 0.7rem 0.75rem;
  pointer-events: none;
}
.steam-card__name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #f3f7fb;
  line-height: 1.25;
  max-height: calc(1.25em * 2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.65);
}
.steam-card__chev {
  display: none;
}
/* Liste: geniş header + gövde — renkler panel token (aydınlık/koyu) */
.steam-card--list {
  display: grid;
  grid-template-columns: minmax(220px, 32%) minmax(0, 1fr);
  align-items: stretch;
  height: auto;
  min-height: 148px;
  background: var(--panel-card, #0c1220);
  border-color: var(--panel-card-border, rgb(255 255 255 / 0.1));
  box-shadow: var(--panel-card-shadow, 0 6px 18px rgba(0, 0, 0, 0.28));
  color: var(--panel-text, #e8eef7);
}
.steam-card--list:hover,
.steam-card--list:focus,
.steam-card--list:focus-visible,
.steam-card--list:active,
.steam-card--list:visited {
  color: var(--panel-text, #e8eef7);
}
.steam-card--list .steam-card__media {
  aspect-ratio: auto;
  width: 100%;
  height: 100%;
  min-height: 148px;
  flex: none;
}
.steam-card--list .steam-card__img {
  inset: 0 !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  max-height: none !important;
  object-fit: cover;
  object-position: center 20%;
  filter: brightness(0.9) contrast(1.04) saturate(1);
  transform: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  z-index: 0;
}
.steam-card--list .steam-card__img--bleed {
  display: none !important;
}
.steam-card--list .steam-card__media--wide {
  background: #0a0e14;
}
.steam-card--list:hover .steam-card__img:not(.steam-card__img--bleed) {
  transform: scale(1.03) !important;
  filter: brightness(0.96) contrast(1.05) saturate(1.05);
}
.steam-card--list .steam-card__shade {
  background: linear-gradient(
    90deg,
    transparent 55%,
    rgba(0, 0, 0, 0.18) 100%
  );
}
.steam-card--list .steam-card__body {
  position: relative;
  left: auto;
  right: auto;
  bottom: auto;
  z-index: 1;
  justify-content: center;
  gap: 0.65rem;
  padding: 1rem 2.75rem 1rem 1.25rem;
  pointer-events: none;
}
.steam-card--list .steam-card__name {
  font-size: 1.15rem;
  max-height: none;
  -webkit-line-clamp: 2;
  text-shadow: none;
  color: var(--panel-text, #eafff2);
}
.steam-card__facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
  gap: 0.45rem 0.65rem;
  width: 100%;
  max-width: 44rem;
}
.steam-card__fact {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
  padding: 0.45rem 0.6rem;
  border-radius: 10px;
  border: 1px solid var(--panel-border, rgb(255 255 255 / 0.08));
  background: var(--panel-soft, rgb(0 0 0 / 0.22));
}
.steam-card__fact-l {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--panel-muted, #94a3b8);
}
.steam-card__fact-v {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  min-width: 0;
  font-size: 0.88rem;
  font-weight: 750;
  color: var(--panel-text, #eafff2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.steam-card__fact-v--plat {
  color: #ca8a04;
}
.steam-card--list .steam-card__bar-wrap {
  max-width: 22rem;
  margin-top: 0.15rem;
}
.steam-card--list .steam-card__bar-wrap em {
  color: var(--panel-muted, #94a3b8);
}
.steam-card--list .steam-card__bar-track {
  background: color-mix(in srgb, var(--panel-muted, #94a3b8) 22%, transparent);
}
.steam-card--list .steam-card__chev {
  display: block;
  position: absolute;
  right: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--panel-muted, #94a3b8);
}
@media (max-width: 900px) {
  .steam-card--list {
    grid-template-columns: minmax(160px, 38%) minmax(0, 1fr);
  }
}
@media (max-width: 720px) {
  .steam-search--compact {
    flex: 1 1 100%;
    max-width: none;
  }
  .steam-view {
    margin-left: 0;
  }
  .steam-card--list {
    grid-template-columns: 1fr;
  }
  .steam-card--list .steam-card__media {
    width: 100%;
    min-height: 120px;
    aspect-ratio: 460 / 215;
  }
  .steam-card--list .steam-card__body {
    padding-right: 1.15rem;
  }
  .steam-card--list .steam-card__chev {
    display: none;
  }
}
.steam-card__bar-wrap {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.25rem;
  margin-top: auto;
  min-height: 1.85rem;
}
.steam-card__bar-wrap--muted .steam-card__bar {
  opacity: 0.22;
  background: rgba(148, 163, 184, 0.55);
}
.steam-card__bar-wrap--muted em {
  color: rgba(200, 255, 224, 0.38);
}
.steam-card__bar-wrap em {
  font-style: normal;
  font-size: 0.7rem;
  color: rgba(200, 255, 224, 0.55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.steam-card__bar-track {
  display: block;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}
.steam-card__bar {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #69f0ae, #f5d76e);
  max-width: 100%;
}
.steam-ach {
  background: #0b1612;
  border: 1px solid rgba(105, 240, 174, 0.22);
  border-radius: 18px;
  overflow: hidden;
  max-height: min(86vh, 780px);
  display: flex;
  flex-direction: column;
}
.steam-ach--plat {
  border-color: rgba(245, 215, 110, 0.45);
  box-shadow: 0 0 0 1px rgba(245, 215, 110, 0.2);
}
.steam-ach__hero {
  position: relative;
  min-height: 150px;
  background-size: cover;
  background-position: center;
  padding: 1rem 1.1rem 1.15rem;
}
.steam-ach__hero-veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(4, 12, 10, 0.35) 0%,
    rgba(4, 12, 10, 0.88) 100%
  );
}
.steam-ach__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.45);
  color: #eafff2;
  cursor: pointer;
}
.steam-ach__hero-meta {
  position: relative;
  z-index: 1;
  padding-right: 2.5rem;
}
.steam-ach__hero-meta h2 {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
  color: #f3fff8;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
}
.steam-ach__score {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.steam-ach__ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.steam-ach__ring span {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #0b1612;
  color: #eafff2;
  font-size: 0.82rem;
  font-weight: 800;
}
.steam-ach__score strong {
  display: block;
  color: #eafff2;
  font-size: 0.95rem;
}
.steam-ach__score p {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  color: rgba(200, 255, 224, 0.6);
}
.steam-ach__done {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: #f5d76e !important;
  font-weight: 700;
}
.steam-ach__tools {
  padding: 0.65rem 1.1rem 0;
}
.steam-ach__toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.82rem;
  color: rgba(200, 255, 224, 0.7);
  cursor: pointer;
  user-select: none;
}
.steam-ach__list {
  list-style: none;
  margin: 0;
  padding: 0.65rem 1.1rem 1.1rem;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.steam-ach__row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.55rem 0.65rem;
  border-radius: 12px;
  background: rgba(105, 240, 174, 0.08);
  border: 1px solid rgba(105, 240, 174, 0.12);
}
.steam-ach__row--off {
  opacity: 0.5;
  background: rgba(0, 0, 0, 0.28);
  border-color: transparent;
}
.steam-ach__row img {
  border-radius: 8px;
  flex-shrink: 0;
  background: #000;
}
.steam-ach__row-text {
  flex: 1;
  min-width: 0;
}
.steam-ach__row strong {
  display: block;
  color: #eafff2;
  font-size: 0.9rem;
}
.steam-ach__row p {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  color: rgba(200, 255, 224, 0.55);
  line-height: 1.35;
}
</style>
