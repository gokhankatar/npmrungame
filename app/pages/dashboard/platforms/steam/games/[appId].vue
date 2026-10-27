<script setup lang="ts">
import PanelBreadcrumb from "~/components/panel/PanelBreadcrumb.vue";
import { useAppLocale } from "~/composables/useAppLocale";
import {
  steamHeaderUrl,
  steamHours,
  useSteamHub,
  type SteamAchievementRow,
} from "~/composables/useSteamHub";
import { enrichSteamCoversFromStore, steamCoverSrc } from "~/utils/steamCover";

definePageMeta({
  layout: "panel",
  ssr: false,
  middleware: "auth",
});

const route = useRoute();
const { tx } = useAppLocale();
const {
  steamLinked,
  steamId,
  findGame,
  loadOwnedGames,
  setProgressFromDetail,
} = useSteamHub();

const appId = computed(() => {
  const raw = String(route.params.appId || "");
  return /^\d+$/.test(raw) ? Number(raw) : 0;
});

const loading = ref(true);
const errorMsg = ref("");
const achFilter = ref<"all" | "earned" | "locked">("all");
const sortMode = ref<"recent" | "rare">("recent");
const gameName = ref("");
const headerUrl = ref("");
const playtimeMin = ref(0);
const globalPct = ref<Record<string, number>>({});
const friendsPlaying = ref<
  Array<{
    steamId: string;
    personaname: string;
    avatarfull: string | null;
    gameExtraInfo: string | null;
    profileurl: string | null;
  }>
>([]);
const friendsPrivate = ref(false);
const friendsLoaded = ref(false);
const achData = ref<{
  gameName: string | null;
  unlocked: number;
  total: number;
  completionPct: number;
  isComplete: boolean;
  achievements: SteamAchievementRow[];
} | null>(null);

useSeoMeta({
  title: () =>
    `${gameName.value || tx("panel.steam.achievements")} | npmrungame`,
  robots: "noindex, nofollow",
});

const crumbs = computed(() => [
  { label: tx("panel.nav.platforms.steam"), to: "/dashboard/platforms/steam" },
  {
    label: tx("panel.steam.allAchievements"),
    to: "/dashboard/platforms/steam?tab=achievements",
  },
  { label: gameName.value || `#${appId.value}` },
]);

const sorted = computed(() => {
  const list = achData.value?.achievements || [];
  return [...list].sort((a, b) => {
    if (sortMode.value === "rare") {
      const pa = globalPct.value[a.apiName] ?? 999;
      const pb = globalPct.value[b.apiName] ?? 999;
      if (pa !== pb) return pa - pb;
    }
    if (a.achieved !== b.achieved) return a.achieved ? -1 : 1;
    return (b.unlockTime || 0) - (a.unlockTime || 0);
  });
});

function rarityLabel(apiName: string) {
  const p = globalPct.value[apiName];
  if (p == null) return "";
  if (p < 1) return `%${p.toFixed(1)}`;
  if (p < 10) return `%${p.toFixed(1)}`;
  return `%${Math.round(p)}`;
}

function isUltraRare(apiName: string) {
  const p = globalPct.value[apiName];
  return p != null && p > 0 && p < 5;
}

const unlockedCount = computed(
  () => achData.value?.unlocked ?? sorted.value.filter((a) => a.achieved).length
);
const lockedCount = computed(() => {
  const total = achData.value?.total ?? sorted.value.length;
  return Math.max(0, total - unlockedCount.value);
});

const visible = computed(() => {
  if (achFilter.value === "earned") {
    return sorted.value.filter((a) => a.achieved);
  }
  if (achFilter.value === "locked") {
    return sorted.value.filter((a) => !a.achieved);
  }
  return sorted.value;
});

async function load() {
  if (!steamLinked.value || !appId.value) {
    loading.value = false;
    errorMsg.value = tx("panel.steam.connectCta");
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    await loadOwnedGames();
    let g = findGame(appId.value);
    if (g) {
      await enrichSteamCoversFromStore([g]);
      g = findGame(appId.value) || g;
      gameName.value = g.name;
      headerUrl.value = steamCoverSrc(g) || g.headerUrl;
      playtimeMin.value = g.playtimeForeverMin;
    } else {
      const tmp = {
        appId: appId.value,
        name: "",
        playtimeForeverMin: 0,
        playtime2WeeksMin: 0,
        iconUrl: null as string | null,
        capsuleUrl: "",
        headerUrl: steamHeaderUrl(appId.value),
        coverUrls: [steamHeaderUrl(appId.value)],
      };
      await enrichSteamCoversFromStore([tmp]);
      headerUrl.value = steamCoverSrc(tmp) || steamHeaderUrl(appId.value);
    }

    const res = await $fetch<{
      success: boolean;
      message?: string;
      data: typeof achData.value;
    }>("/api/steam/player-achievements", {
      query: { steamId: steamId.value, appId: appId.value },
    });

    if (!res?.success || !res.data) {
      errorMsg.value = res?.message || tx("panel.steam.noAchievements");
      achData.value = null;
      return;
    }
    achData.value = res.data;
    if (res.data.gameName) gameName.value = res.data.gameName;
    setProgressFromDetail(appId.value, res.data);

    const [globalRes, friendsRes] = await Promise.all([
      $fetch<{
        success: boolean;
        data: { achievements: Array<{ name: string; percent: number }> } | null;
      }>("/api/steam/global-achievements", {
        query: { appId: appId.value },
      }).catch(() => null),
      $fetch<{
        success: boolean;
        data: { playing: typeof friendsPlaying.value };
      }>("/api/steam/friends", {
        query: { steamId: steamId.value, appId: appId.value },
      }).catch(() => null),
    ]);

    const map: Record<string, number> = {};
    for (const row of globalRes?.data?.achievements || []) {
      map[row.name] = row.percent;
    }
    globalPct.value = map;

    friendsPrivate.value = friendsRes != null && !friendsRes.success;
    friendsPlaying.value = friendsRes?.data?.playing || [];
    friendsLoaded.value = true;
  } catch (e: any) {
    errorMsg.value =
      e?.data?.message || e?.message || tx("panel.steam.noAchievements");
  } finally {
    loading.value = false;
  }
}

watch(
  [steamId, appId],
  () => {
    if (appId.value) load();
  },
  { immediate: true }
);
</script>

<template>
  <div class="sg">
    <PanelBreadcrumb :items="crumbs" />

    <section
      class="sg-hero"
      :class="{ 'sg-hero--plat': achData?.isComplete }"
      :style="
        headerUrl ? { backgroundImage: `url(${headerUrl})` } : undefined
      "
    >
      <div class="sg-hero__veil" />
      <div class="sg-hero__inner">
        <NuxtLink
          to="/dashboard/platforms/steam?tab=achievements"
          class="sg-back"
        >
          <v-icon icon="mdi-arrow-left" size="18" />
          {{ tx("panel.steam.allAchievements") }}
        </NuxtLink>
        <h1>{{ gameName || `App ${appId}` }}</h1>
        <p v-if="playtimeMin" class="sg-hero__hours">
          <v-icon icon="mdi-clock-outline" size="16" />
          {{ steamHours(playtimeMin) }} {{ tx("panel.steam.hours") }}
        </p>

        <div v-if="achData" class="sg-score">
          <div
            class="sg-ring"
            :style="{
              background: `conic-gradient(${
                achData.isComplete ? '#f5d76e' : '#69f0ae'
              } ${achData.completionPct * 3.6}deg, rgba(255,255,255,0.12) 0)`,
            }"
          >
            <span>%{{ achData.completionPct }}</span>
          </div>
          <div>
            <strong>
              {{ achData.unlocked }}/{{ achData.total }}
              {{ tx("panel.steam.achievements") }}
            </strong>
            <p v-if="achData.isComplete" class="sg-plat">
              <v-icon icon="mdi-trophy" size="16" />
              {{ tx("panel.steam.complete") }}
            </p>
            <p v-else>{{ tx("panel.steam.unlockedFirst") }}</p>
          </div>
        </div>
      </div>
    </section>

    <div v-if="loading" class="sg-loading">
      <v-progress-circular indeterminate color="#69f0ae" size="36" />
    </div>
    <p v-else-if="errorMsg" class="sg-err">{{ errorMsg }}</p>
    <template v-else-if="achData">
      <section v-if="friendsLoaded" class="sg-friends">
        <h2>{{ tx("panel.steam.friendsPlayingTitle") }}</h2>
        <p v-if="friendsPrivate" class="sg-friends__hint">
          {{ tx("panel.steam.friendsPrivate") }}
        </p>
        <ul v-else-if="friendsPlaying.length" class="sg-friends__list">
          <li v-for="f in friendsPlaying" :key="f.steamId">
            <img v-if="f.avatarfull" :src="f.avatarfull" alt="" />
            <div>
              <strong>{{ f.personaname }}</strong>
              <em>{{ tx("panel.steam.friendsPlayingNow") }}</em>
            </div>
          </li>
        </ul>
        <p v-else class="sg-friends__hint">
          {{ tx("panel.steam.friendsPlayingEmpty") }}
        </p>
      </section>

      <div class="sg-chips" role="tablist" :aria-label="tx('panel.steam.achievements')">
        <button
          type="button"
          role="tab"
          class="sg-chip"
          :class="{ 'sg-chip--on': achFilter === 'all' }"
          :aria-selected="achFilter === 'all'"
          @click="achFilter = 'all'"
        >
          {{ tx("panel.steam.achFilterAll") }}
          <span>{{ achData.total }}</span>
        </button>
        <button
          type="button"
          role="tab"
          class="sg-chip"
          :class="{ 'sg-chip--on': achFilter === 'earned' }"
          :aria-selected="achFilter === 'earned'"
          @click="achFilter = 'earned'"
        >
          {{ tx("panel.steam.achFilterEarned") }}
          <span>{{ unlockedCount }}</span>
        </button>
        <button
          type="button"
          role="tab"
          class="sg-chip"
          :class="{ 'sg-chip--on': achFilter === 'locked' }"
          :aria-selected="achFilter === 'locked'"
          @click="achFilter = 'locked'"
        >
          {{ tx("panel.steam.achFilterLocked") }}
          <span>{{ lockedCount }}</span>
        </button>
        <button
          type="button"
          class="sg-chip"
          :class="{ 'sg-chip--on': sortMode === 'rare' }"
          @click="sortMode = sortMode === 'rare' ? 'recent' : 'rare'"
        >
          <v-icon icon="mdi-diamond-stone" size="16" />
          {{ tx("panel.steam.rareSort") }}
        </button>
      </div>
      <ul class="sg-list">
        <li
          v-for="a in visible"
          :key="a.apiName"
          class="sg-row"
          :class="{
            'sg-row--off': !a.achieved,
            'sg-row--rare': isUltraRare(a.apiName),
          }"
        >
          <img
            :src="(a.achieved ? a.icon : a.iconGray) || a.icon || ''"
            alt=""
            width="56"
            height="56"
          />
          <div>
            <strong>{{ a.displayName }}</strong>
            <p>{{ a.description || (a.hidden && !a.achieved ? "…" : "") }}</p>
          </div>
          <span
            v-if="rarityLabel(a.apiName)"
            class="sg-rare"
            :title="tx('panel.steam.rareGlobal')"
          >
            {{ rarityLabel(a.apiName) }}
          </span>
          <v-icon
            v-if="a.achieved"
            icon="mdi-check-circle"
            size="22"
            color="#69f0ae"
          />
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
.sg {
  width: 100%;
  max-width: 1280px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.sg-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 20px;
  min-height: 220px;
  background: #0d1f18 center / cover no-repeat;
  border: 1px solid rgba(20, 40, 32, 0.12);
  box-shadow: 0 18px 40px rgba(8, 24, 18, 0.16);
}
.sg-hero--plat {
  border-color: rgba(245, 215, 110, 0.45);
}
.sg-hero__veil {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
    105deg,
    rgba(4, 14, 10, 0.92) 0%,
    rgba(4, 14, 10, 0.7) 45%,
    rgba(4, 14, 10, 0.4) 100%
  );
}
.sg-hero__inner {
  position: relative;
  z-index: 1;
  padding: 1.25rem 1.35rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.sg-back {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  width: fit-content;
  color: #9ff5c0;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
}
.sg-hero h1 {
  margin: 0;
  font-size: clamp(1.4rem, 3vw, 2rem);
  color: #f3fff8;
  line-height: 1.15;
}
.sg-hero__hours {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0;
  color: rgba(200, 255, 224, 0.7);
  font-size: 0.88rem;
}
.sg-score {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-top: 0.35rem;
}
.sg-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}
.sg-ring span {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #0b1612;
  color: #eafff2;
  font-weight: 800;
}
.sg-score strong {
  display: block;
  color: #eafff2;
}
.sg-score p {
  margin: 0.2rem 0 0;
  color: rgba(200, 255, 224, 0.6);
  font-size: 0.85rem;
}
.sg-plat {
  display: inline-flex !important;
  align-items: center;
  gap: 0.3rem;
  color: #f5d76e !important;
  font-weight: 700;
}
.sg-loading {
  display: flex;
  justify-content: center;
  padding: 2rem;
}
.sg-err {
  margin: 0;
  padding: 0.75rem 0.9rem;
  border-radius: 10px;
  background: rgba(180, 40, 60, 0.12);
  color: #a12a3c;
}
.sg-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.sg-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.85rem;
  border-radius: 999px;
  border: 1px solid var(--panel-card-border, rgb(15 23 42 / 0.12));
  background: var(--panel-card, #0f1c17);
  color: var(--panel-muted, #94a3b8);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}
.sg-chip span {
  display: inline-flex;
  min-width: 1.35rem;
  justify-content: center;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--panel-muted, #94a3b8) 18%, transparent);
  font-size: 0.72rem;
  font-weight: 800;
}
.sg-chip--on {
  border-color: var(--panel-accent, #69f0ae);
  background: color-mix(in srgb, var(--panel-accent, #69f0ae) 16%, var(--panel-card, #0f1c17));
  color: var(--panel-accent, #69f0ae);
}
.sg-chip--on span {
  background: color-mix(in srgb, var(--panel-accent, #69f0ae) 22%, transparent);
  color: inherit;
}
:global(.panel-shell[data-theme="light"]) .sg-chip {
  background: #c2cad6;
  color: #334155;
}
:global(.panel-shell[data-theme="light"]) .sg-chip--on {
  color: #047857;
  background: rgb(4 120 87 / 0.1);
  border-color: #047857;
}
.sg-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}
@media (min-width: 700px) {
  .sg-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1100px) {
  .sg-list {
    grid-template-columns: repeat(3, minmax(0, 1fr)); /* ~col-4 */
  }
}
.sg-friends {
  padding: 0.95rem 1.05rem;
  border-radius: 14px;
  border: 1px solid var(--panel-card-border, rgb(15 23 42 / 0.1));
  background: var(--panel-card, #0f1c17);
}
.sg-friends h2 {
  margin: 0 0 0.45rem;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--panel-text, #e8eef7);
}
.sg-friends__hint {
  margin: 0;
  color: var(--panel-muted, #94a3b8);
  font-size: 0.84rem;
}
.sg-friends__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}
.sg-friends__list li {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  background: var(--panel-soft, rgb(0 0 0 / 0.22));
  border: 1px solid var(--panel-border);
}
.sg-friends__list img {
  width: 28px;
  height: 28px;
  border-radius: 999px;
}
.sg-friends__list strong {
  display: block;
  font-size: 0.8rem;
}
.sg-friends__list em {
  font-style: normal;
  font-size: 0.68rem;
  color: var(--panel-muted);
}
.sg-rare {
  align-self: center;
  padding: 0.22rem 0.5rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  color: #ca8a04;
  background: rgb(245 215 110 / 0.16);
  border: 1px solid rgb(202 138 4 / 0.35);
  white-space: nowrap;
}
.sg-row {
  display: grid;
  grid-template-columns: 52px 1fr auto auto;
  gap: 0.7rem;
  align-items: start;
  min-height: 100%;
  padding: 0.85rem;
  border-radius: 14px;
  background: #0f1c17;
  border: 1px solid rgba(105, 240, 174, 0.12);
}
.sg-row--rare {
  border-color: rgba(245, 215, 110, 0.45);
}
.sg-row--off {
  opacity: 0.5;
  background: #0a1210;
  border-color: transparent;
}
.sg-row img {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  background: #000;
  object-fit: cover;
}
.sg-row strong {
  display: block;
  color: #eafff2;
  font-size: 0.9rem;
  line-height: 1.25;
}
.sg-row p {
  margin: 0.25rem 0 0;
  color: rgba(200, 255, 224, 0.55);
  font-size: 0.78rem;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.sg-row > div {
  min-width: 0;
}
:global(.panel-shell[data-theme="light"]) .sg-row {
  background: #ced5e0;
  border-color: rgb(15 23 42 / 0.14);
  box-shadow: none;
}
:global(.panel-shell[data-theme="light"]) .sg-row strong {
  color: #0f172a;
}
:global(.panel-shell[data-theme="light"]) .sg-row p {
  color: #475569;
}
:global(.panel-shell[data-theme="light"]) .sg-row--off {
  background: #c2cad6;
  opacity: 0.78;
}
</style>
