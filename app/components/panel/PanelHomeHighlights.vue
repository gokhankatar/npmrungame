<script setup lang="ts">
import { getDocs } from "firebase/firestore";
import store from "~/store/store";
import { resolveGameCardImage } from "~/composables/data/handleData";
import { useAppLocale } from "~/composables/useAppLocale";
import { gamesCollection } from "~/utils/channelOwnerGames";
import { getGameTimestampMs } from "~/utils/gameYear";

type GameRow = Record<string, any> & { firestoreId: string };

const { $firestore } = useNuxtApp();
const _store = store();
const { tx } = useAppLocale();

const loading = ref(true);
const yearCount = ref(0);
const yearCovers = ref<string[]>([]);
const lastCompleted = ref<GameRow | null>(null);
const nowPlaying = ref<GameRow | null>(null);
const playingTotal = ref(0);

const thisYear = new Date().getFullYear();

function sortMs(game: any) {
  return getGameTimestampMs(game) ?? 0;
}

function formatDoneDate(game: any) {
  const ms = getGameTimestampMs(game);
  if (ms == null) return "";
  return new Date(ms).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

async function loadList(key: "current_games" | "completed_games" | "target_2026_games") {
  const uid = _store.user?.uid;
  if (!uid || !$firestore) return [] as GameRow[];
  try {
    const snap = await getDocs(gamesCollection($firestore, uid, key));
    return snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })) as GameRow[];
  } catch {
    return [] as GameRow[];
  }
}

async function load() {
  const uid = _store.user?.uid;
  if (!uid || !$firestore) {
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    const [current, completed, yearList] = await Promise.all([
      loadList("current_games"),
      loadList("completed_games"),
      loadList("target_2026_games"),
    ]);

    playingTotal.value = current.length;
    const sortedPlaying = [...current].sort((a, b) => sortMs(b) - sortMs(a));
    nowPlaying.value = sortedPlaying[0] ?? null;

    const sortedCompleted = [...completed].sort((a, b) => sortMs(b) - sortMs(a));
    lastCompleted.value = sortedCompleted[0] ?? null;

    yearCount.value = yearList.length;
    yearCovers.value = [...yearList]
      .sort((a, b) => sortMs(b) - sortMs(a))
      .slice(0, 4)
      .map((g) => resolveGameCardImage(g));
  } finally {
    loading.value = false;
  }
}

watch(
  () => _store.user?.uid,
  (uid) => {
    if (uid) load();
  },
  { immediate: true }
);
</script>

<template>
  <section class="phh" aria-label="Özet vurgular">
    <v-row v-if="loading" dense class="phh__grid">
      <v-col v-for="i in 3" :key="i" cols="12" md="4">
        <div class="phh__skel" />
      </v-col>
    </v-row>

    <v-row v-else dense class="phh__grid">
      <!-- Bu yıl -->
      <v-col cols="12" md="4">
        <NuxtLink to="/dashboard/target-2026" class="phh-card phh-card--year">
          <div class="phh-card__top">
            <span class="phh-card__eyebrow">{{ thisYear }}</span>
            <v-icon icon="mdi-calendar-check" size="20" />
          </div>
          <strong class="phh-card__value">{{ yearCount }}</strong>
          <p class="phh-card__label">{{ tx("panel.home.hl.yearTitle") }}</p>
          <p class="phh-card__hint">{{ tx("panel.home.hl.yearHint") }}</p>
          <div v-if="yearCovers.length" class="phh-card__stack" aria-hidden="true">
            <img
              v-for="(src, i) in yearCovers"
              :key="`${src}-${i}`"
              :src="src"
              alt=""
              :style="{ zIndex: yearCovers.length - i }"
            />
          </div>
        </NuxtLink>
      </v-col>

      <!-- Son bitirilen -->
      <v-col cols="12" md="4">
        <NuxtLink
          v-if="lastCompleted"
          to="/dashboard/completed"
          class="phh-card phh-card--cover"
        >
          <img
            :src="resolveGameCardImage(lastCompleted)"
            alt=""
            class="phh-card__bg"
          />
          <div class="phh-card__shade" />
          <div class="phh-card__overlay">
            <span class="phh-card__eyebrow">{{ tx("panel.home.hl.lastTitle") }}</span>
            <h3 class="phh-card__game">{{ lastCompleted.name }}</h3>
            <p v-if="formatDoneDate(lastCompleted)" class="phh-card__meta">
              {{ formatDoneDate(lastCompleted) }}
            </p>
          </div>
        </NuxtLink>
        <NuxtLink
          v-else
          to="/dashboard/completed"
          class="phh-card phh-card--empty"
        >
          <v-icon icon="mdi-trophy-outline" size="28" />
          <p class="phh-card__label">{{ tx("panel.home.hl.lastEmpty") }}</p>
        </NuxtLink>
      </v-col>

      <!-- Şu an oynanan — en son eklenen, full cover -->
      <v-col cols="12" md="4">
        <NuxtLink
          v-if="nowPlaying"
          to="/dashboard/playing"
          class="phh-card phh-card--cover"
        >
          <img
            :src="resolveGameCardImage(nowPlaying)"
            alt=""
            class="phh-card__bg"
          />
          <div class="phh-card__shade" />
          <div class="phh-card__overlay">
            <span class="phh-card__eyebrow">{{ tx("panel.home.hl.playingTitle") }}</span>
            <h3 class="phh-card__game">{{ nowPlaying.name }}</h3>
            <p v-if="playingTotal > 1" class="phh-card__meta">
              +{{ playingTotal - 1 }} {{ tx("panel.home.hl.more") }}
            </p>
          </div>
        </NuxtLink>
        <NuxtLink
          v-else
          to="/dashboard/playing"
          class="phh-card phh-card--empty"
        >
          <v-icon icon="mdi-play-circle-outline" size="28" />
          <p class="phh-card__label">{{ tx("panel.home.hl.playingEmpty") }}</p>
        </NuxtLink>
      </v-col>
    </v-row>
  </section>
</template>

<style scoped>
.phh__grid {
  margin: 0;
}

.phh__skel {
  height: 11.5rem;
  border-radius: 1.15rem;
  border: 1px solid var(--panel-border, rgb(255 255 255 / 0.08));
  background: linear-gradient(
    110deg,
    var(--panel-card, #0c1220) 25%,
    rgb(255 255 255 / 0.05) 45%,
    var(--panel-card, #0c1220) 65%
  );
  background-size: 200% 100%;
  animation: phhShine 1.35s ease-in-out infinite;
}

@keyframes phhShine {
  to {
    background-position: -80% 0;
  }
}

.phh-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 11.5rem;
  overflow: hidden;
  padding: 1.1rem 1.15rem;
  border-radius: 1.15rem;
  border: 1px solid var(--panel-card-border, rgb(255 255 255 / 0.1));
  background: var(--panel-card, #0c1220);
  color: inherit;
  text-decoration: none;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.phh-card:hover {
  border-color: rgb(105 240 174 / 0.38);
  transform: translateY(-2px);
  box-shadow: 0 14px 36px rgb(0 0 0 / 0.28);
}

.phh-card--year {
  background: linear-gradient(
    155deg,
    rgb(105 240 174 / 0.16) 0%,
    var(--panel-card, #0c1220) 55%
  );
}

.phh-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  color: var(--panel-accent, #69f0ae);
}

.phh-card__eyebrow {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--panel-accent, #69f0ae);
}

.phh-card__value {
  margin-top: 0.55rem;
  font-size: clamp(2.2rem, 5vw, 2.85rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--panel-text, #e8eef7);
}

.phh-card__label {
  margin: 0.45rem 0 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--panel-text, #e8eef7);
}

.phh-card__hint {
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  color: var(--panel-muted, #94a3b8);
}

.phh-card__stack {
  display: flex;
  margin-top: auto;
  padding-top: 0.85rem;
}

.phh-card__stack img {
  width: 2.55rem;
  height: 3.4rem;
  object-fit: cover;
  border-radius: 0.45rem;
  border: 2px solid var(--panel-card, #0c1220);
  margin-left: -0.65rem;
  box-shadow: 0 6px 14px rgb(0 0 0 / 0.35);
}

.phh-card__stack img:first-child {
  margin-left: 0;
}

.phh-card--cover {
  padding: 0;
  justify-content: flex-end;
}

.phh-card__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.phh-card__shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgb(4 8 16 / 0.96) 0%,
    rgb(4 8 16 / 0.45) 55%,
    rgb(4 8 16 / 0.2) 100%
  );
}

.phh-card__overlay {
  position: relative;
  z-index: 1;
  padding: 1.1rem 1.15rem;
}

.phh-card__game {
  margin: 0.4rem 0 0;
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1.25;
  color: #fff;
}

.phh-card__meta {
  margin: 0.35rem 0 0;
  font-size: 0.78rem;
  font-weight: 600;
  color: rgb(255 255 255 / 0.72);
}

.phh-card--empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.5rem;
  color: var(--panel-muted, #94a3b8);
}
</style>
