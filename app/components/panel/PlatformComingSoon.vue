<script setup lang="ts">
import PanelPageTitle from "~/components/panel/PanelPageTitle.vue";
import { useAppLocale } from "~/composables/useAppLocale";

const props = defineProps<{
  platform: "epic" | "playstation";
  title: string;
  blurb: string;
  icon: string;
}>();

const { tx } = useAppLocale();

const features = computed(() => {
  if (props.platform === "epic") {
    return [
      tx("panel.platformSoon.feat.library"),
      tx("panel.platformSoon.feat.link"),
      tx("panel.platformSoon.feat.sync"),
    ];
  }
  return [
    tx("panel.platformSoon.feat.library"),
    tx("panel.platformSoon.feat.trophy"),
    tx("panel.platformSoon.feat.link"),
  ];
});
</script>

<template>
  <div class="pcs" :class="`pcs--${platform}`">
    <header class="pcs__head">
      <PanelPageTitle :text="title" />
      <p class="pcs__sub">{{ blurb }}</p>
    </header>

    <section class="pcs-card" aria-live="polite">
      <div class="pcs-card__glow" aria-hidden="true" />
      <div class="pcs-card__grid" aria-hidden="true" />

      <div class="pcs-card__badge">
        <v-icon icon="mdi-clock-outline" size="16" />
        {{ tx("panel.platformSoon.badge") }}
      </div>

      <div class="pcs-card__icon-wrap">
        <v-icon :icon="icon" size="56" />
      </div>

      <h2 class="pcs-card__title">{{ tx("panel.platformSoon.title") }}</h2>
      <p class="pcs-card__lead">{{ tx("panel.platformSoon.lead") }}</p>

      <ul class="pcs-card__feats">
        <li v-for="(f, i) in features" :key="i">
          <v-icon icon="mdi-check-circle-outline" size="18" />
          <span>{{ f }}</span>
        </li>
      </ul>

      <div class="pcs-card__foot">
        <NuxtLink to="/dashboard/platforms/steam" class="pcs-card__cta">
          <v-icon icon="mdi-steam" size="18" />
          {{ tx("panel.platformSoon.ctaSteam") }}
        </NuxtLink>
        <NuxtLink to="/dashboard/account" class="pcs-card__link">
          {{ tx("panel.platformSoon.ctaAccount") }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pcs {
  width: 100%;
  max-width: 920px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}
.pcs__sub {
  margin: 0.45rem 0 0;
  max-width: 40rem;
  color: var(--panel-muted, #64748b);
  font-size: 0.95rem;
  line-height: 1.45;
}
.pcs-card {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 22px;
  padding: 2rem 1.6rem 1.75rem;
  border: 1px solid var(--panel-card-border, rgb(15 23 42 / 0.1));
  background: var(--panel-card, #0c1220);
  box-shadow: var(--panel-card-shadow, 0 18px 40px rgb(0 0 0 / 0.22));
  text-align: center;
}
.pcs-card__glow {
  position: absolute;
  inset: -20% auto auto 50%;
  width: min(70%, 420px);
  height: 220px;
  transform: translateX(-50%);
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.55;
  z-index: 0;
  pointer-events: none;
}
.pcs--epic .pcs-card__glow {
  background: radial-gradient(circle, #0078f2 0%, transparent 70%);
}
.pcs--playstation .pcs-card__glow {
  background: radial-gradient(circle, #003791 0%, #1e90ff 40%, transparent 70%);
}
.pcs-card__grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.22;
  background-image:
    linear-gradient(rgb(255 255 255 / 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(ellipse at center, #000 20%, transparent 75%);
  pointer-events: none;
}
.pcs-card__badge {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1.1rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--panel-accent, #69f0ae);
  background: var(--panel-icon-bg, rgb(105 240 174 / 0.12));
  border: 1px solid var(--panel-icon-border, rgb(105 240 174 / 0.28));
}
.pcs-card__icon-wrap {
  position: relative;
  z-index: 1;
  width: 96px;
  height: 96px;
  margin: 0 auto 1rem;
  display: grid;
  place-items: center;
  border-radius: 24px;
  border: 1px solid rgb(255 255 255 / 0.12);
  background: rgb(0 0 0 / 0.28);
  color: #e8eef7;
  box-shadow: 0 12px 28px rgb(0 0 0 / 0.25);
}
.pcs--epic .pcs-card__icon-wrap {
  background: linear-gradient(160deg, #0b1c33, #071018);
  color: #4da3ff;
}
.pcs--playstation .pcs-card__icon-wrap {
  background: linear-gradient(160deg, #001a3d, #06101c);
  color: #5eb1ff;
}
.pcs-card__title {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: clamp(1.35rem, 2.4vw, 1.75rem);
  font-weight: 800;
  color: var(--panel-text, #e8eef7);
  letter-spacing: -0.02em;
}
:global(.panel-shell[data-theme="light"]) .pcs-card__title {
  color: #065f46;
}
:global(.panel-shell[data-theme="light"]) .pcs-card__badge {
  color: #047857;
}
.pcs-card__lead {
  position: relative;
  z-index: 1;
  margin: 0.55rem auto 0;
  max-width: 34rem;
  color: var(--panel-muted, #94a3b8);
  font-size: 0.95rem;
  line-height: 1.5;
}
.pcs-card__feats {
  position: relative;
  z-index: 1;
  list-style: none;
  margin: 1.35rem auto 0;
  padding: 0;
  max-width: 28rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  text-align: left;
}
.pcs-card__feats li {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.65rem 0.8rem;
  border-radius: 12px;
  background: var(--panel-soft, rgb(0 0 0 / 0.22));
  border: 1px solid var(--panel-border, rgb(255 255 255 / 0.06));
  color: var(--panel-text, #e8eef7);
  font-size: 0.9rem;
  font-weight: 600;
}
.pcs-card__feats .v-icon {
  color: var(--panel-accent, #69f0ae);
  margin-top: 1px;
}
.pcs-card__foot {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.65rem;
  margin-top: 1.5rem;
}
.pcs-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.05rem;
  border-radius: 12px;
  background: var(--panel-accent, #69f0ae);
  color: var(--panel-accent-ink, #07140f);
  font-weight: 800;
  font-size: 0.9rem;
  text-decoration: none;
}
.pcs-card__link {
  display: inline-flex;
  align-items: center;
  padding: 0.65rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--panel-card-border, rgb(255 255 255 / 0.12));
  color: var(--panel-text, #e8eef7);
  font-weight: 700;
  font-size: 0.88rem;
  text-decoration: none;
  background: transparent;
}
.pcs-card__link:hover {
  border-color: var(--panel-accent, #69f0ae);
}

:global(.panel-shell[data-theme="light"]) .pcs-card__grid {
  background-image:
    linear-gradient(rgb(15 23 42 / 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgb(15 23 42 / 0.05) 1px, transparent 1px);
}
:global(.panel-shell[data-theme="light"]) .pcs-card__icon-wrap {
  border-color: rgb(15 23 42 / 0.1);
  box-shadow: 0 10px 24px rgb(15 23 42 / 0.08);
}
</style>
