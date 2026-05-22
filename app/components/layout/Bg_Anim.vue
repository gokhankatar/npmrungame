<template>
  <section class="home-hero" aria-label="Ana sayfa hero">
  <div class="bg-anim">
    <div class="home-hero-content">
      <p ref="titleRef" class="title default-title-letter">npmrungame</p>
      <p class="subtitle text-grey-lighten-1">
        4K oyun dünyasının nabzını tutan bir kanal.<br />
        Niş indielerden AAA yapımlara, donanımdan güncel haberlere kadar geniş içerik sunar.
      </p>

      <div
        v-if="randomToPlayGame?.name && !loadingStats"
        class="hero-spotlight-game cursor-pointer"
        @click="goRandomToPlayGame"
      >
        <v-avatar v-if="randomToPlayGame.background_image" size="36" rounded="lg">
          <v-img :src="randomToPlayGame.background_image" cover />
        </v-avatar>
        <v-icon v-else icon="mdi-playlist-play" color="#4dd0e1" size="small" />
        <span class="hero-spotlight-game-text text-truncate">
          Oynayacağım:
          <strong>{{ randomToPlayGame.name }}</strong>
        </span>
        <v-icon icon="mdi-chevron-right" size="small" color="grey-lighten-1" />
      </div>

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
          <v-progress-circular
            v-if="loadingItem === '/recommend-games'"
            indeterminate
            :size="16"
            width="2"
            color="#e8e8e8"
          />
          <v-icon v-else icon="mdi-gamepad-variant-outline" size="18" />
          <span>Oyun Öner</span>
        </button>
      </div>
    </div>

    <button type="button" class="scroll-hint" aria-label="İçeriğe kaydır" @click="scrollToContent">
      <span class="scroll-hint-text">Keşfetmeye başla</span>
      <v-icon icon="mdi-chevron-double-down" class="scroll-hint-icon" size="small" />
    </button>
  </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { animate, stagger, splitText } from "animejs";
import { slugify } from "~/composables/core/basicFunc";
import store from "~/store/store";

const _store = store();

const props = withDefaults(
  defineProps<{
    randomToPlayGame?: {
      id?: number | string;
      name?: string;
      background_image?: string;
    } | null;
    loadingStats?: boolean;
  }>(),
  {
    randomToPlayGame: null,
    loadingStats: false,
  }
);

const router = useRouter();
const loadingItem = ref<string | null>(null);
const titleRef = ref<HTMLElement | null>(null);

const handleRoute = async (path: string) => {
  loadingItem.value = path;
  await router.push(path);
  loadingItem.value = null;
};

const goRandomToPlayGame = () => {
  const game = props.randomToPlayGame;
  if (!game?.name || game.id == null) return;
  _store.setActiveDetailedGame(game.id, game.name);
  router.push(`/game-detail/${slugify(game.name)}`);
};

const scrollToContent = () => {
  const el = document.getElementById("home-content");
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
};

onMounted(() => {
  if (!titleRef.value) return;

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
  box-sizing: border-box;
}

.bg-anim {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: clamp(520px, 78dvh, 900px);
  padding: 4.5rem 1rem 4rem;
  overflow: hidden;
  box-sizing: border-box;
  background: rgb(33, 20, 105);
  background-image:
    radial-gradient(circle at 90% 24%, rgba(209, 209, 209, 0.04) 0%, transparent 50%),
    radial-gradient(circle at 91% 63%, rgba(45, 45, 45, 0.04) 0%, transparent 50%),
    radial-gradient(circle at 17% 2%, rgba(124, 124, 124, 0.04) 0%, transparent 50%),
    linear-gradient(88deg, rgb(33, 20, 105), rgb(10, 10, 14));
}

.home-hero-content {
  position: relative;
  top: auto;
  left: auto;
  right: auto;
  transform: none;
  text-align: center;
  z-index: 10;
  max-width: 720px;
  width: 100%;
  margin-inline: auto;
  padding: 0.5rem clamp(12px, 2.5vw, 24px) 2rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  color: #e8e8e8;
  font-size: clamp(1.75rem, 6vw, 3.5rem);
  font-weight: 700;
  margin: 0 auto 0.75rem;
  display: block;
  width: 100%;
  text-align: center;
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

.hero-spotlight-game {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 100%;
  margin: 0 auto 1.25rem;
  padding: 0.45rem 0.85rem 0.45rem 0.5rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(77, 208, 225, 0.35);
  transition: border-color 0.25s ease, transform 0.25s ease;
}

.hero-spotlight-game:hover {
  border-color: rgba(77, 208, 225, 0.6);
  transform: translateY(-2px);
}

.hero-spotlight-game-text {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.75);
  max-width: min(280px, 70vw);
}

.hero-spotlight-game-text strong {
  color: #4dd0e1;
  font-weight: 600;
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
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    filter 0.2s ease;
  white-space: nowrap;
}

.hero-cta:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.45);
  outline-offset: 2px;
}

.hero-cta:disabled {
  opacity: 0.65;
  cursor: wait;
  transform: none !important;
}

.hero-cta--discover {
  color: #061a12;
  background: linear-gradient(145deg, #7af5b8 0%, #69f0ae 45%, #4dd89a 100%);
  border-color: rgba(105, 240, 174, 0.65);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.35) inset,
    0 6px 20px rgba(105, 240, 174, 0.28);
}

.hero-cta--discover:hover:not(:disabled) {
  transform: translateY(-3px);
  filter: brightness(1.06);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.4) inset,
    0 10px 28px rgba(105, 240, 174, 0.42);
}

.hero-cta--youtube {
  color: #fff;
  background: linear-gradient(145deg, #ff5252 0%, #e53935 50%, #b71c1c 100%);
  border-color: rgba(255, 120, 120, 0.4);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.2) inset,
    0 6px 20px rgba(229, 57, 53, 0.32);
}

.hero-cta--youtube:hover {
  transform: translateY(-3px);
  filter: brightness(1.05);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.25) inset,
    0 10px 28px rgba(229, 57, 53, 0.48);
}

.hero-cta--suggest {
  color: rgba(255, 255, 255, 0.92);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.25);
}

.hero-cta--suggest:hover:not(:disabled) {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(105, 240, 174, 0.45);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(105, 240, 174, 0.15);
}

@media (max-width: 480px) {
  .hero-cta-group {
    flex-direction: column;
    max-width: 240px;
    gap: 0.55rem;
  }

  .hero-cta {
    width: 100%;
    padding: 0.65rem 1.1rem;
  }
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
  transition: color 0.25s ease;
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
</style>
