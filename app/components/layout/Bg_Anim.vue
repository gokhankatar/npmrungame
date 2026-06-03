<template>
  <section class="home-hero" aria-label="Ana sayfa hero">
    <div
      class="bg-anim"
      :class="{ 'bg-anim--featured': showFeaturedRadar }"
    >
      <!-- Netflix tarzı: yaklaşan çıkış -->
      <template v-if="showFeaturedRadar">
        <v-img
          v-if="nextUpcomingGame?.background_image"
          :src="nextUpcomingGame.background_image"
          :alt="nextUpcomingGame.name"
          cover
          class="bg-anim-featured-bg"
        />
        <div v-else class="bg-anim-featured-bg bg-anim-featured-bg--empty">
          <v-icon icon="mdi-gamepad-variant-outline" size="72" color="rgba(255,255,255,0.2)" />
        </div>

        <div class="bg-anim-featured-shade" aria-hidden="true" />
        <div class="bg-anim-featured-vignette" aria-hidden="true" />

        <div class="home-hero-featured-wrap">
          <p class="hero-brand default-title-letter">npmrungame</p>

          <div class="home-hero-featured-body">
            <div class="home-hero-featured-labels">
              <span class="home-hero-featured-label home-hero-featured-label--hot">
                Yaklaşan çıkış
              </span>
              <span class="home-hero-featured-label home-hero-featured-label--radar">
                <v-icon icon="mdi-radar" size="14" />
                Radarda sıradaki
              </span>
            </div>

            <h1 class="home-hero-featured-title default-title-letter">
              {{ nextUpcomingGame?.name }}
            </h1>
            <p class="home-hero-featured-date default-title-letter">
              {{ upcomingReleaseLabel }}
            </p>

            <div class="home-hero-featured-countdown">
              <span class="home-hero-featured-countdown-value">{{ upcomingCountdown.value }}</span>
              <span class="home-hero-featured-countdown-unit">{{ upcomingCountdown.unit }}</span>
            </div>

            <div class="home-hero-featured-actions">
              <v-btn
                color="warning"
                variant="flat"
                rounded="pill"
                size="large"
                class="home-hero-featured-btn home-hero-featured-btn--primary text-black font-weight-bold text-capitalize default-title-letter"
                prepend-icon="mdi-radar"
                text="Radarı aç"
                :ripple="false"
                @click="handleRoute('/radarimdaki-oyunlar')"
              />
              <v-btn
                v-if="nextUpcomingGame?.rawgId"
                variant="outlined"
                color="grey-lighten-1"
                rounded="pill"
                size="large"
                class="home-hero-featured-btn home-hero-featured-btn--secondary text-capitalize default-title-letter"
                prepend-icon="mdi-information-outline"
                text="Oyun detayı"
                :ripple="false"
                @click="openRadarGameDetail"
              />
            </div>
          </div>
        </div>

        <a
          v-if="showHeroDesktopExtras"
          class="hero-youtube-corner hero-cta hero-cta--youtube default-title-letter"
          href="https://www.youtube.com/@npmrungame"
          target="_blank"
          rel="noopener noreferrer"
        >
          <v-icon icon="mdi-youtube" size="20" />
          <span>Abone Ol</span>
        </a>
      </template>

      <!-- Yükleniyor -->
      <div v-else-if="isLoadingUpcoming" class="home-hero-loading">
        <v-skeleton-loader type="image" class="home-hero-loading-skeleton" />
      </div>

      <!-- Klasik hero (radarda oyun yokken) -->
      <template v-else>
        <div class="home-hero-content">
          <p ref="titleRef" class="title default-title-letter">npmrungame</p>
          <p class="subtitle text-grey-lighten-1">
            4K oyun dünyasının nabzını tutan bir kanal.<br />
            Niş indielerden AAA yapımlara, donanımdan güncel haberlere kadar geniş içerik sunar.
          </p>

          <div class="hero-cta-group">
            <button
              type="button"
              class="hero-cta hero-cta--discover default-title-letter"
              :disabled="loadingItem === '/discover'"
              @click="handleRoute('/discover')"
            >
              <v-progress-circular
                v-if="loadingItem === '/discover'"
                indeterminate
                :size="16"
                width="2"
                color="#0d1f17"
              />
              <v-icon v-else icon="mdi-compass-outline" size="18" />
              <span>Keşfet</span>
            </button>

            <a
              class="hero-cta hero-cta--youtube default-title-letter"
              href="https://www.youtube.com/@npmrungame"
              target="_blank"
              rel="noopener noreferrer"
            >
              <v-icon icon="mdi-youtube" size="20" />
              <span>Abone Ol</span>
            </a>

            <button
              type="button"
              class="hero-cta hero-cta--suggest default-title-letter"
              :disabled="loadingItem === '/recommend-games'"
              @click="handleRoute('/recommend-games')"
            >
              <v-icon icon="mdi-gamepad-variant-outline" size="18" />
              <span>Oyun Öner</span>
            </button>
          </div>
        </div>
      </template>

      <button
        v-if="showHeroDesktopExtras"
        type="button"
        class="scroll-hint"
        aria-label="İçeriğe kaydır"
        @click="scrollToContent"
      >
        <span class="scroll-hint-text">Keşfetmeye başla</span>
        <v-icon icon="mdi-chevron-double-down" class="scroll-hint-icon" size="small" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { animate, stagger, splitText } from "animejs";
import { slugify } from "~/composables/core/basicFunc";
import {
  formatReleaseDate,
  getCountdownHeadline,
  type UpcomingGame,
} from "~/utils/upcomingGames";
import store from "~/store/store";

const _store = store();

const props = withDefaults(
  defineProps<{
    nextUpcomingGame?: UpcomingGame | null;
    isLoadingUpcoming?: boolean;
    loadingStats?: boolean;
  }>(),
  {
    nextUpcomingGame: null,
    isLoadingUpcoming: false,
    loadingStats: false,
  }
);

const router = useRouter();
const display = useDisplay();
const showHeroDesktopExtras = computed(() => display.mdAndUp.value);

const loadingItem = ref<string | null>(null);
const titleRef = ref<HTMLElement | null>(null);

const showFeaturedRadar = computed(
  () => !props.isLoadingUpcoming && !!props.nextUpcomingGame?.name
);

const upcomingReleaseLabel = computed(() => {
  if (!props.nextUpcomingGame?.releaseDate) return "";
  return formatReleaseDate(props.nextUpcomingGame.releaseDate);
});

const upcomingCountdown = computed(() => {
  if (!props.nextUpcomingGame?.releaseDate) return { value: "—", unit: "" };
  return getCountdownHeadline(props.nextUpcomingGame.releaseDate);
});

const handleRoute = async (path: string) => {
  loadingItem.value = path;
  await router.push(path);
  loadingItem.value = null;
};

const openRadarGameDetail = () => {
  const game = props.nextUpcomingGame;
  if (!game?.rawgId) return;
  _store.setActiveDetailedGame(game.rawgId, game.name);
  router.push(`/game-detail/${slugify(game.name)}`);
};

const scrollToContent = () => {
  document.getElementById("home-content")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const runTitleAnimation = () => {
  if (!titleRef.value || showFeaturedRadar.value) return;

  const { chars } = splitText(titleRef.value, { words: false, chars: true });

  animate(chars, {
    y: [
      { to: 0, duration: 0 },
      { to: -6, ease: "outQuad", duration: 400 },
      { to: 0, ease: "outBounce", duration: 500 },
    ],
    opacity: [
      { to: 1, duration: 0 },
      { to: 0.85, duration: 200 },
      { to: 1, duration: 400 },
    ],
    delay: stagger(60, { from: "center" }),
    loop: true,
    loopDelay: 3500,
  });
};

onMounted(() => {
  runTitleAnimation();
});

watch(showFeaturedRadar, (featured) => {
  if (!featured) {
    nextTick(() => runTitleAnimation());
  }
});
</script>

<style scoped>
@import url("~/assets/css/main.css");

.home-hero {
  position: relative;
  width: 100%;
  max-width: 100%;
  margin: 0;
  flex-shrink: 0;
  isolation: isolate;
}

.bg-anim {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-end;
  width: 100%;
  min-height: clamp(520px, 85dvh, 920px);
  padding: 5rem 0 4rem;
  overflow: hidden;
  box-sizing: border-box;
  background: rgb(33, 20, 105);
  background-image:
    radial-gradient(circle at 90% 24%, rgba(209, 209, 209, 0.04) 0%, transparent 50%),
    linear-gradient(88deg, rgb(33, 20, 105), rgb(10, 10, 14));
}

.bg-anim--featured {
  background: #0a0a0a;
  padding-top: 4.75rem;
}

.bg-anim-featured-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.bg-anim-featured-bg--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1510 0%, #0a0a0a 100%);
}

.bg-anim-featured-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.96) 0%,
    rgba(0, 0, 0, 0.82) 42%,
    rgba(0, 0, 0, 0.35) 72%,
    rgba(0, 0, 0, 0.2) 100%
  );
  pointer-events: none;
}

.bg-anim-featured-vignette {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.9) 0%,
    transparent 40%,
    transparent 65%,
    rgba(0, 0, 0, 0.45) 100%
  );
  pointer-events: none;
}

.home-hero-featured-wrap {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1320px;
  margin-inline: auto;
  padding: 0 clamp(12px, 2.5vw, 40px);
  box-sizing: border-box;
}

.hero-brand {
  margin: 0 0 1rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
}

.home-hero-featured-body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: min(100%, 640px);
}

.home-hero-featured-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.75rem;
}

.home-hero-featured-label {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.28rem 0.7rem;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  flex: 0 0 auto;
  width: auto;
  max-width: max-content;
}

.home-hero-featured-label--hot {
  color: #fff;
  background: linear-gradient(135deg, #e65100 0%, #ff6d00 100%);
  box-shadow: 0 4px 14px rgba(230, 81, 0, 0.45);
}

.home-hero-featured-label--radar {
  color: #ffb74d;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 183, 77, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.home-hero-featured-title {
  margin: 0;
  font-size: clamp(1.75rem, 6vw, 3.25rem);
  font-weight: 800;
  line-height: 1.06;
  color: #fff;
  text-shadow: 0 2px 28px rgba(0, 0, 0, 0.85);
}

.home-hero-featured-date {
  margin: 0.55rem 0 0;
  font-size: clamp(0.8rem, 2vw, 1rem);
  color: rgba(255, 255, 255, 0.75);
}

.home-hero-featured-countdown {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  margin-top: 1rem;
  flex: 0 0 auto;
}

.home-hero-featured-countdown-value {
  font-size: clamp(1.6rem, 4.5vw, 2.5rem);
  font-weight: 800;
  color: #ffb74d;
  line-height: 1;
}

.home-hero-featured-countdown-unit {
  font-size: 0.92rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
}

.home-hero-featured-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.35rem;
}

.home-hero-featured-actions :deep(.home-hero-featured-btn) {
  flex: 0 0 auto;
  min-height: 50px !important;
  padding-inline: 1.5rem 1.65rem !important;
  font-size: 0.95rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.04em;
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.35);
}

.home-hero-featured-actions :deep(.home-hero-featured-btn--primary) {
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.25) inset,
    0 8px 28px rgba(255, 183, 77, 0.4);
}

.home-hero-featured-actions :deep(.home-hero-featured-btn--secondary) {
  border-width: 2px !important;
  background: rgba(0, 0, 0, 0.35) !important;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.home-hero-featured-actions :deep(.home-hero-featured-btn:hover) {
  transform: translateY(-2px);
}

.home-hero-featured-actions :deep(.v-btn__prepend) {
  margin-inline-end: 0.5rem !important;
}

.home-hero-featured-actions :deep(.v-icon) {
  font-size: 1.25rem !important;
}

@media (min-width: 600px) {
  .home-hero-featured-actions :deep(.home-hero-featured-btn) {
    min-height: 54px !important;
    padding-inline: 1.75rem 1.9rem !important;
    font-size: 1.02rem !important;
  }
}

.hero-youtube-corner {
  position: absolute;
  right: clamp(12px, 2.5vw, 40px);
  bottom: 3.75rem;
  z-index: 14;
}

.home-hero-loading {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  align-items: flex-end;
  width: 100%;
  max-width: 1320px;
  margin-inline: auto;
  padding: 0 clamp(12px, 2.5vw, 40px) 2rem;
}

.home-hero-loading-skeleton {
  width: 100%;
  min-height: clamp(280px, 50vw, 420px);
  border-radius: 18px;
}

.home-hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 720px;
  width: 100%;
  margin-inline: auto;
  padding: 0.5rem clamp(12px, 2.5vw, 24px) 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  color: #e8e8e8;
  font-size: clamp(1.75rem, 6vw, 3.5rem);
  font-weight: 700;
  margin: 0 auto 0.75rem;
  width: 100%;
  letter-spacing: 3px;
}

.title :deep(span) {
  display: inline-block;
}

.subtitle {
  font-size: clamp(0.85rem, 2vw, 1.05rem);
  line-height: 1.65;
  max-width: 520px;
  margin: 0 auto 1rem;
  opacity: 0.9;
}

.hero-cta-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  max-width: 480px;
  margin: 0.5rem auto 0;
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 42px;
  padding: 0.6rem 1.15rem;
  border-radius: 12px;
  border: 1px solid transparent;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  white-space: nowrap;
}

.hero-cta--discover {
  color: #061a12;
  background: linear-gradient(145deg, #7af5b8 0%, #69f0ae 45%, #4dd89a 100%);
  border-color: rgba(105, 240, 174, 0.65);
  box-shadow: 0 6px 20px rgba(105, 240, 174, 0.28);
}

.hero-cta--discover:hover:not(:disabled) {
  transform: translateY(-3px);
  filter: brightness(1.06);
}

.hero-cta--youtube {
  color: #fff;
  background: linear-gradient(145deg, #ff5252 0%, #e53935 50%, #b71c1c 100%);
  border-color: rgba(255, 120, 120, 0.4);
}

.hero-cta--youtube:hover {
  transform: translateY(-3px);
  filter: brightness(1.05);
}

.hero-cta--suggest {
  color: rgba(255, 255, 255, 0.92);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.hero-cta--suggest:hover:not(:disabled) {
  transform: translateY(-3px);
  border-color: rgba(105, 240, 174, 0.45);
}

.scroll-hint {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 12;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0.5rem;
}

.scroll-hint:hover {
  color: #69f0ae;
}

.scroll-hint-text {
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.scroll-hint-icon {
  animation: scrollBounce 2s ease-in-out infinite;
}

@keyframes scrollBounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(6px);
  }
}

@media (max-width: 959px) {
  .bg-anim--featured {
    padding-bottom: 2.25rem;
    min-height: clamp(480px, 78dvh, 820px);
  }
}

@media (max-width: 599px) {
  .bg-anim-featured-shade {
    background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.96) 0%,
      rgba(0, 0, 0, 0.6) 50%,
      rgba(0, 0, 0, 0.25) 100%
    );
  }

  .home-hero-featured-body {
    max-width: 100%;
  }

  .hero-youtube-corner {
    bottom: 3.25rem;
    right: clamp(12px, 2.5vw, 20px);
  }

  .home-hero-featured-actions {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    max-width: 300px;
  }

  .home-hero-featured-actions :deep(.home-hero-featured-btn) {
    width: 100%;
    min-height: 48px !important;
  }
}
</style>
