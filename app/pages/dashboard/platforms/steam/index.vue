<script setup lang="ts">
import PanelPageTitle from "~/components/panel/PanelPageTitle.vue";
import SteamAchievementsPanel from "~/components/panel/SteamAchievementsPanel.vue";
import SteamGameSkeleton from "~/components/panel/SteamGameSkeleton.vue";
import SteamInsightsPanel from "~/components/panel/SteamInsightsPanel.vue";
import { useAppLocale } from "~/composables/useAppLocale";
import { useUserProfile } from "~/composables/useUserProfile";
import { useSteamHub } from "~/composables/useSteamHub";
import {
  advanceSteamCover,
  enrichSteamCoversFromStore,
  steamCoverSrc,
} from "~/utils/steamCover";

definePageMeta({
  layout: "panel",
  ssr: false,
  middleware: "auth",
});

const { tx } = useAppLocale();
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

function onDocClick(e: MouseEvent) {
  if (!sortMenuOpen.value || !sortRoot.value) return;
  if (!sortRoot.value.contains(e.target as Node)) sortMenuOpen.value = false;
}

onMounted(() => document.addEventListener("click", onDocClick));
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

function onCoverError(e: Event, g: SteamGame) {
  advanceSteamCover(e, g);
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
  <div class="steam-hub">
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
      <p class="steam-note">{{ tx("panel.steam.notePlatinum") }}</p>

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

      <div v-if="loading && tab !== 'insights'" class="steam-skel">
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

      <SteamAchievementsPanel
        v-else-if="tab === 'achievements'"
        :games="playedLibrary"
        :platinum-count="platinumCount"
        :progress-scanning="progressScanning"
        :loading="loading"
        :get-progress="getProgress"
      />

      <template v-else-if="tab === 'library'">
        <div class="steam-toolbar">
          <input
            v-model="search"
            type="search"
            class="steam-search"
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
              <span class="steam-sort__meta">
                <small>{{ tx("panel.steam.sortLabel") }}</small>
                <strong>{{ sortLabel }}</strong>
              </span>
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
        <ul class="steam-grid">
          <li v-for="g in filteredLibrary" :key="g.appId">
            <NuxtLink
              :to="`/dashboard/platforms/steam/games/${g.appId}`"
              class="steam-card"
              :class="{
                'steam-card--plat': getProgress(g.appId)?.isComplete,
              }"
              :aria-label="g.name"
            >
              <div class="steam-card__media">
                <img
                  :src="steamCoverSrc(g)"
                  :alt="g.name"
                  class="steam-card__img"
                  loading="lazy"
                  @error="onCoverError($event, g)"
                />
                <div class="steam-card__shade" aria-hidden="true" />
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
              </div>
              <div class="steam-card__body">
                <strong class="steam-card__name" :title="g.name">{{ g.name }}</strong>
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
              </div>
            </NuxtLink>
          </li>
        </ul>
      </template>

      <ul v-else-if="tab === 'recent'" class="steam-grid">
        <li v-for="g in recentVisible" :key="g.appId">
          <NuxtLink
            :to="`/dashboard/platforms/steam/games/${g.appId}`"
            class="steam-card"
            :aria-label="g.name"
          >
            <div class="steam-card__media">
              <img
                :src="steamCoverSrc(g)"
                :alt="g.name"
                class="steam-card__img"
                loading="lazy"
                @error="onCoverError($event, g)"
              />
              <div class="steam-card__shade" aria-hidden="true" />
              <span class="steam-card__hours">
                <v-icon icon="mdi-clock-outline" size="14" />
                {{ hours(g.playtime2WeeksMin) }} {{ tx("panel.steam.hours") }}
                · 2w
              </span>
            </div>
            <div class="steam-card__body">
              <strong class="steam-card__name">{{ g.name }}</strong>
            </div>
          </NuxtLink>
        </li>
      </ul>

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
  min-height: 240px;
  border: 1px solid rgba(105, 240, 174, 0.18);
  background: linear-gradient(135deg, #0a1813 0%, #143028 55%, #07140f 100%);
  box-shadow:
    0 22px 48px rgba(4, 16, 12, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.steam-banner__bg {
  position: absolute;
  inset: -6%;
  background-size: cover;
  background-position: center 28%;
  filter: saturate(1.15) brightness(0.62) contrast(1.05);
  transform: scale(1.04);
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
  padding: 1.85rem 1.75rem 1.65rem;
  min-height: 240px;
}
.steam-banner__profile {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  min-width: 0;
}
.steam-banner__av {
  width: 112px;
  height: 112px;
  border-radius: 26px;
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
.steam-note {
  margin: 0;
  font-size: 0.82rem;
  color: var(--panel-muted, #64748b);
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
  background: transparent;
  border-color: var(--panel-accent, #059669);
  color: var(--panel-accent, #059669);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--panel-accent, #059669) 35%, transparent);
}
.steam-tab__count {
  font-size: 0.75rem;
  opacity: 0.75;
}
.steam-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
}
.steam-search {
  flex: 1 1 200px;
  min-width: 0;
  padding: 0.7rem 0.95rem;
  border-radius: 12px;
  border: 1px solid var(--panel-card-border, rgb(15 23 42 / 0.12));
  background: var(--panel-soft, #dde3ec);
  color: var(--panel-text, #0f172a);
  font-size: 0.9rem;
  box-shadow: none;
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
  gap: 0.55rem;
  min-width: 11.5rem;
  padding: 0.5rem 0.8rem;
  border-radius: 12px;
  border: 1px solid var(--panel-card-border, rgb(15 23 42 / 0.12));
  background: var(--panel-soft, #dde3ec);
  color: var(--panel-text, #0f172a);
  cursor: pointer;
  box-shadow: none;
}
.steam-sort__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.05rem;
  flex: 1;
  text-align: left;
}
.steam-sort__meta small {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--panel-muted, #64748b);
}
.steam-sort__meta strong {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--panel-text, #0f172a);
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
  background: var(--panel-card, #e8edf4);
  box-shadow: 0 12px 28px rgb(15 23 42 / 0.12);
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
  background: var(--panel-soft, #c2cad6);
}
.steam-sort__opt--on {
  background: var(--panel-icon-bg, rgb(16 185 129 / 0.12));
  color: var(--panel-accent, #059669);
}
.steam-sort__check {
  margin-left: auto;
  color: var(--panel-accent, #059669);
}
.steam-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, #d97706 55%, var(--panel-card-border));
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
  border-color: color-mix(in srgb, #ca8a04 55%, var(--panel-card-border));
  background: color-mix(in srgb, #ca8a04 16%, var(--panel-card, #ced5e0));
  color: #854d0e;
}
.steam-chip--low {
  border-color: var(--panel-card-border, rgb(15 23 42 / 0.16));
  background: var(--panel-soft, #c2cad6);
  color: #334155;
}
.steam-chip--on {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--panel-accent, #059669) 45%, transparent);
  background: color-mix(in srgb, var(--panel-accent, #059669) 16%, var(--panel-card, #ced5e0));
  border-color: var(--panel-accent, #059669);
  color: var(--panel-accent, #059669);
}
.steam-chip--scan {
  border-color: var(--panel-icon-border, rgb(16 185 129 / 0.28));
  background: var(--panel-icon-bg, rgb(16 185 129 / 0.1));
  color: var(--panel-accent, #059669);
}

/* Dark theme: chip / toolbar tonları panel kartına uyumlu */
:global(.panel-shell[data-theme="dark"]) .steam-chip {
  background: color-mix(in srgb, #f59e0b 18%, var(--panel-card));
  border-color: color-mix(in srgb, #f59e0b 45%, transparent);
  color: #fde68a;
}
:global(.panel-shell[data-theme="dark"]) .steam-chip--plat {
  background: color-mix(in srgb, #f5d76e 22%, var(--panel-card));
  border-color: color-mix(in srgb, #f5d76e 50%, transparent);
  color: #f5d76e;
}
:global(.panel-shell[data-theme="dark"]) .steam-chip--low {
  background: color-mix(in srgb, #94a3b8 14%, var(--panel-card));
  border-color: color-mix(in srgb, #94a3b8 35%, transparent);
  color: #cbd5e1;
}
:global(.panel-shell[data-theme="dark"]) .steam-chip--on {
  background: color-mix(in srgb, var(--panel-accent) 18%, var(--panel-card));
  border-color: var(--panel-accent);
  color: var(--panel-accent);
}
:global(.panel-shell[data-theme="dark"]) .steam-msg--err {
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.05rem;
  align-items: stretch;
}
.steam-grid > li {
  display: flex;
  min-height: 0;
}
.steam-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 1px solid rgba(105, 240, 174, 0.12);
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(10, 24, 18, 0.95), rgba(4, 12, 10, 0.98));
  color: inherit;
  text-align: left;
  text-decoration: none !important;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
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
  transform: scale(1.05);
  filter: brightness(1.06);
}
.steam-card:hover .steam-card__cta {
  opacity: 1;
  transform: translateY(0);
}
.steam-card--plat {
  border-color: rgba(245, 215, 110, 0.55);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.28),
    0 0 0 1px rgba(245, 215, 110, 0.25);
}
.steam-card--plat:hover {
  border-color: rgba(245, 215, 110, 0.8);
}
.steam-card--link {
  text-decoration: none !important;
  color: inherit;
}
.steam-card__media {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  aspect-ratio: 460 / 215;
  background: #07140f;
  /* scale boşluğu / alt çizgi artefaktını kes */
  line-height: 0;
  flex-shrink: 0;
}
.steam-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  vertical-align: top;
  border: 0;
  outline: none;
  /* alt kenarda 1px boşluk kalmasın */
  transform: scale(1.001);
  transform-origin: center center;
  transition: transform 0.35s ease, filter 0.35s ease;
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
  background: linear-gradient(
    180deg,
    transparent 35%,
    rgba(2, 10, 8, 0.55) 72%,
    rgba(2, 10, 8, 0.88) 100%
  );
  pointer-events: none;
}
.steam-card__hours {
  position: absolute;
  top: 0.55rem;
  left: 0.55rem;
  z-index: 1;
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
  z-index: 1;
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
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0.7rem 0.85rem 0.85rem;
  flex: 1 1 auto;
  min-height: 5.1rem; /* 2 satır isim + bar alanı — yükseklik sabit */
}
.steam-card__name {
  font-size: 0.92rem;
  font-weight: 700;
  color: #eafff2;
  line-height: 1.3;
  height: calc(1.3em * 2); /* tam 2 satır — uzun/kısa isim fark etmez */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
