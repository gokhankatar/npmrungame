<script setup lang="ts">
import SteamGameSkeleton from "~/components/panel/SteamGameSkeleton.vue";
import { useAppLocale } from "~/composables/useAppLocale";
import { steamHours, type SteamGame } from "~/composables/useSteamHub";
import { advanceSteamCover, steamCoverSrc } from "~/utils/steamCover";

/** Header (yüksek çözünürlük) — 32px community icon satırda bulanık kalıyordu */
function rowThumb(g: SteamGame) {
  return steamCoverSrc(g);
}

type AchProgress = {
  unlocked: number;
  total: number;
  completionPct: number;
  isComplete: boolean;
  status: "ready" | "none";
};

const props = defineProps<{
  games: SteamGame[];
  platinumCount: number;
  progressScanning: boolean;
  loading?: boolean;
  getProgress: (appId: number) => AchProgress | null;
}>();

const { tx } = useAppLocale();
const search = ref("");
const onlyPlatinum = ref(false);

const rows = computed(() => {
  const q = search.value.trim().toLowerCase();
  let list = [...props.games];
  if (q) list = list.filter((g) => g.name.toLowerCase().includes(q));
  if (onlyPlatinum.value) {
    list = list.filter((g) => props.getProgress(g.appId)?.isComplete);
  }
  list.sort((a, b) => {
    const pa = props.getProgress(a.appId);
    const pb = props.getProgress(b.appId);
    const ca = pa?.isComplete ? 1 : 0;
    const cb = pb?.isComplete ? 1 : 0;
    if (ca !== cb) return cb - ca;
    const pctA = pa?.status === "ready" ? pa.completionPct : -1;
    const pctB = pb?.status === "ready" ? pb.completionPct : -1;
    if (pctA !== pctB) return pctB - pctA;
    return b.playtimeForeverMin - a.playtimeForeverMin;
  });
  return list;
});

function onCoverError(e: Event, g: SteamGame) {
  advanceSteamCover(e, g);
}
</script>

<template>
  <div class="sa">
    <div class="sa-toolbar">
      <input
        v-model="search"
        type="search"
        class="sa-search"
        :placeholder="tx('panel.steam.search')"
      />
      <label class="sa-check">
        <input v-model="onlyPlatinum" type="checkbox" />
        {{ tx("panel.steam.platinumOnly") }}
      </label>
      <span v-if="platinumCount" class="sa-chip">
        <v-icon icon="mdi-trophy" size="16" />
        {{
          tx("panel.steam.platinumChip").replace("{n}", String(platinumCount))
        }}
      </span>
      <span v-else-if="progressScanning" class="sa-chip sa-chip--scan">
        {{ tx("panel.steam.platinumScanning") }}
      </span>
    </div>

    <SteamGameSkeleton v-if="loading" :count="6" />
    <ul v-else class="sa-list">
      <li v-for="(g, idx) in rows" :key="g.appId">
        <NuxtLink
          :to="`/dashboard/platforms/steam/games/${g.appId}`"
          class="sa-row"
          :class="{ 'sa-row--plat': getProgress(g.appId)?.isComplete }"
        >
          <span class="sa-rank" aria-hidden="true">#{{ idx + 1 }}</span>
          <img
            :src="rowThumb(g)"
            :alt="g.name"
            class="sa-row__img"
            loading="lazy"
            @error="onCoverError($event, g)"
          />
          <div class="sa-row__body">
            <strong :title="g.name">{{ g.name }}</strong>
            <span
              >{{ steamHours(g.playtimeForeverMin) }}
              {{ tx("panel.steam.hours") }}</span
            >
          </div>
          <div class="sa-row__prog">
            <template v-if="getProgress(g.appId)?.status === 'ready'">
              <span
                v-if="getProgress(g.appId)?.isComplete"
                class="sa-badge sa-badge--plat"
              >
                <v-icon icon="mdi-trophy" size="14" />
                {{ tx("panel.steam.platinum") }}
              </span>
              <span v-else class="sa-badge">
                %{{ getProgress(g.appId)?.completionPct }}
              </span>
              <div class="sa-bar">
                <i
                  :style="{
                    width: `${getProgress(g.appId)?.completionPct || 0}%`,
                  }"
                />
              </div>
              <em>
                {{ getProgress(g.appId)?.unlocked }}/{{
                  getProgress(g.appId)?.total
                }}
              </em>
            </template>
            <span v-else-if="progressScanning" class="sa-muted">…</span>
            <span v-else class="sa-muted">—</span>
          </div>
          <v-icon icon="mdi-chevron-right" size="22" class="sa-row__chev" />
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Keşif / panel token — light’ta koyu ada yok */
.sa {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.sa-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-items: center;
  padding: 0;
  border-radius: 0;
  background: transparent;
  border: none;
}
.sa-search {
  flex: 1 1 220px;
  min-width: 0;
  padding: 0.65rem 0.9rem;
  border-radius: 12px;
  border: 1px solid var(--panel-card-border, rgb(15 23 42 / 0.12));
  background: var(--panel-card, #0c1220);
  color: var(--panel-text, #0f172a);
  box-shadow: none;
}
:global(.panel-shell[data-theme="light"] .sa-search) {
  background: var(--panel-soft, #c2cad6);
  border-color: var(--panel-card-border);
}
.sa-search::placeholder {
  color: var(--panel-muted, #64748b);
}
.sa-check {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--panel-text, #0f172a);
  cursor: pointer;
}
.sa-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: color-mix(in srgb, #ca8a04 16%, var(--panel-card, #ced5e0));
  border: 1px solid color-mix(in srgb, #ca8a04 50%, var(--panel-card-border));
  color: #854d0e;
  font-size: 0.78rem;
  font-weight: 800;
}
.sa-chip--scan {
  background: var(--panel-icon-bg);
  border-color: var(--panel-icon-border);
  color: var(--panel-accent);
}
:global(.panel-shell[data-theme="dark"] .sa-chip) {
  background: color-mix(in srgb, #f5d76e 22%, var(--panel-card));
  border-color: color-mix(in srgb, #f5d76e 50%, transparent);
  color: #f5d76e;
}
.sa-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.sa-rank {
  display: inline-flex;
  min-width: 2.1rem;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--panel-muted, #64748b);
  letter-spacing: 0.02em;
}
.sa-row {
  display: grid;
  grid-template-columns: 2.2rem 120px 1fr auto auto;
  gap: 0.85rem;
  align-items: center;
  padding: 0.55rem 0.75rem 0.55rem 0.55rem;
  border-radius: 14px;
  border: 1px solid var(--panel-card-border, rgb(15 23 42 / 0.12));
  background: var(--panel-card, #0c1220);
  box-shadow: var(--panel-card-shadow, none);
  text-decoration: none;
  color: var(--panel-text, #e8eef7);
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}
/* Light: Keşif kartları gibi panel token — tek :global(...) (scoped sızıntı yok) */
:global(.panel-shell[data-theme="light"] .sa-row) {
  background: var(--panel-card, #ced5e0);
  border-color: var(--panel-card-border);
  box-shadow: none;
  color: var(--panel-text, #0f172a);
}
:global(.panel-shell[data-theme="light"] .sa-row__body strong) {
  color: var(--panel-text, #0f172a);
}
:global(.panel-shell[data-theme="light"] .sa-row__body span),
:global(.panel-shell[data-theme="light"] .sa-row__prog em),
:global(.panel-shell[data-theme="light"] .sa-muted),
:global(.panel-shell[data-theme="light"] .sa-rank),
:global(.panel-shell[data-theme="light"] .sa-row__chev) {
  color: var(--panel-muted, #475569);
}
:global(.panel-shell[data-theme="light"] .sa-badge:not(.sa-badge--plat)) {
  background: var(--panel-icon-bg);
  color: var(--panel-accent, #047857);
}
:global(.panel-shell[data-theme="light"] .sa-bar) {
  background: rgb(15 23 42 / 0.12);
}
.sa-row:hover {
  border-color: color-mix(in srgb, var(--panel-accent, #047857) 45%, transparent);
  transform: translateY(-1px);
}
.sa-row--plat {
  border-color: color-mix(in srgb, #ca8a04 45%, var(--panel-card-border));
}
.sa-row__img {
  width: 120px;
  height: 56px;
  object-fit: cover;
  object-position: center;
  border-radius: 10px;
  background: var(--panel-soft, #07140f);
}
.sa-row__body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.sa-row__body strong {
  color: var(--panel-text, #e8eef7);
  font-size: 0.98rem;
}
.sa-row__body span {
  color: var(--panel-muted, #94a3b8);
  font-size: 0.8rem;
}
.sa-row__prog {
  min-width: 7.5rem;
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}
.sa-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: var(--panel-icon-bg, rgb(105 240 174 / 0.15));
  color: var(--panel-accent, #047857);
  font-size: 0.72rem;
  font-weight: 800;
}
.sa-badge--plat {
  background: linear-gradient(135deg, #f5d76e, #c9a227);
  color: #1a1405;
}
.sa-bar {
  width: 110px;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--panel-muted, #64748b) 22%, transparent);
  overflow: hidden;
}
.sa-bar i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--panel-accent, #69f0ae), #f5d76e);
}
.sa-row__prog em {
  font-style: normal;
  font-size: 0.72rem;
  color: var(--panel-muted, #94a3b8);
}
.sa-muted {
  color: var(--panel-muted, #94a3b8);
  font-size: 0.85rem;
}
.sa-row__chev {
  color: var(--panel-muted, #94a3b8);
}
@media (max-width: 720px) {
  .sa-row {
    grid-template-columns: 2rem 96px 1fr;
  }
  .sa-row__img {
    width: 96px;
    height: 45px;
  }
  .sa-row__prog {
    grid-column: 1 / -1;
    align-items: flex-start;
    text-align: left;
  }
  .sa-row__chev {
    display: none;
  }
}
</style>
