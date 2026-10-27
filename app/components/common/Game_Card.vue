<template>
  <v-row :dense="display.smAndDown.value" class="game-card-row">
    <!-- Skeleton: gerçek kartla aynı grid + 2:3 oran -->
    <template v-if="loading">
      <v-col
        v-for="i in skeletonCount"
        :key="`game-skel-${i}`"
        :cols="gridCols"
        :sm="gridSm"
        :md="gridMd"
        :lg="gridLg"
        :xl="gridXl"
      >
        <div class="game-card-skeleton" aria-hidden="true">
          <span class="game-card-skeleton__shine" />
          <span class="game-card-skeleton__meta">
            <i />
            <i />
          </span>
        </div>
      </v-col>
    </template>

    <template v-else>
    <v-col
      v-for="(item, index) of arr"
      :key="item.firestoreId ?? index"
      :cols="gridCols"
      :sm="gridSm"
      :md="gridMd"
      :lg="gridLg"
      :xl="gridXl"
    >
      <v-card
        class="game-card game-card--steam bg-transparent rounded-lg transition"
        :class="{
          'cursor-pointer': true,
          'admin-bulk-card-selected': bulkDeleteMode && isItemSelected(item),
        }"
        :style="{ animationDelay: `${index * 0.06}s` }"
        :ripple="false"
        @click="handleCardClick(item)"
      >
        <div class="game-card-image-wrapper">
          <v-img
            :src="resolveGameCardImage(item)"
            class="game-card-img"
            cover
            position="center center"
          />
          <div class="game-card-overlay" aria-hidden="true" />

          <div
            v-if="bulkDeleteMode"
            class="game-card-bulk-check"
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

          <div
            v-if="showPlayingActions && !bulkDeleteMode"
            class="game-card-actions"
            @click.stop
          >
            <button
              type="button"
              class="game-card-actions__btn game-card-actions__btn--done"
              @click.stop="emitComplete(item)"
            >
              <v-icon icon="mdi-check-circle" size="18" />
              Tamamladım
            </button>
            <button
              type="button"
              class="game-card-actions__btn game-card-actions__btn--remove"
              @click.stop="emitRemove(item)"
            >
              <v-icon icon="mdi-trash-can-outline" size="18" />
              Kaldır
            </button>
          </div>

          <template v-if="!display.xs.value">
            <v-tooltip text="Toplam oynama süresi (Ana Hikaye)" location="top">
              <template #activator="{ props: tipProps }">
                <v-chip
                  v-if="item.playtime"
                  v-bind="tipProps"
                  class="playtime-icon rounded-pill ma-1"
                  :ripple="false"
                  size="x-small"
                  variant="elevated"
                  prepend-icon="mdi-timer-outline"
                  color="black"
                  :text="`${item.playtime} saat`"
                />
              </template>
            </v-tooltip>

            <div v-if="metacriticBadge(item)" class="metacritic-point">
              <v-tooltip text="Metacritic puanı" location="top">
                <template #activator="{ props: tipProps }">
                  <span
                    v-bind="tipProps"
                    class="mc-badge"
                    :class="{ 'mc-badge--hot': metacriticBadge(item)!.value >= 90 }"
                    :style="{
                      background: metacriticBadge(item)!.bg,
                      color: metacriticBadge(item)!.fg,
                    }"
                    :aria-label="`Metacritic ${metacriticBadge(item)!.value}`"
                  >
                    <img
                      v-if="metacriticBadge(item)!.value >= 90"
                      :src="fireAnimation"
                      alt=""
                      class="mc-badge__fire"
                    />
                    {{ metacriticBadge(item)!.value }}
                  </span>
                </template>
              </v-tooltip>
              <v-tooltip
                v-if="item.recommender_name"
                :text="`${item.recommender_name} önerdi`"
                location="top"
              >
                <template #activator="{ props: tipProps }">
                  <v-icon
                    v-bind="tipProps"
                    class="recommende-icon"
                    size="x-small"
                    color="deep-purple"
                    icon="mdi-thumb-up"
                  />
                </template>
              </v-tooltip>
            </div>
          </template>

          <div class="game-card-info">
            <div class="game-card-info__top">
              <p
                class="game-card-title default-title-letter font-weight-medium"
                :class="display.xs.value ? 'extra-small-text' : 'text-caption'"
              >
                {{ truncateText(item.name, display.xs.value ? 22 : 28) }}
              </p>
              <span
                v-if="display.xs.value && metacriticBadge(item)"
                class="mc-badge mc-badge--inline"
                :style="{
                  background: metacriticBadge(item)!.bg,
                  color: metacriticBadge(item)!.fg,
                }"
              >
                {{ metacriticBadge(item)!.value }}
              </span>
            </div>
            <div class="d-flex align-center ga-2 flex-wrap">
              <p
                class="text-caption text-grey-lighten-1 game-card-meta mb-0"
                :class="{ 'game-card-meta--genres': props.metaFormat === 'year-genres' }"
              >
                {{
                  props.metaFormat === "year-genres"
                    ? formatGameYearAndGenres(item)
                    : formatGameReleaseYear(item)
                }}
              </p>
            </div>

            <div class="game-card-hover-details d-flex flex-wrap align-center ga-1 mt-1">
              <template v-for="icon in getUniquePlatformIcons(item.platforms)" :key="icon">
                <v-icon v-if="icon" size="x-small" color="grey-lighten-1" :icon="icon" />
              </template>
              <template v-if="props.metaFormat !== 'year-genres'">
                <v-chip
                  v-for="(genre, index) in item.genres?.slice(0, 2)"
                  :key="index"
                  size="x-small"
                  variant="tonal"
                  :ripple="false"
                  :text="truncateText(genre.name, 10)"
                />
              </template>
            </div>
          </div>
        </div>
      </v-card>
    </v-col>
    </template>
  </v-row>
</template>

<script lang="ts" setup>
import fireAnimationSrc from "~/assets/img/fire_anim.gif";
import { truncateText } from "~/composables/core/basicFunc";
import {
  formatGameReleaseYear,
  formatGameYearAndGenres,
  getMetacriticBadge,
  getUniquePlatformIcons,
  resolveGameCardImage,
} from "~/composables/data/handleData";

const props = withDefaults(
  defineProps<{
    arr: any[];
    loading: boolean;
    onRowClick: (item: any) => void;
    bulkDeleteMode?: boolean;
    isSelected?: (item: any) => boolean;
    onToggleSelect?: (item: any) => void;
    /** default | comfortable | admin-grid: geniş panelde daha çok sütun */
    density?: "default" | "comfortable" | "admin-grid";
    /** year: sadece yıl | year-genres: "2026 · aksiyon - nişancı - indie" */
    metaFormat?: "year" | "year-genres";
    /** Hover’da Tamamladım / Kaldır overlay (şu an oynadıklarım) */
    showPlayingActions?: boolean;
    onCompleteClick?: (item: any) => void;
    onRemoveClick?: (item: any) => void;
  }>(),
  { density: "default", metaFormat: "year", showPlayingActions: false }
);

const emitComplete = (item: any) => props.onCompleteClick?.(item);
const emitRemove = (item: any) => props.onRemoveClick?.(item);

/** Steam library tarzı: büyük ekranda daha çok sütun → kartlar şişmez */
const gridCols = computed(() => 6);
const gridSm = computed(() => {
  if (props.density === "admin-grid") return 6;
  return 4;
});
const gridMd = computed(() => {
  if (props.density === "admin-grid") return 4;
  return 3;
});
const gridLg = computed(() => {
  if (props.density === "admin-grid") return 2;
  if (props.density === "comfortable") return 2;
  return 3;
});
const gridXl = computed(() => 2);

const display = useDisplay();
const fireAnimation = fireAnimationSrc;

/** Gerçek grid ile aynı satır doluluğu (xl’de 6 sütun → 12 placeholder) */
const skeletonCount = computed(() => {
  if (display.xlAndUp.value) return 12;
  if (display.lgAndUp.value) return props.density === "default" ? 8 : 12;
  if (display.mdAndUp.value) return 8;
  if (display.smAndUp.value) return 6;
  return 4;
});

const metacriticBadge = (item: any) => getMetacriticBadge(item?.metacritic);

const isItemSelected = (item: any) => props.isSelected?.(item) ?? false;

const handleCardClick = (item: any) => {
  if (props.bulkDeleteMode) {
    props.onToggleSelect?.(item);
    return;
  }
  props.onRowClick(item);
};
</script>

<style scoped>
.game-card {
  position: relative;
  overflow: hidden;
  width: 100%;
  border-radius: 10px !important;
  background: #0e1218 !important;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.game-card::before {
  display: none;
}

.game-card-image-wrapper {
  position: relative;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  border-radius: 10px;
  background: #0a0e14;
}

.game-card-image-wrapper::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.15) 0%,
    transparent 28%,
    transparent 48%,
    rgba(0, 0, 0, 0.55) 72%,
    rgba(0, 0, 0, 0.92) 100%
  );
}

.game-card .game-card-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.game-card .game-card-img :deep(img),
.game-card .game-card-img :deep(.v-img__img) {
  object-fit: cover !important;
  object-position: center center !important;
}

.game-card-skeleton {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(145deg, #1a222c 0%, #12171e 55%, #0e1319 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.28);
}

.game-card-skeleton__shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 25%,
    rgba(255, 255, 255, 0.07) 45%,
    transparent 65%
  );
  background-size: 200% 100%;
  animation: gameCardSkeletonShine 1.35s ease-in-out infinite;
}

.game-card-skeleton__meta {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 12px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.game-card-skeleton__meta i {
  display: block;
  height: 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
}

.game-card-skeleton__meta i:first-child {
  width: 72%;
}

.game-card-skeleton__meta i:last-child {
  width: 38%;
  height: 0.55rem;
  opacity: 0.75;
}

@keyframes gameCardSkeletonShine {
  0% {
    background-position: 120% 0;
  }
  100% {
    background-position: -80% 0;
  }
}

html.dark .game-card-skeleton,
.v-theme--dark .game-card-skeleton {
  background: linear-gradient(145deg, #1a222c 0%, #12171e 55%, #0e1319 100%);
}

:global(html:not(.dark)) .game-card-skeleton {
  background: linear-gradient(145deg, #e8eef2 0%, #d8e0e6 55%, #cfd8df 100%);
  border-color: rgba(15, 23, 42, 0.08);
}

:global(html:not(.dark)) .game-card-skeleton__shine {
  background: linear-gradient(
    110deg,
    transparent 25%,
    rgba(255, 255, 255, 0.55) 45%,
    transparent 65%
  );
  background-size: 200% 100%;
}

:global(html:not(.dark)) .game-card-skeleton__meta i {
  background: rgba(15, 23, 42, 0.12);
}

.game-card-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  padding: 10px 10px 11px !important;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  backdrop-filter: none !important;
}

.game-card-info__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.4rem;
}

.game-card-title {
  margin: 0;
  line-height: 1.25;
  color: #fff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-width: 0;
  flex: 1;
}

.game-card-meta--genres {
  line-height: 1.35;
  text-transform: lowercase;
}

.game-card-hover-details {
  opacity: 0;
  max-height: 0;
  transition: opacity 0.25s ease, max-height 0.25s ease;
  overflow: hidden;
}

.game-card:hover .game-card-hover-details {
  opacity: 1;
  max-height: 56px;
}

/* Oynama aksiyonları varken alt genre şeridini gizle */
.game-card:has(.game-card-actions):hover .game-card-hover-details {
  opacity: 0;
  max-height: 0;
}

.game-card-actions {
  position: absolute;
  inset: 0;
  z-index: 12;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.85rem;
  border-radius: inherit;
  background: rgb(7 11 20 / 0.42);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.game-card:hover .game-card-actions,
.game-card:focus-within .game-card-actions {
  opacity: 1;
  pointer-events: auto;
}

.game-card-actions__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  width: min(100%, 10.5rem);
  min-height: 2.35rem;
  padding: 0.45rem 0.85rem;
  border-radius: 0.75rem;
  border: 1px solid transparent;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  cursor: pointer;
  transform: translateY(6px);
  transition:
    transform 0.2s ease,
    background 0.15s ease,
    border-color 0.15s ease,
    filter 0.15s ease;
}

.game-card:hover .game-card-actions__btn,
.game-card:focus-within .game-card-actions__btn {
  transform: translateY(0);
}

.game-card-actions__btn--done {
  background: #69f0ae;
  color: #07140f;
  box-shadow: 0 8px 20px rgb(105 240 174 / 0.28);
}

.game-card-actions__btn--done:hover {
  filter: brightness(1.06);
}

.game-card-actions__btn--remove {
  background: rgb(15 23 42 / 0.72);
  color: #f8fafc;
  border-color: rgb(255 255 255 / 0.18);
}

.game-card-actions__btn--remove:hover {
  background: rgb(239 68 68 / 0.22);
  border-color: rgb(248 113 113 / 0.55);
  color: #fecaca;
}

/* Metacritic — resmi kutu, hover’da kare border yok */
.metacritic-point {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  border: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  background: transparent !important;
  transform: none !important;
}

.mc-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.35rem;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.45);
  border: none;
  user-select: none;
  pointer-events: auto;
}

.mc-badge--inline {
  min-width: 1.65rem;
  height: 1.65rem;
  font-size: 0.7rem;
  flex-shrink: 0;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
}

.mc-badge--hot {
  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.45),
    0 0 12px rgba(102, 204, 51, 0.35);
}

.mc-badge__fire {
  width: 12px;
  height: 12px;
  object-fit: contain;
}

.admin-bulk-card-selected {
  outline: 2px solid rgba(105, 240, 174, 0.85);
  outline-offset: 2px;
  box-shadow: 0 0 20px rgba(105, 240, 174, 0.15);
}

.game-card-bulk-check {
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

@media (max-width: 599px) {
  .game-card:hover .game-card-hover-details {
    opacity: 0;
    max-height: 0;
  }

  .game-card:hover {
    transform: none !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35) !important;
  }

  .game-card:hover .game-card-img {
    transform: none !important;
  }

  .game-card:hover .game-card-overlay {
    opacity: 0 !important;
  }

  .game-card:hover .metacritic-point,
  .game-card:hover .playtime-icon {
    transform: none !important;
  }

  /* Mobilde hover yok — aksiyonlar hafif görünür kalsın */
  .game-card-actions {
    opacity: 1;
    pointer-events: auto;
    background: linear-gradient(
      to top,
      rgb(7 11 20 / 0.88) 0%,
      rgb(7 11 20 / 0.35) 55%,
      transparent 100%
    );
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    justify-content: flex-end;
    padding-bottom: 0.75rem;
  }

  .game-card-actions__btn {
    transform: none;
    min-height: 2.1rem;
    font-size: 0.72rem;
  }
}
</style>
