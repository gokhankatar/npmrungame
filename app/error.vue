<script setup lang="ts">
import type { NuxtError } from "#app";
import { useAppLocale } from "~/composables/useAppLocale";

const props = defineProps<{ error: NuxtError }>();

const { tx } = useAppLocale();

const isNotFound = computed(() => Number(props.error?.statusCode) === 404);
const code = computed(() => Number(props.error?.statusCode) || 500);

const title = computed(() =>
  isNotFound.value ? tx("error.notFound.title") : tx("error.generic.title")
);
const description = computed(() =>
  isNotFound.value
    ? tx("error.notFound.description")
    : tx("error.generic.description")
);

useHead({
  title: () => `${code.value} · npmrungame`,
});

function goHome() {
  clearError({ redirect: "/" });
}

function goBack() {
  if (import.meta.client && window.history.length > 1) {
    clearError();
    window.history.back();
    return;
  }
  goHome();
}

/** Mini geometric field — same language as loading screen */
const GRID = 5;
const mid = (GRID - 1) / 2;
const maxDist = Math.hypot(mid, mid) || 1;
const dots = Array.from({ length: GRID * GRID }, (_, index) => {
  const x = index % GRID;
  const y = Math.floor(index / GRID);
  const dist = Math.hypot(x - mid, y - mid) / maxDist;
  const closeness = 1 - dist;
  return {
    id: `${x}-${y}`,
    scale: (0.4 + closeness * 1.1).toFixed(3),
    fade: (0.25 + closeness * 0.75).toFixed(3),
    delay: `${(dist * 0.55).toFixed(3)}s`,
  };
});
</script>

<template>
  <div
    class="error-page relative flex min-h-screen flex-col overflow-hidden bg-bg font-sans text-white"
  >
    <header
      class="relative z-20 flex items-center justify-between px-5 pt-5 sm:px-8"
    >
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white"
        @click.prevent="goHome"
      >
        <img
          src="~/assets/img/logo_fixed.webp"
          alt="npmrungame"
          class="h-9 w-9 rounded-xl object-contain"
        />
        <span class="hidden sm:inline">npmrungame</span>
      </NuxtLink>
      <CommonAppPreferences variant="dropdown" />
    </header>

    <main
      class="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-10 text-center"
    >
      <span
        class="error-page__ghost pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-black leading-none tracking-tighter"
        aria-hidden="true"
      >
        {{ code }}
      </span>

      <div class="relative flex max-w-lg flex-col items-center">
        <span
          class="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary"
        >
          <span
            class="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
            aria-hidden="true"
          />
          {{ tx("error.badge") }} · {{ code }}
        </span>

        <div class="error-page__field mt-6" aria-hidden="true">
          <span
            v-for="dot in dots"
            :key="dot.id"
            class="error-page__dot"
            :style="{
              animationDelay: dot.delay,
              '--scale': dot.scale,
              '--fade': dot.fade,
            }"
          />
        </div>

        <h1 class="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
          {{ title }}
        </h1>
        <p
          class="mt-3 max-w-md text-sm leading-relaxed text-white/65 sm:text-base"
        >
          {{ description }}
        </p>
        <p
          v-if="error.statusMessage && !isNotFound"
          class="mt-2 max-w-md truncate text-xs text-white/40"
        >
          {{ error.statusMessage }}
        </p>

        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-bg shadow-lg shadow-primary/20 transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg"
            @click="goHome"
          >
            <svg
              class="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.8"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            {{ tx("error.home") }}
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 shadow-sm backdrop-blur transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40"
            @click="goBack"
          >
            <svg
              class="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.8"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            {{ tx("error.back") }}
          </button>
        </div>
      </div>
    </main>

    <footer
      class="relative z-10 pb-6 text-center text-xs text-white/35"
    >
      npmrungame · {{ code }}
    </footer>
  </div>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  min-height: 100dvh;
  --pattern-line: rgb(105 240 174 / 0.1);
  --pattern-line-soft: rgb(148 163 184 / 0.1);
  --pattern-accent: rgb(105 240 174 / 0.05);
  --pattern-dot: rgb(105 240 174 / 0.22);
  --pattern-dot-soft: rgb(148 163 184 / 0.14);
}

.error-page::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    repeating-linear-gradient(
      45deg,
      var(--pattern-line) 0 1px,
      transparent 1px 14px
    ),
    repeating-linear-gradient(
      -45deg,
      var(--pattern-line-soft) 0 1px,
      transparent 1px 14px
    ),
    radial-gradient(
      ellipse 80% 60% at 20% 80%,
      rgb(105 240 174 / 0.08),
      transparent 55%
    ),
    radial-gradient(
      ellipse 70% 50% at 90% 10%,
      rgb(33 150 243 / 0.08),
      transparent 50%
    );
}

.error-page::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(circle at 50% 50%, var(--pattern-dot) 0.65px, transparent 0.85px),
    radial-gradient(
      circle at 50% 50%,
      var(--pattern-dot-soft) 0.5px,
      transparent 0.7px
    );
  background-size: 12px 12px, 24px 24px;
  background-position: 0 0, 6px 6px;
  -webkit-mask-image: radial-gradient(
    ellipse 90% 80% at 50% 40%,
    #000 0%,
    #000 30%,
    transparent 75%
  );
  mask-image: radial-gradient(
    ellipse 90% 80% at 50% 40%,
    #000 0%,
    #000 30%,
    transparent 75%
  );
}

.error-page__ghost {
  font-size: clamp(11rem, 38vw, 26rem);
  color: transparent;
  -webkit-text-stroke: 1.5px rgb(105 240 174 / 0.14);
  animation: error-ghost-float 7s ease-in-out infinite;
}

.error-page__field {
  display: grid;
  grid-template-columns: repeat(5, 0.55rem);
  gap: 0.55rem;
}

.error-page__dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 9999px;
  background: #69f0ae;
  opacity: calc(var(--fade) * 0.85);
  transform: scale(var(--scale));
  animation: error-dot-pulse 1.8s ease-in-out infinite;
  box-shadow: 0 0 10px rgb(105 240 174 / 0.35);
}

@keyframes error-ghost-float {
  0%,
  100% {
    transform: translate(-50%, -50%) translateY(0);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-10px);
  }
}

@keyframes error-dot-pulse {
  0%,
  100% {
    opacity: calc(var(--fade) * 0.55);
    transform: scale(calc(var(--scale) * 0.85));
  }
  50% {
    opacity: calc(var(--fade) * 1);
    transform: scale(var(--scale));
  }
}

@media (prefers-reduced-motion: reduce) {
  .error-page__ghost,
  .error-page__dot {
    animation: none;
  }
}
</style>
