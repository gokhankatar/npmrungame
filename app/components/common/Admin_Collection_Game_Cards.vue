<template>
  <div class="admin-collection-radar-cards w-100">
    <v-row v-if="loading" :dense="display.smAndDown.value">
      <v-col v-for="i in skeletonCount" :key="i" cols="12">
        <v-skeleton-loader
          type="image, article"
          class="rounded-xl upcoming-game-card-skeleton"
        />
      </v-col>
    </v-row>

    <v-row v-else :dense="display.smAndDown.value">
      <v-col v-for="(item, index) in arr" :key="item.firestoreId ?? index" cols="12">
        <article
          class="upcoming-game-card admin-collection-radar-card"
          :class="{
            'admin-bulk-card-selected': bulkDeleteMode && isItemSelected(item),
            'cursor-pointer': true,
          }"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @click="handleCardClick(item)"
        >
          <div class="upcoming-game-card__media">
            <v-img
              v-if="item.background_image"
              :src="item.background_image"
              :alt="item.name"
              cover
              class="upcoming-game-card__img"
            />
            <div v-else class="upcoming-game-card__img upcoming-game-card__img--empty">
              <v-icon
                icon="mdi-gamepad-variant-outline"
                size="40"
                color="rgba(255,255,255,0.3)"
              />
            </div>
            <div class="upcoming-game-card__media-overlay" aria-hidden="true" />

            <div
              v-if="bulkDeleteMode"
              class="admin-collection-radar-card__check"
              aria-hidden="true"
            >
              <v-icon
                :icon="isItemSelected(item) ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'"
                :color="isItemSelected(item) ? 'success' : 'grey-lighten-1'"
                size="22"
              />
            </div>
          </div>

          <div class="upcoming-game-card__body">
            <div class="d-flex align-start justify-space-between ga-2 mb-2">
              <div class="upcoming-date-pill">
                <span class="upcoming-date-pill__day">{{ yearParts(item).day }}</span>
                <span class="upcoming-date-pill__month">{{ yearParts(item).month }}</span>
                <span class="upcoming-date-pill__year">{{ yearParts(item).year }}</span>
              </div>

              <div
                v-if="!bulkDeleteMode"
                class="d-flex align-center ga-1 flex-shrink-0"
                @click.stop
              >
                <v-btn
                  v-if="onCompleteClick"
                  icon="mdi-check-circle-outline"
                  size="small"
                  variant="outlined"
                  color="success"
                  :ripple="false"
                  aria-label="Tamamladım"
                  @click="onCompleteClick(item)"
                />
                <v-btn
                  v-if="onDeleteClick"
                  icon="mdi-delete-outline"
                  size="small"
                  variant="outlined"
                  color="error"
                  :ripple="false"
                  aria-label="Sil"
                  @click="onDeleteClick(item)"
                />
              </div>
            </div>

            <h3 class="upcoming-game-card__title default-title-letter">
              {{ item.name }}
            </h3>
            <p class="upcoming-game-card__date default-title-letter">
              {{ metaLine(item) }}
            </p>

            <div class="d-flex flex-wrap align-center ga-2 mt-2">
              <v-chip
                v-if="item.metacritic"
                size="small"
                variant="tonal"
                class="default-title-letter"
                :color="useMetacriticStyle(item.metacritic).color"
                :text="String(item.metacritic)"
              />
              <v-chip
                v-if="item.playtime"
                size="small"
                variant="tonal"
                color="grey-lighten-1"
                class="default-title-letter"
                prepend-icon="mdi-timer-outline"
                :text="`${item.playtime} saat`"
              />
              <template
                v-for="icon in getUniquePlatformIcons(item.platforms)?.slice(0, 4)"
                :key="icon"
              >
                <v-icon
                  v-if="icon"
                  size="small"
                  color="grey-lighten-1"
                  :icon="icon"
                />
              </template>
            </div>
          </div>
        </article>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import {
  getUniquePlatformIcons,
  useMetacriticStyle,
} from "~/composables/data/handleData";

const props = withDefaults(
  defineProps<{
    arr: any[];
    loading?: boolean;
    onRowClick?: (item: any) => void;
    onDeleteClick?: (item: any) => void;
    onCompleteClick?: (item: any) => void;
    bulkDeleteMode?: boolean;
    isSelected?: (item: any) => boolean;
    onToggleSelect?: (item: any) => void;
    skeletonCount?: number;
  }>(),
  {
    loading: false,
    skeletonCount: 3,
  }
);

const display = useDisplay();

const isItemSelected = (item: any) => props.isSelected?.(item) ?? false;

const handleCardClick = (item: any) => {
  if (props.bulkDeleteMode) {
    props.onToggleSelect?.(item);
    return;
  }
  props.onRowClick?.(item);
};

const yearParts = (item: any) => {
  const d = item?.released ? new Date(item.released) : null;
  if (!d || Number.isNaN(d.getTime())) {
    return { day: "—", month: "", year: "N/A" };
  }
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: d.toLocaleDateString("tr-TR", { month: "short" }).toUpperCase(),
    year: String(d.getFullYear()),
  };
};

const metaLine = (item: any) => {
  const year = item?.released
    ? new Date(item.released).getFullYear()
    : null;
  const genres = (item?.genres ?? [])
    .slice(0, 3)
    .map((g: any) => g.name)
    .filter(Boolean)
    .join(" · ");
  if (year && genres) return `${year} · ${genres}`;
  if (year) return String(year);
  return genres || "Detay için tıkla";
};
</script>

<style src="~/assets/css/admin_collection_radar_cards.css"></style>

<style scoped>
.admin-collection-radar-card__check {
  position: absolute;
  top: 0.65rem;
  left: 0.65rem;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.admin-bulk-card-selected {
  border-color: rgba(105, 240, 174, 0.55) !important;
  box-shadow: 0 0 0 1px rgba(105, 240, 174, 0.35), 0 12px 36px rgba(0, 0, 0, 0.4);
}
</style>
