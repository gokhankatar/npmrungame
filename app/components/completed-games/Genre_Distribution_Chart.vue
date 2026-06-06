<template>
  <div class="genre-chart-layout">
    <aside class="genre-chart-aside">
      <p class="genre-chart-aside-title default-title-letter">Öne çıkanlar</p>
      <div
        v-for="(genre, index) in topThreeGenres"
        :key="genre.name"
        class="genre-chart-rank-card"
        :class="`genre-chart-rank-card--${index}`"
      >
        <span class="genre-chart-rank-badge">{{ index + 1 }}</span>
        <div class="genre-chart-rank-body">
          <span class="genre-chart-rank-name text-truncate">{{ genre.name }}</span>
          <span class="genre-chart-rank-meta">{{ genre.count }} oyun · {{ genre.shareOfLibrary }}%</span>
          <div class="genre-chart-rank-track">
            <div
              class="genre-chart-rank-fill"
              :style="{ width: `${genre.shareOfLibrary}%` }"
            />
          </div>
        </div>
      </div>

      <div class="genre-chart-summary">
        <div class="genre-chart-summary-item">
          <v-icon icon="mdi-shape-outline" size="18" color="#69f0ae" />
          <span>{{ uniqueGenres }} farklı tür</span>
        </div>
        <div class="genre-chart-summary-item">
          <v-icon icon="mdi-bookshelf" size="18" color="#69f0ae" />
          <span>{{ totalGames }} oyun analiz edildi</span>
        </div>
      </div>
    </aside>

    <ClientOnly>
      <div class="genre-chart-main">
        <div class="genre-chart-glow" aria-hidden="true" />
        <v-pie
          :items="pieItems"
          :legend="{ position: legendPosition }"
          :tooltip="pieTooltip"
          class="genre-pie-chart justify-center"
          gap="2"
          inner-cut="68"
          item-key="id"
          rounded="2"
          :size="chartSize"
          animation
          hide-slice
          reveal
        >
          <template #center>
            <div class="genre-pie-center text-center">
              <div class="genre-pie-center-pct default-title-letter">{{ topShare }}%</div>
              <div class="genre-pie-center-label text-truncate">{{ topGenre }}</div>
              <div class="genre-pie-center-hint">en baskın tür</div>
            </div>
          </template>

          <template #legend="{ items, toggle, isActive }">
            <div class="genre-chart-legend-wrap">
              <p class="genre-chart-legend-title default-title-letter">Tür listesi</p>
              <p class="genre-chart-legend-hint">Tıklayarak dilimi gizle / göster</p>
              <div class="genre-chart-legend-grid">
                <button
                  v-for="item in items"
                  :key="item.key"
                  type="button"
                  class="genre-chart-legend-card"
                  :class="{ 'genre-chart-legend-card--muted': !isActive(item) }"
                  @click="toggle(item)"
                >
                  <span class="genre-chart-legend-dot" :style="{ background: item.color }" />
                  <span class="genre-chart-legend-name text-truncate">{{ item.title }}</span>
                  <span class="genre-chart-legend-pct">{{ item.raw?.share ?? 0 }}%</span>
                  <span class="genre-chart-legend-count">{{ item.raw?.gameCount ?? item.value }} oyun</span>
                </button>
              </div>
            </div>
          </template>
        </v-pie>
      </div>

      <template #fallback>
        <div class="genre-chart-fallback">
          <v-skeleton-loader type="image" class="genre-pie-fallback-chart bg-transparent" />
          <v-skeleton-loader type="list-item@4" class="bg-transparent" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import { VPie } from "vuetify/labs/VPie";

export type GenreBreakdownItem = {
  name: string;
  count: number;
  shareOfLibrary: number;
};

const props = defineProps<{
  genres: GenreBreakdownItem[];
  topGenre: string;
  topShare: number;
  totalGames: number;
  uniqueGenres: number;
}>();

const display = useDisplay();

const GENRE_PIE_COLORS = [
  "#69f0ae",
  "rgba(105, 240, 174, 0.72)",
  "rgba(105, 240, 174, 0.5)",
  "#4dd0e1",
  "#81c784",
  "#ffb74d",
];

const chartSize = computed(() => {
  if (display.lgAndUp.value) return 300;
  if (display.mdAndUp.value) return 272;
  return 220;
});

const legendPosition = computed(() => (display.mdAndUp.value ? "right" : "bottom"));

const topThreeGenres = computed(() => props.genres.slice(0, 3));

const pieItems = computed(() =>
  props.genres.map((genre, index) => ({
    id: genre.name,
    title: genre.name,
    value: genre.count,
    share: genre.shareOfLibrary,
    gameCount: genre.count,
    color: GENRE_PIE_COLORS[index % GENRE_PIE_COLORS.length],
  }))
);

const pieTooltip = {
  titleFormat: (item: { title: string }) => item.title,
  subtitleFormat: (item: { raw?: Record<string, unknown>; value: number }) => {
    const share = Number(item.raw?.share ?? 0);
    const games = Number(item.raw?.gameCount ?? item.value);
    return `${share}% kütüphane · ${games} oyun`;
  },
};
</script>

<style scoped>
@import "~/assets/css/completed_games.css";
</style>
