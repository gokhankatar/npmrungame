<script setup lang="ts">
import SteamGameSkeleton from "~/components/panel/SteamGameSkeleton.vue";
import { useAppLocale } from "~/composables/useAppLocale";
import { steamHours, type SteamGame } from "~/composables/useSteamHub";
import {
  advanceSteamCover,
  steamCoverSrc,
} from "~/utils/steamCover";

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
          tx("panel.steam.platinumChip").replace(
            "{n}",
            String(platinumCount)
          )
        }}
      </span>
      <span v-else-if="progressScanning" class="sa-chip sa-chip--scan">
        <v-progress-circular
          indeterminate
          size="14"
          width="2"
          color="#69f0ae"
        />
        {{ tx("panel.steam.platinumScanning") }}
      </span>
    </div>

    <SteamGameSkeleton v-if="loading" :count="8" />

    <ul v-else class="sa-list">
      <li v-for="(g, idx) in rows" :key="g.appId">
        <NuxtLink
          :to="`/dashboard/platforms/steam/games/${g.appId}`"
          class="sa-row"
          :class="{ 'sa-row--plat': getProgress(g.appId)?.isComplete }"
        >
          <span class="sa-rank" aria-hidden="true">#{{ idx + 1 }}</span>
          <img
            :src="steamCoverSrc(g)"
            :alt="g.name"
            class="sa-row__img"
            loading="lazy"
            @error="onCoverError($event, g)"
          />
          <div class="sa-row__body">
            <strong>{{ g.name }}</strong>
            <span>
              {{ steamHours(g.playtimeForeverMin) }}
              {{ tx("panel.steam.hours") }}
            </span>
          </div>
          <div class="sa-row__prog">
            <template
              v-if="
                getProgress(g.appId)?.status === 'ready' &&
                getProgress(g.appId)!.total
              "
            >
              <span
                v-if="getProgress(g.appId)!.isComplete"
                class="sa-badge sa-badge--plat"
              >
                <v-icon icon="mdi-trophy" size="14" />
                {{ tx("panel.steam.platinum") }}
              </span>
              <span v-else class="sa-badge">
                %{{ getProgress(g.appId)!.completionPct }}
              </span>
              <div class="sa-bar">
                <i
                  :style="{
                    width: `${getProgress(g.appId)!.completionPct}%`,
                  }"
                />
              </div>
              <em>
                {{ getProgress(g.appId)!.unlocked }}/{{
                  getProgress(g.appId)!.total
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
}
.sa-search {
  flex: 1 1 220px;
  min-width: 0;
  padding: 0.65rem 0.9rem;
  border-radius: 12px;
  border: 1px solid var(--panel-card-border, rgb(15 23 42 / 0.12));
  background: var(--panel-soft, #c2cad6);
  color: var(--panel-text, #0f172a);
  box-shadow: none;
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
  background: var(--panel-icon-bg, rgb(16 185 129 / 0.1));
  border-color: var(--panel-icon-border, rgb(16 185 129 / 0.28));
  color: var(--panel-accent, #059669);
}
:global(.panel-shell[data-theme="dark"]) .sa-chip {
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
  gap: 0.65rem;
}
.sa-rank {
  display: inline-flex;
  min-width: 2.1rem;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--panel-muted, #94a3b8);
  letter-spacing: 0.02em;
}
.sa-row {
  display: grid;
  grid-template-columns: 2.2rem 160px 1fr auto auto;
  gap: 0.85rem;
  align-items: center;
  padding: 0.55rem 0.75rem 0.55rem 0.55rem;
  border-radius: 14px;
  border: 1px solid rgba(105, 240, 174, 0.12);
  background: linear-gradient(
    180deg,
    rgba(10, 24, 18, 0.95),
    rgba(4, 12, 10, 0.98)
  );
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s ease, transform 0.15s ease;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
}
.sa-row:hover {
  border-color: rgba(105, 240, 174, 0.4);
  transform: translateY(-1px);
}
.sa-row--plat {
  border-color: rgba(245, 215, 110, 0.45);
}
.sa-row__img {
  width: 160px;
  height: 75px;
  object-fit: cover;
  border-radius: 10px;
  background: #07140f;
}
.sa-row__body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.sa-row__body strong {
  color: #eafff2;
  font-size: 0.98rem;
}
.sa-row__body span {
  color: rgba(200, 255, 224, 0.55);
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
  background: rgba(105, 240, 174, 0.15);
  color: #9ff5c0;
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
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}
.sa-bar i {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #69f0ae, #f5d76e);
}
.sa-row__prog em {
  font-style: normal;
  font-size: 0.72rem;
  color: rgba(200, 255, 224, 0.5);
}
.sa-muted {
  color: rgba(200, 255, 224, 0.4);
  font-size: 0.85rem;
}
.sa-row__chev {
  color: rgba(200, 255, 224, 0.45);
}
@media (max-width: 720px) {
  .sa-row {
    grid-template-columns: 2rem 1fr;
  }
  .sa-rank {
    grid-row: 1;
  }
  .sa-row__img {
    grid-column: 1 / -1;
    width: 100%;
    height: auto;
    aspect-ratio: 460 / 215;
  }
  .sa-row__prog {
    align-items: flex-start;
    text-align: left;
  }
}
</style>
