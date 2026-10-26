<script setup lang="ts">
import {
  formatSpotlightDate,
  getDaysUntilRelease,
  useDashboardSpotlight,
  type SpotlightGame,
} from "~/composables/useDashboardSpotlight";
import { useAppLocale } from "~/composables/useAppLocale";
import store from "~/store/store";

const { tx, locale } = useAppLocale();
const { fetchSpotlight } = useDashboardSpotlight();
const _store = store();

function openGameDetail() {
  if (!game.value?.rawgId) return;
  _store.setActiveDetailedGame(game.value.rawgId, game.value.name);
  navigateTo(`/game-detail/${game.value.rawgId}`);
}

const loading = ref(true);
const game = ref<SpotlightGame | null>(null);

const daysLeft = computed(() =>
  game.value ? getDaysUntilRelease(game.value.releaseDate) : null
);

const countdownLabel = computed(() => {
  const d = daysLeft.value;
  if (d === null) return "";
  if (d < 0) return tx("panel.spotlight.releasedAgo").replace("{n}", String(Math.abs(d)));
  if (d === 0) return tx("panel.spotlight.today");
  return tx("panel.spotlight.daysLeft").replace("{n}", String(d));
});

const dateLabel = computed(() => {
  if (!game.value) return "";
  return formatSpotlightDate(
    game.value.releaseDate,
    locale.value === "en" ? "en-US" : "tr-TR"
  );
});

let alive = true;

onMounted(async () => {
  loading.value = true;
  try {
    const next = await fetchSpotlight();
    if (alive) game.value = next;
  } finally {
    if (alive) loading.value = false;
  }
});

onBeforeUnmount(() => {
  alive = false;
});
</script>

<template>
  <section class="spotlight" aria-label="Öne çıkan oyun">
    <!-- Skeleton -->
    <div v-if="loading" class="spotlight__skel">
      <div class="spotlight__skel-shine" />
      <div class="spotlight__skel-lines">
        <span class="spotlight__skel-pill" />
        <span class="spotlight__skel-title" />
        <span class="spotlight__skel-sub" />
        <span class="spotlight__skel-count" />
      </div>
    </div>

    <!-- Featured -->
    <div v-else-if="game" class="spotlight__card">
      <div class="spotlight__media" aria-hidden="true">
        <img
          v-if="game.background_image"
          :src="game.background_image"
          :alt="game.name"
          class="spotlight__bg"
        />
        <div v-else class="spotlight__bg spotlight__bg--empty" />
        <div class="spotlight__shade" />
        <div class="spotlight__vignette" />
      </div>

      <div class="spotlight__content">
        <span class="spotlight__badge">
          <v-icon icon="mdi-star-shooting" size="14" />
          {{ tx("panel.spotlight.badge") }}
        </span>

        <h2 class="spotlight__title">{{ game.name }}</h2>
        <p class="spotlight__date">{{ dateLabel }}</p>

        <div class="spotlight__countdown">
          <span class="spotlight__countdown-value">
            {{ daysLeft === 0 ? "0" : Math.abs(daysLeft ?? 0) }}
          </span>
          <span class="spotlight__countdown-unit">{{ countdownLabel }}</span>
        </div>

        <div class="spotlight__actions">
          <NuxtLink to="/dashboard/radar" class="spotlight__btn spotlight__btn--primary">
            <v-icon icon="mdi-radar" size="18" />
            {{ tx("panel.spotlight.openRadar") }}
          </NuxtLink>
          <button
            v-if="game.rawgId"
            type="button"
            class="spotlight__btn spotlight__btn--ghost"
            @click="openGameDetail"
          >
            <v-icon icon="mdi-information-outline" size="18" />
            {{ tx("panel.spotlight.detail") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="spotlight__empty">
      <v-icon icon="mdi-calendar-blank-outline" size="36" color="rgba(105,240,174,0.45)" />
      <p class="spotlight__empty-title">{{ tx("panel.spotlight.emptyTitle") }}</p>
      <p class="spotlight__empty-desc">{{ tx("panel.spotlight.emptyBody") }}</p>
    </div>
  </section>
</template>

<style scoped>
.spotlight {
  width: 100%;
}

.spotlight__skel,
.spotlight__card,
.spotlight__empty {
  position: relative;
  overflow: hidden;
  min-height: clamp(220px, 38vw, 340px);
  border-radius: 1.35rem;
  border: 1px solid rgb(255 255 255 / 0.1);
}

.spotlight__skel {
  background: linear-gradient(135deg, #0c1220, #121a2b 55%, #0a1a14);
}

.spotlight__skel-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 30%,
    rgb(255 255 255 / 0.06) 45%,
    transparent 60%
  );
  animation: spotlight-shine 1.6s ease-in-out infinite;
}

.spotlight__skel-lines {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.75rem 1.5rem;
  max-width: 28rem;
}

.spotlight__skel-pill,
.spotlight__skel-title,
.spotlight__skel-sub,
.spotlight__skel-count {
  display: block;
  border-radius: 9999px;
  background: rgb(255 255 255 / 0.08);
}

.spotlight__skel-pill {
  width: 7rem;
  height: 1.4rem;
}

.spotlight__skel-title {
  width: 85%;
  height: 2rem;
  border-radius: 0.65rem;
}

.spotlight__skel-sub {
  width: 55%;
  height: 1rem;
}

.spotlight__skel-count {
  width: 10rem;
  height: 2.75rem;
  margin-top: 0.5rem;
  border-radius: 0.85rem;
}

.spotlight__card {
  background: #070b14;
}

.spotlight__media {
  position: absolute;
  inset: 0;
}

.spotlight__bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.04);
}

.spotlight__bg--empty {
  background: radial-gradient(circle at 30% 40%, #1a3d30, #070b14 70%);
}

.spotlight__shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgb(7 11 20 / 0.92) 0%,
    rgb(7 11 20 / 0.72) 42%,
    rgb(7 11 20 / 0.35) 70%,
    rgb(7 11 20 / 0.55) 100%
  );
}

.spotlight__vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 70% 50%,
    transparent 20%,
    rgb(0 0 0 / 0.35) 100%
  );
}

.spotlight__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: inherit;
  padding: 1.5rem 1.25rem 1.4rem;
  max-width: 40rem;
}

@media (min-width: 768px) {
  .spotlight__content {
    padding: 2rem 2rem 1.75rem;
  }
}

.spotlight__badge {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  border-radius: 9999px;
  border: 1px solid rgb(105 240 174 / 0.35);
  background: rgb(105 240 174 / 0.12);
  color: #69f0ae;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.spotlight__title {
  margin: 0.85rem 0 0;
  font-size: clamp(1.55rem, 4vw, 2.35rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: #fff;
  text-shadow: 0 2px 18px rgb(0 0 0 / 0.45);
}

.spotlight__date {
  margin: 0.55rem 0 0;
  font-size: 0.9rem;
  color: rgb(226 232 240 / 0.85);
}

.spotlight__countdown {
  display: inline-flex;
  align-items: baseline;
  gap: 0.55rem;
  margin-top: 1rem;
  padding: 0.55rem 0.9rem;
  border-radius: 0.9rem;
  background: rgb(0 0 0 / 0.35);
  border: 1px solid rgb(255 255 255 / 0.12);
  backdrop-filter: blur(8px);
  width: fit-content;
}

.spotlight__countdown-value {
  font-size: clamp(1.6rem, 3.5vw, 2.2rem);
  font-weight: 800;
  color: #69f0ae;
  line-height: 1;
}

.spotlight__countdown-unit {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgb(226 232 240 / 0.9);
}

.spotlight__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 1.15rem;
}

.spotlight__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.spotlight__btn:hover {
  transform: translateY(-1px);
}

.spotlight__btn--primary {
  background: #69f0ae;
  color: #07140f;
}

.spotlight__btn--ghost {
  border: 1px solid rgb(255 255 255 / 0.28);
  background: rgb(0 0 0 / 0.25);
  color: #fff;
}

.spotlight__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 2.5rem 1.5rem;
  text-align: center;
  background: rgb(12 18 32 / 0.9);
}

.spotlight__empty-title {
  margin: 0.5rem 0 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.spotlight__empty-desc {
  margin: 0;
  max-width: 26rem;
  font-size: 0.85rem;
  color: #94a3b8;
}

@keyframes spotlight-shine {
  0% {
    transform: translateX(-40%);
  }
  100% {
    transform: translateX(40%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spotlight__skel-shine {
    animation: none;
  }
}
</style>
