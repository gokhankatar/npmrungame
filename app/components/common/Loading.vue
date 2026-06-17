<script lang="ts" setup>
import logo from "@/assets/img/logo_fixed.webp";

const loadingTips = [
  "Oyun kütüphanesi hazırlanıyor…",
  "Koleksiyon yükleniyor…",
  "Yeni maceralar bekliyor…",
  "Keşfet bölümü açılıyor…",
] as const;

const loadingTip = loadingTips[Math.floor(Math.random() * loadingTips.length)];
</script>

<template>
  <div class="site-loading" role="status" aria-live="polite" aria-label="Site yükleniyor">
    <div class="site-loading__scanlines" aria-hidden="true" />
    <div class="site-loading__glow site-loading__glow--a" aria-hidden="true" />
    <div class="site-loading__glow site-loading__glow--b" aria-hidden="true" />

    <div class="site-loading__card">
      <div class="site-loading__logo-ring">
        <v-progress-circular indeterminate :size="76" :width="3" color="#69f0ae" />
        <img :src="logo" alt="" class="site-loading__logo" width="48" height="48" />
      </div>

      <p class="site-loading__brand default-title-letter">npmrungame</p>
      <p class="site-loading__title default-title-letter">Oyun dünyası yükleniyor</p>
      <p class="site-loading__sub default-title-letter">{{ loadingTip }}</p>

      <div class="site-loading__bar" aria-hidden="true">
        <span class="site-loading__bar-fill" />
      </div>

      <div class="site-loading__equalizer" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  </div>
</template>

<style scoped>
.site-loading {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #06080c;
  overflow: hidden;
}

.site-loading__scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.04;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(255, 255, 255, 0.15) 2px,
    rgba(255, 255, 255, 0.15) 4px
  );
}

.site-loading__glow {
  position: absolute;
  width: min(480px, 75vw);
  height: min(480px, 75vw);
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.5;
  pointer-events: none;
}

.site-loading__glow--a {
  top: 18%;
  left: 12%;
  background: radial-gradient(circle, rgba(105, 240, 174, 0.4) 0%, transparent 70%);
  animation: site-loading-pulse 3s ease-in-out infinite;
}

.site-loading__glow--b {
  bottom: 12%;
  right: 10%;
  background: radial-gradient(circle, rgba(67, 160, 71, 0.25) 0%, transparent 70%);
  animation: site-loading-pulse 3s ease-in-out infinite 1.5s;
}

.site-loading__card {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 2.25rem 2.5rem 2rem;
  border-radius: 22px;
  border: 1px solid rgba(105, 240, 174, 0.22);
  background: rgba(10, 14, 18, 0.88);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(105, 240, 174, 0.08);
  min-width: min(340px, 90vw);
}

.site-loading__logo-ring {
  position: relative;
  width: 88px;
  height: 88px;
  margin: 0 auto 1.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.site-loading__logo {
  position: absolute;
  object-fit: contain;
  filter: drop-shadow(0 0 12px rgba(105, 240, 174, 0.35));
}

.site-loading__brand {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(105, 240, 174, 0.85);
}

.site-loading__title {
  margin: 0.55rem 0 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.95);
}

.site-loading__sub {
  margin: 0.4rem 0 0;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.45);
  min-height: 1.2em;
}

.site-loading__bar {
  margin-top: 1.4rem;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.site-loading__bar-fill {
  display: block;
  height: 100%;
  width: 40%;
  border-radius: inherit;
  background: linear-gradient(90deg, transparent, #69f0ae, transparent);
  animation: site-loading-bar 1.2s ease-in-out infinite;
}

.site-loading__equalizer {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-top: 1.25rem;
}

.site-loading__equalizer span {
  display: block;
  width: 0.28rem;
  height: 0.75rem;
  border-radius: 2px;
  background: #cfcfcf;
  animation: site-loading-eq 1.2s infinite ease-in-out;
}

.site-loading__equalizer span:nth-child(1) {
  animation-delay: 0.1s;
}
.site-loading__equalizer span:nth-child(2) {
  animation-delay: 0.25s;
}
.site-loading__equalizer span:nth-child(3) {
  animation-delay: 0.4s;
}
.site-loading__equalizer span:nth-child(4) {
  animation-delay: 0.55s;
}
.site-loading__equalizer span:nth-child(5) {
  animation-delay: 0.7s;
}

@keyframes site-loading-bar {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(320%);
  }
}

@keyframes site-loading-eq {
  0% {
    height: 0.75rem;
    background: #69f0ae;
  }
  50% {
    height: 1.5rem;
    background: #8c8c8c;
  }
  100% {
    height: 0.75rem;
    background: #cfcfcf;
  }
}

@keyframes site-loading-pulse {
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
</style>
