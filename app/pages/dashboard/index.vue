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
const { displayName } = useUserProfile();
const { $firestore } = useNuxtApp();

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

onMounted(loadCounts);
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
