<script setup lang="ts">
import { getCountFromServer } from "firebase/firestore";
import store from "~/store/store";
import { flattenPanelNav, panelNavItems } from "~/utils/panelNav";
import { useAppLocale } from "~/composables/useAppLocale";
import { useUserProfile } from "~/composables/useUserProfile";
import {
  gamesCollection,
  type UserGameListKey,
} from "~/utils/channelOwnerGames";

definePageMeta({
  layout: "panel",
  ssr: false,
  middleware: "auth",
});

const { tx } = useAppLocale();
const _store = store();
const { displayName, user } = useUserProfile();
const { $firestore } = useNuxtApp();

const steamId = computed(() => String(user.value?.steamId || "").trim());
const steamLive = ref<{
  game: string | null;
  persona: string;
  avatar: string;
} | null>(null);

async function loadSteamLive() {
  if (!/^\d{17}$/.test(steamId.value)) {
    steamLive.value = null;
    return;
  }
  try {
    const res = await $fetch<{
      success: boolean;
      data: {
        personaname?: string;
        avatarfull?: string;
        gameextrainfo?: string;
      } | null;
    }>("/api/steam/player-summary", { query: { steamId: steamId.value } });
    steamLive.value = {
      game: res?.data?.gameextrainfo || null,
      persona: res?.data?.personaname || "",
      avatar: res?.data?.avatarfull || "",
    };
  } catch {
    steamLive.value = null;
  }
}

useSeoMeta({
  title: "Panel | npmrungame",
  robots: "noindex, nofollow",
});

const counts = ref<Record<string, number>>({
  playing: 0,
  completed: 0,
  radar: 0,
  toPlay: 0,
  target2026: 0,
});
const loadingCounts = ref(true);

const collectionByPath: Record<string, UserGameListKey> = {
  "/dashboard/playing": "current_games",
  "/dashboard/completed": "completed_games",
  "/dashboard/radar": "upcoming_games",
  "/dashboard/to-play": "to_play_games",
  "/dashboard/target-2026": "target_2026_games",
};

const countKeyByPath: Record<string, keyof typeof counts.value> = {
  "/dashboard/playing": "playing",
  "/dashboard/completed": "completed",
  "/dashboard/radar": "radar",
  "/dashboard/to-play": "toPlay",
  "/dashboard/target-2026": "target2026",
};

const cards = computed(() =>
  flattenPanelNav(panelNavItems)
    .filter((i) => i.to && i.to in collectionByPath)
    .map((item) => ({
      ...item,
      count: counts.value[countKeyByPath[item.to!]] ?? 0,
    }))
);

async function loadCounts() {
  const uid = _store.user?.uid;
  if (!uid || !$firestore) {
    loadingCounts.value = false;
    return;
  }
  loadingCounts.value = true;
  try {
    const entries = Object.entries(collectionByPath);
    const results = await Promise.all(
      entries.map(async ([path, colName]) => {
        try {
          const snap = await getCountFromServer(
            gamesCollection($firestore, uid, colName)
          );
          return [path, snap.data().count] as const;
        } catch {
          return [path, 0] as const;
        }
      })
    );
    const next = { ...counts.value };
    for (const [path, n] of results) {
      const key = countKeyByPath[path];
      if (key) next[key] = n;
    }
    counts.value = next;
  } finally {
    loadingCounts.value = false;
  }
}

onMounted(() => {
  loadCounts();
  loadSteamLive();
});
watch(steamId, () => loadSteamLive());
</script>

<template>
  <div class="dash-home">
    <header class="dash-home__head">
      <p class="dash-home__eyebrow">{{ tx("panel.home.eyebrow") }}</p>
      <h1 class="dash-home__title">
        {{ tx("panel.home.title") }}
        <span v-if="displayName"> · {{ displayName }}</span>
      </h1>
      <p class="dash-home__sub">{{ tx("panel.home.subtitle") }}</p>
    </header>

    <div class="dash-home__spotlight">
      <PanelSpotlight />
    </div>

    <NuxtLink
      v-if="steamLive"
      to="/dashboard/platforms/steam"
      class="dash-steam-live"
      :class="{ 'dash-steam-live--on': !!steamLive.game }"
    >
      <img
        v-if="steamLive.avatar"
        :src="steamLive.avatar"
        alt=""
        class="dash-steam-live__av"
      />
      <div class="dash-steam-live__body">
        <small>{{ tx("panel.steam.dashLiveTitle") }}</small>
        <strong v-if="steamLive.game">
          <span class="dash-steam-live__dot" />
          {{ steamLive.game }}
        </strong>
        <strong v-else>{{ tx("panel.steam.dashLiveIdle") }}</strong>
      </div>
      <span class="dash-steam-live__cta">
        {{ tx("panel.steam.dashLiveCta") }}
        <v-icon icon="mdi-chevron-right" size="18" />
      </span>
    </NuxtLink>

    <h2 class="dash-home__section">{{ tx("panel.home.highlights") }}</h2>
    <PanelHomeHighlights />

    <h2 class="dash-home__section">{{ tx("panel.home.collections") }}</h2>

    <v-row dense class="dash-home__grid">
      <v-col
        v-for="card in cards"
        :key="card.to"
        cols="12"
        sm="6"
        :md="card.to === '/dashboard/completed' || card.to === '/dashboard/playing' ? 6 : 4"
      >
        <NuxtLink :to="card.to!" class="dash-card">
          <div class="dash-card__icon">
            <v-icon :icon="card.icon" size="22" />
          </div>
          <div class="dash-card__body">
            <h3>{{ tx(card.titleKey) }}</h3>
            <p>
              <template v-if="loadingCounts">…</template>
              <template v-else
                >{{ card.count }} {{ tx("panel.home.games") }}</template
              >
            </p>
          </div>
          <v-icon
            icon="mdi-chevron-right"
            size="20"
            class="dash-card__chevron"
          />
        </NuxtLink>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.dash-home {
  max-width: 72rem;
  margin: 0 auto;
  padding: 0.35rem 0.35rem 2rem;
}

.dash-home__eyebrow {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #69f0ae;
}

.dash-home__title {
  margin: 0.4rem 0 0;
  font-size: clamp(1.35rem, 2.5vw, 1.85rem);
  font-weight: 750;
  letter-spacing: -0.02em;
}

.dash-home__sub {
  margin: 0.45rem 0 0;
  max-width: 38rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--panel-muted, #94a3b8);
}

.dash-home__spotlight {
  margin-top: 1.25rem;
}

.dash-steam-live {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--panel-card-border, rgb(15 23 42 / 0.1));
  background: var(--panel-card, #0c1220);
  text-decoration: none;
  color: inherit;
  box-shadow: var(--panel-card-shadow, none);
}
.dash-steam-live--on {
  border-color: color-mix(in srgb, var(--panel-accent, #69f0ae) 40%, transparent);
}
.dash-steam-live__av {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  object-fit: cover;
}
.dash-steam-live__body {
  flex: 1;
  min-width: 0;
}
.dash-steam-live__body small {
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--panel-muted, #94a3b8);
}
.dash-steam-live__body strong {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
  font-weight: 750;
}
.dash-steam-live__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 3px rgb(34 197 94 / 0.25);
}
.dash-steam-live__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--panel-accent, #69f0ae);
}

.dash-home__section {
  margin: 1.55rem 0 0.85rem;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.dash-home__grid {
  margin: 0;
}

.dash-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  height: 100%;
  min-height: 4.6rem;
  padding: 1rem 1.05rem;
  border-radius: 1rem;
  border: 1px solid var(--panel-card-border, rgb(255 255 255 / 0.08));
  background: var(--panel-card, rgb(12 18 32 / 0.85));
  color: inherit;
  text-decoration: none;
  box-shadow: var(--panel-card-shadow, none);
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    transform 0.15s ease;
}

.dash-card:hover {
  border-color: rgb(105 240 174 / 0.35);
  transform: translateY(-1px);
}

.dash-card__icon {
  display: inline-flex;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: var(--panel-icon-bg, rgb(105 240 174 / 0.12));
  color: var(--panel-accent, #69f0ae);
}

.dash-card__body {
  flex: 1;
  min-width: 0;
}

.dash-card__body h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 650;
}

.dash-card__body p {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  color: #94a3b8;
}

.dash-card__chevron {
  color: #64748b;
}
</style>
