<template>
  <v-row :dense="display.smAndDown.value" class="game-card-row">
    <v-col
      v-for="(item, index) of arr"
      :key="item.firestoreId ?? index"
      :cols="gridCols"
      :sm="gridSm"
      :md="gridMd"
      :lg="gridLg"
      :xl="gridXl"
    >
      <v-skeleton-loader
        v-if="loading"
        type="image"
        class="rounded-lg game-card-skeleton"
      />

      <v-card
        v-if="!loading"
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
            :src="item.background_image ?? 'https://f4.bcbits.com/img/0016409163_71.jpg'"
            class="game-card-img"
            cover
            position="center top"
          />
          <div class="game-card-overlay" aria-hidden="true" />

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
            <div class="metacritic-point d-flex align-center ga-1 ma-1">
              <v-tooltip text="Metacritic puanı" location="top">
                <template #activator="{ props: tipProps }">
                  <v-chip
                    v-if="item.metacritic"
                    v-bind="tipProps"
                    class="rounded-pill"
                    :ripple="false"
                    size="x-small"
                    :prepend-icon="item.metacritic < 90 ? 'mdi-star-outline' : ''"
                    :prepend-avatar="item.metacritic >= 90 ? fireAnimation : ''"
                    variant="elevated"
                    :color="useMetacriticStyle(item.metacritic).color"
                    :text="String(item.metacritic)"
                  />
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
            <p
              class="game-card-title default-title-letter font-weight-medium"
              :class="display.xs.value ? 'extra-small-text' : 'text-caption'"
            >
              {{ truncateText(item.name, display.xs.value ? 22 : 28) }}
            </p>
            <div class="d-flex align-center ga-2 flex-wrap">
              <p
                class="text-caption text-grey-lighten-1 game-card-meta mb-0"
                :class="{ 'game-card-meta--genres': props.metaFormat === 'year-genres' }"
              >
                {{
                  props.metaFormat === "year-genres"
                    ? formatGameYearAndGenres(item)
                    : item.released
                      ? new Date(item.released).getFullYear()
                      : "—"
                }}
              </p>
              <template v-if="display.xs.value">
                <v-chip
                  v-if="item.metacritic"
                  size="x-small"
                  variant="tonal"
                  :ripple="false"
                  :color="useMetacriticStyle(item.metacritic).color"
                  :text="String(item.metacritic)"
                />
              </template>
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
  </v-row>
</template>

<script lang="ts" setup>
import fireAnimationSrc from "~/assets/img/fire_anim.gif";
import { truncateText } from "~/composables/core/basicFunc";
import {
  formatGameYearAndGenres,
  getUniquePlatformIcons,
  useMetacriticStyle,
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
  }>(),
  { density: "default", metaFormat: "year" }
);

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

.game-card-skeleton {
  aspect-ratio: 2 / 3;
  width: 100%;
  border-radius: 10px;
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

.game-card-title {
  margin: 0;
  line-height: 1.25;
  color: #fff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

.admin-bulk-card-selected {
  outline: 2px solid rgba(105, 240, 174, 0.85);
  outline-offset: 2px;
  box-shadow: 0 0 20px rgba(105, 240, 174, 0.15);
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
}
</style>
