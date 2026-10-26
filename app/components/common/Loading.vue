<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    fullscreen?: boolean;
  }>(),
  {
    title: "",
    subtitle: "",
    fullscreen: true,
  }
);

const { tx } = useAppLocale();

const heading = computed(() => props.title || tx("common.loading.title"));
const sub = computed(() => props.subtitle || tx("common.loading.subtitle"));

/** 7×7 geometric field — center dots larger / brighter, ripple delay by distance */
const GRID = 7;
const mid = (GRID - 1) / 2;
const maxDist = Math.hypot(mid, mid);

const dots = Array.from({ length: GRID * GRID }, (_, index) => {
  const x = index % GRID;
  const y = Math.floor(index / GRID);
  const dist = Math.hypot(x - mid, y - mid) / maxDist;
  const closeness = 1 - dist;
  return {
    id: `${x}-${y}`,
    scale: (0.34 + closeness * 1.15).toFixed(3),
    fade: (0.28 + closeness * 0.72).toFixed(3),
    delay: `${(dist * 0.72).toFixed(3)}s`,
  };
});
</script>

<template>
  <div
    class="geo-loading"
    :class="{ 'geo-loading--fullscreen': fullscreen }"
    role="status"
    aria-live="polite"
    :aria-label="heading"
  >
    <div class="geo-loading__atmosphere" aria-hidden="true">
      <span class="geo-loading__orb geo-loading__orb--a" />
      <span class="geo-loading__orb geo-loading__orb--b" />
    </div>

    <div class="geo-loading__stage" aria-hidden="true">
      <div class="geo-loading__glow" />
      <div class="geo-loading__field">
        <span
          v-for="dot in dots"
          :key="dot.id"
          class="geo-loading__dot"
          :style="{
            animationDelay: dot.delay,
            '--scale': dot.scale,
            '--fade': dot.fade,
          }"
        />
      </div>
    </div>

    <div class="geo-loading__copy">
      <p class="geo-loading__brand">npmrungame</p>
      <p class="geo-loading__title">{{ heading }}</p>
      <p class="geo-loading__sub">{{ sub }}</p>
    </div>
  </div>
</template>

<style scoped>
.geo-loading {
  position: relative;
  width: 100%;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  overflow: hidden;
  background: #06080c;
  color: #fff;
  font-family: "Montserrat", ui-sans-serif, system-ui, sans-serif;
}

.geo-loading--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  min-height: 100vh;
  min-height: 100dvh;
}

.geo-loading__atmosphere {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.geo-loading__orb {
  position: absolute;
  width: min(420px, 70vw);
  height: min(420px, 70vw);
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.45;
  animation: geo-orb 5s ease-in-out infinite;
}

.geo-loading__orb--a {
  top: 8%;
  left: 8%;
  background: radial-gradient(
    circle,
    rgba(105, 240, 174, 0.35) 0%,
    transparent 70%
  );
}

.geo-loading__orb--b {
  right: 5%;
  bottom: 10%;
  background: radial-gradient(
    circle,
    rgba(33, 150, 243, 0.18) 0%,
    transparent 70%
  );
  animation-delay: 1.6s;
}

.geo-loading__stage {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: min(46vw, 420px);
}

.geo-loading__glow {
  position: absolute;
  width: 88%;
  height: 88%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(105, 240, 174, 0.22),
    transparent 68%
  );
  filter: blur(12px);
  pointer-events: none;
}

.geo-loading__field {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: clamp(12px, 2vw, 26px);
  width: 100%;
  place-items: center;
}

.geo-loading__dot {
  width: clamp(10px, 1.4vw, 16px);
  height: clamp(10px, 1.4vw, 16px);
  border-radius: 50%;
  background: #69f0ae;
  box-shadow: 0 0 14px rgba(105, 240, 174, 0.45);
  transform: scale(0.22);
  opacity: 0.08;
  animation: geo-gather 2.2s ease-in-out infinite;
}

.geo-loading__copy {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 0 1.5rem;
}

.geo-loading__brand {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(105, 240, 174, 0.9);
}

.geo-loading__title {
  margin: 0.55rem 0 0;
  font-size: clamp(1rem, 2.4vw, 1.2rem);
  font-weight: 800;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.95);
}

.geo-loading__sub {
  margin: 0.4rem 0 0;
  font-size: 0.8rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.42);
}

@keyframes geo-gather {
  0%,
  18% {
    transform: scale(0.22);
    opacity: 0.1;
  }

  58% {
    transform: scale(var(--scale));
    opacity: var(--fade);
  }

  100% {
    transform: scale(0.22);
    opacity: 0.1;
  }
}

@keyframes geo-orb {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(1);
  }
  50% {
    opacity: 0.55;
    transform: scale(1.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .geo-loading__dot,
  .geo-loading__orb {
    animation: none;
  }

  .geo-loading__dot {
    transform: scale(var(--scale, 1));
    opacity: var(--fade, 0.8);
  }
}
</style>
