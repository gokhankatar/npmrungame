<script setup lang="ts">
import { useAppLocale } from "~/composables/useAppLocale";

const { tx } = useAppLocale();
</script>

<template>
  <div class="auth-screen">
    <div class="auth-bg" aria-hidden="true">
      <img src="/media/misc/auth-bg.jpg" alt="" class="auth-bg__img" />
      <div class="auth-bg__grad auth-bg__grad--t" />
      <div class="auth-bg__grad auth-bg__grad--r" />
      <div class="auth-hero">
        <div class="auth-hero__inner">
          <span class="auth-hero__bar" />
          <p class="auth-hero__eyebrow">{{ tx("auth.hero.eyebrow") }}</p>
          <h1 class="auth-hero__title">{{ tx("auth.hero.title") }}</h1>
          <p class="auth-hero__subtitle">{{ tx("auth.hero.subtitle") }}</p>
          <p class="auth-hero__tagline">{{ tx("auth.tagline") }}</p>
        </div>
      </div>
    </div>

    <div class="auth-shell">
      <div class="auth-prefs">
        <CommonAppPreferences variant="dropdown" />
      </div>

      <div class="auth-main">
        <div class="auth-card">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-screen {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  background: #020617;
  font-family: "Montserrat", ui-sans-serif, system-ui, sans-serif;
  color: #fff;
}

.auth-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.auth-bg__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.auth-bg__grad {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.auth-bg__grad--t {
  background: linear-gradient(
    to top,
    rgb(2 44 34 / 0.88),
    rgb(15 23 42 / 0.28),
    rgb(15 23 42 / 0.22)
  );
}

.auth-bg__grad--r {
  background: linear-gradient(
    to right,
    rgb(2 6 23 / 0.62),
    transparent,
    rgb(2 6 23 / 0.42)
  );
}

.auth-hero {
  position: relative;
  display: none;
  height: 100%;
  max-width: 56%;
  flex-direction: column;
  justify-content: flex-end;
  padding: 3.5rem;
}

.auth-hero__inner {
  max-width: 36rem;
}

.auth-hero__bar {
  display: block;
  width: 2.5rem;
  height: 0.25rem;
  border-radius: 9999px;
  background: #69f0ae;
}

.auth-hero__eyebrow {
  margin-top: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgb(105 240 174 / 0.92);
}

.auth-hero__title {
  margin-top: 0.75rem;
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.15;
  color: #fff;
}

.auth-hero__subtitle {
  margin-top: 1rem;
  max-width: 32rem;
  font-size: 1rem;
  line-height: 1.625;
  color: rgb(226 232 240 / 0.92);
}

.auth-hero__tagline {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgb(255 255 255 / 0.15);
  font-size: 0.75rem;
  color: rgb(203 213 225 / 0.8);
}

.auth-shell {
  position: relative;
  z-index: 10;
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  flex-direction: column;
}

.auth-prefs {
  position: relative;
  z-index: 30;
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  padding: 0.75rem 1rem 0;
}

.auth-main {
  position: relative;
  z-index: 10;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  padding: 1.5rem 1rem;
}

.auth-card {
  width: 100%;
  max-width: 28rem;
  margin: auto;
  padding: 1.75rem;
  border-radius: 1.5rem;
  /* Light: buzlu beyaz kart (biscount) */
  border: 1px solid rgb(255 255 255 / 0.7);
  background: rgb(255 255 255 / 0.72);
  box-shadow:
    0 25px 50px -12px rgb(15 23 42 / 0.28),
    0 0 0 1px rgb(255 255 255 / 0.45);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #0f172a;
}

:global(html.dark) .auth-card {
  border: 1px solid rgb(255 255 255 / 0.12);
  background: rgb(15 23 42 / 0.58);
  box-shadow:
    0 25px 50px -12px rgb(0 0 0 / 0.45),
    0 0 0 1px rgb(255 255 255 / 0.08);
  color: #fff;
}

@media (min-width: 640px) {
  .auth-prefs {
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .auth-main {
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .auth-card {
    padding: 2.25rem;
  }
}

@media (min-width: 1024px) {
  .auth-hero {
    display: flex;
  }

  .auth-prefs {
    padding: 2rem 2.5rem 0;
  }

  .auth-main {
    padding: 2.5rem 4rem;
  }

  .auth-card {
    margin-left: auto;
    margin-right: 0;
  }
}

@media (min-width: 1280px) {
  .auth-main {
    padding-left: 6rem;
    padding-right: 6rem;
  }
}
</style>
