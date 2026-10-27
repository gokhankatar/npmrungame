<template>
  <div class="panel-radar">
    <div v-if="loading" class="panel-radar__skeletons">
      <div v-for="i in skeletonCount" :key="i" class="panel-radar__skel" />
    </div>

    <article
      v-for="(item, index) in arr"
      v-else
      :key="item.firestoreId ?? item.id ?? index"
      class="panel-radar__card"
      :class="{
        'panel-radar__card--selected':
          bulkDeleteMode && isItemSelected(item),
        'panel-radar__card--selectable': bulkDeleteMode,
      }"
      :style="{ animationDelay: `${index * 0.05}s` }"
      @click="onCardClick(item)"
    >
      <div class="panel-radar__media">
        <img
          :src="resolveGameCardImage(item)"
          :alt="item.name"
          class="panel-radar__img"
          loading="lazy"
        />
        <div class="panel-radar__media-fade" aria-hidden="true" />
        <div
          v-if="bulkDeleteMode"
          class="panel-radar__check"
          aria-hidden="true"
        >
          <v-icon
            :icon="
              isItemSelected(item)
                ? 'mdi-checkbox-marked'
                : 'mdi-checkbox-blank-outline'
            "
            :color="isItemSelected(item) ? 'success' : 'grey-lighten-1'"
            size="22"
          />
        </div>
        <button
          v-if="onDeleteClick && !bulkDeleteMode"
          type="button"
          class="panel-radar__remove"
          title="Kaldır"
          aria-label="Kaldır"
          @click.stop="onDeleteClick(item)"
        >
          <v-icon icon="mdi-trash-can-outline" size="18" />
        </button>
      </div>

      <div class="panel-radar__body">
        <div class="panel-radar__top">
          <div v-if="dateParts(item)" class="panel-radar__pill">
            <span class="panel-radar__pill-day">{{ dateParts(item)!.day }}</span>
            <span class="panel-radar__pill-month">{{ dateParts(item)!.month }}</span>
            <span class="panel-radar__pill-year">{{ dateParts(item)!.year }}</span>
          </div>
          <div v-else class="panel-radar__pill panel-radar__pill--tba">
            <span>TBA</span>
          </div>
        </div>

        <h3 class="panel-radar__title">{{ item.name }}</h3>

        <p class="panel-radar__date-line">
          <v-icon icon="mdi-calendar" size="14" />
          {{ fullDateLabel(item) }}
        </p>

        <div v-if="genreLabels(item).length" class="panel-radar__meta">
          <span
            v-for="g in genreLabels(item)"
            :key="g"
            class="panel-radar__tag"
          >
            {{ g }}
          </span>
        </div>

        <div
          v-if="platformIcons(item).length"
          class="panel-radar__platforms"
        >
          <v-icon
            v-for="icon in platformIcons(item)"
            :key="icon"
            :icon="icon"
            size="18"
          />
        </div>
      </div>

      <div
        v-if="livePartsFor(item)"
        class="panel-radar__eta panel-radar__eta--live"
      >
        <strong class="panel-radar__eta-live">
          {{
            pad2(
              livePartsFor(item)!.days * 24 + livePartsFor(item)!.hours
            )
          }}:{{ pad2(livePartsFor(item)!.minutes) }}:{{
            pad2(livePartsFor(item)!.seconds)
          }}
        </strong>
      </div>
      <div
        v-else-if="countdownHeadline(item)"
        class="panel-radar__eta"
        :class="`panel-radar__eta--${countdownTone(item)}`"
      >
        <strong class="panel-radar__eta-value">
          {{ countdownHeadline(item)!.value }}
        </strong>
        <span class="panel-radar__eta-unit">
          {{ countdownHeadline(item)!.unit }}
        </span>
      </div>
    </article>
  </div>
</template>

<script lang="ts" setup>
import {
  formatGameGenreLabels,
  getUniquePlatformIcons,
  resolveGameCardImage,
} from "~/composables/data/handleData";
import { useSharedCountdownClock } from "~/composables/useLiveReleaseCountdown";
import {
  formatReleaseDate,
  getCountdownHeadline,
  getDateParts,
  getLiveCountdownParts,
  pad2,
  resolveGameReleaseIso,
  shouldShowLiveReleaseCountdown,
} from "~/utils/upcomingGames";

const props = withDefaults(
  defineProps<{
    arr: any[];
    loading?: boolean;
    onDeleteClick?: (item: any) => void;
    skeletonCount?: number;
    bulkDeleteMode?: boolean;
    isSelected?: (item: any) => boolean;
    onToggleSelect?: (item: any) => void;
  }>(),
  {
    loading: false,
    skeletonCount: 4,
    bulkDeleteMode: false,
  }
);

const isItemSelected = (item: any) => props.isSelected?.(item) ?? false;

const onCardClick = (item: any) => {
  if (props.bulkDeleteMode) {
    props.onToggleSelect?.(item);
  }
};

const anyLiveSoon = computed(() =>
  props.arr.some((item) => {
    const iso = resolveGameReleaseIso(item);
    return iso ? shouldShowLiveReleaseCountdown(iso) : false;
  })
);

const { now } = useSharedCountdownClock(anyLiveSoon);

const releaseIso = (item: any) => resolveGameReleaseIso(item);

const dateParts = (item: any) => {
  const iso = releaseIso(item);
  return iso ? getDateParts(iso) : null;
};

const livePartsFor = (item: any) => {
  const iso = releaseIso(item);
  if (!iso) return null;
  const at = new Date(now.value);
  if (!shouldShowLiveReleaseCountdown(iso, at)) return null;
  return getLiveCountdownParts(iso, at);
};

const countdownHeadline = (item: any) => {
  const iso = releaseIso(item);
  return iso ? getCountdownHeadline(iso) : null;
};

const countdownTone = (item: any): "soon" | "mid" | "far" | "past" => {
  const iso = releaseIso(item);
  if (!iso) return "far";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const release = new Date(iso);
  release.setHours(0, 0, 0, 0);
  const diff = Math.round((release.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return "past";
  if (diff <= 7) return "soon";
  if (diff <= 30) return "mid";
  return "far";
};

const fullDateLabel = (item: any) => {
  const iso = releaseIso(item);
  if (!iso) return "Çıkış tarihi belli değil (TBA)";
  return formatReleaseDate(iso);
};

const genreLabels = (item: any) => {
  const line = formatGameGenreLabels(item.genres, 3);
  return line ? line.split(" - ").filter(Boolean) : [];
};

const platformIcons = (item: any) =>
  (getUniquePlatformIcons(item.platforms) ?? []).filter(Boolean).slice(0, 5);
</script>

<style scoped>
.panel-radar {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  width: 100%;
}

.panel-radar__skeletons {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.panel-radar__skel {
  height: 9.5rem;
  border-radius: 1.1rem;
  background: linear-gradient(
    110deg,
    var(--panel-card, #0c1220) 25%,
    rgb(255 255 255 / 0.06) 45%,
    var(--panel-card, #0c1220) 65%
  );
  background-size: 200% 100%;
  animation: panelRadarShine 1.3s ease-in-out infinite;
  border: 1px solid var(--panel-border, rgb(255 255 255 / 0.08));
}

@keyframes panelRadarShine {
  0% {
    background-position: 120% 0;
  }
  100% {
    background-position: -80% 0;
  }
}

.panel-radar__card {
  display: grid;
  grid-template-columns: minmax(9rem, 12.5rem) minmax(0, 1fr);
  align-items: stretch;
  overflow: hidden;
  border-radius: 1.15rem;
  border: 1px solid var(--panel-card-border, rgb(255 255 255 / 0.1));
  background: var(--panel-card, #0c1220);
  box-shadow: var(--panel-card-shadow, 0 8px 24px rgb(0 0 0 / 0.22));
  animation: panelRadarIn 0.4s ease forwards;
  opacity: 0;
}

.panel-radar__card:has(.panel-radar__eta) {
  grid-template-columns: minmax(9rem, 12.5rem) minmax(0, 1fr) minmax(6.5rem, 8.5rem);
}

@keyframes panelRadarIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (min-width: 720px) {
  .panel-radar__card {
    grid-template-columns: minmax(14rem, 18rem) minmax(0, 1fr);
  }

  .panel-radar__card:has(.panel-radar__eta) {
    grid-template-columns: minmax(14rem, 18rem) minmax(0, 1fr) minmax(7.5rem, 10rem);
  }
}

.panel-radar__card:hover {
  border-color: rgb(105 240 174 / 0.35);
  box-shadow:
    0 14px 36px rgb(0 0 0 / 0.28),
    0 0 0 1px rgb(105 240 174 / 0.12);
}

.panel-radar__card--selectable {
  cursor: pointer;
}

.panel-radar__card--selected {
  border-color: rgba(105, 240, 174, 0.85);
  box-shadow:
    0 0 0 1px rgba(105, 240, 174, 0.35),
    0 14px 36px rgb(0 0 0 / 0.28);
}

.panel-radar__check {
  position: absolute;
  top: 0.55rem;
  left: 0.55rem;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 0.45rem;
  background: rgba(8, 12, 18, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(6px);
}

.panel-radar__media {
  position: relative;
  align-self: stretch;
  min-height: 10.5rem;
  overflow: hidden;
  background: #0a0e14;
}

.panel-radar__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
}

.panel-radar__media-fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 35%,
    var(--panel-card, #0c1220) 100%
  );
  pointer-events: none;
}

.panel-radar__body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.4rem;
  min-width: 0;
  padding: 0.95rem 1.05rem 1.05rem;
}

.panel-radar__top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.panel-radar__eta {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  min-height: 100%;
  padding: 1rem 0.85rem;
  text-align: center;
  line-height: 1;
  background: rgb(255 255 255 / 0.04);
  border-left: 1px solid var(--panel-border, rgb(255 255 255 / 0.1));
}

.panel-radar__eta-value {
  font-size: clamp(2.15rem, 4.8vw, 3.1rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  color: var(--panel-text, #e8eef7);
}

.panel-radar__eta-unit {
  margin-top: 0.55rem;
  max-width: 6.5rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--panel-muted, #94a3b8);
}

.panel-radar__eta--soon {
  background: rgb(255 171 64 / 0.14);
  border-color: rgb(255 171 64 / 0.4);
}

.panel-radar__eta--soon .panel-radar__eta-value {
  color: #ffb74d;
}

.panel-radar__eta--soon .panel-radar__eta-unit {
  color: #ffcc80;
}

.panel-radar__eta--mid {
  background: rgb(105 240 174 / 0.1);
  border-color: rgb(105 240 174 / 0.32);
}

.panel-radar__eta--mid .panel-radar__eta-value {
  color: var(--panel-accent, #69f0ae);
}

.panel-radar__eta--mid .panel-radar__eta-unit {
  color: #a7f3d0;
}

.panel-radar__eta--far .panel-radar__eta-value {
  color: #cbd5e1;
}

.panel-radar__eta--past {
  opacity: 0.75;
}

.panel-radar__eta--live {
  background: rgb(255 171 64 / 0.14);
  border-color: rgb(255 171 64 / 0.42);
}

.panel-radar__eta-live {
  font-size: clamp(1.05rem, 2.4vw, 1.45rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: #ffb74d;
  white-space: nowrap;
}

.panel-radar__eta--live .panel-radar__eta-unit {
  color: #ffcc80;
}

.panel-radar__pill {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 3.1rem;
  padding: 0.3rem 0.45rem;
  border-radius: 0.65rem;
  background: rgb(105 240 174 / 0.12);
  border: 1px solid rgb(105 240 174 / 0.28);
  color: var(--panel-accent, #69f0ae);
  line-height: 1.05;
}

.panel-radar__pill--tba {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--panel-muted, #94a3b8);
  background: var(--panel-soft, rgb(0 0 0 / 0.25));
  border-color: var(--panel-border, rgb(255 255 255 / 0.1));
}

.panel-radar__pill-day {
  font-size: 1rem;
  font-weight: 800;
}

.panel-radar__pill-month {
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.85;
}

.panel-radar__pill-year {
  font-size: 0.58rem;
  font-weight: 700;
  opacity: 0.7;
}

.panel-radar__remove {
  position: absolute;
  top: 0.55rem;
  left: 0.55rem;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 0.65rem;
  border: 1px solid rgb(255 255 255 / 0.18);
  background: rgb(0 0 0 / 0.55);
  color: #fff;
  cursor: pointer;
  opacity: 0;
  transform: translateY(-4px);
  pointer-events: none;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease,
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.panel-radar__card:hover .panel-radar__remove,
.panel-radar__card:focus-within .panel-radar__remove,
.panel-radar__media:hover .panel-radar__remove {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}

.panel-radar__remove:hover {
  color: #fecaca;
  border-color: rgb(248 113 113 / 0.55);
  background: rgb(239 68 68 / 0.55);
}

.panel-radar__title {
  margin: 0;
  font-size: clamp(1rem, 2.2vw, 1.25rem);
  font-weight: 800;
  line-height: 1.25;
  color: var(--panel-text, #e8eef7);
}

.panel-radar__date-line {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--panel-muted, #94a3b8);
}

.panel-radar__meta,
.panel-radar__platforms {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.panel-radar__platforms {
  color: var(--panel-muted, #94a3b8);
}

.panel-radar__tag {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: lowercase;
  color: var(--panel-text, #e8eef7);
  background: var(--panel-soft, rgb(0 0 0 / 0.28));
  border: 1px solid var(--panel-border, rgb(255 255 255 / 0.08));
}

@media (max-width: 599px) {
  .panel-radar__card {
    grid-template-columns: 1fr;
  }

  .panel-radar__eta {
    min-height: 5.5rem;
    border-left: 0;
    border-top: 1px solid var(--panel-border, rgb(255 255 255 / 0.1));
  }

  .panel-radar__media {
    min-height: 11rem;
    aspect-ratio: 16 / 9;
  }

  .panel-radar__media-fade {
    background: linear-gradient(
      to top,
      var(--panel-card, #0c1220) 0%,
      transparent 55%
    );
  }

  .panel-radar__remove {
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }
}
</style>
