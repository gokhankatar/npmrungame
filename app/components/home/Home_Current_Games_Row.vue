<template>
  <section class="home-current-midhero" :class="{ 'home-current-midhero--loading': loading }">
    <template v-if="loading">
      <v-skeleton-loader type="image" class="home-current-midhero__loader" />
    </template>

    <template v-else-if="featuredGame">
      <div v-if="featuredGame.background_image" class="home-current-midhero__media">
        <v-img
          :key="`${featuredGame.firestoreId}-blur`"
          :src="featuredGame.background_image"
          :alt="''"
          cover
          position="top center"
          class="home-current-midhero__bg home-current-midhero__bg--blur"
          aria-hidden="true"
        />
        <v-img
          :key="featuredGame.firestoreId"
          :src="featuredGame.background_image"
          :alt="featuredGame.name"
          cover
          position="top center"
          class="home-current-midhero__bg home-current-midhero__bg--main"
        />
      </div>
      <div v-else class="home-current-midhero__bg home-current-midhero__bg--empty">
        <v-icon icon="mdi-gamepad-variant-outline" size="56" color="rgba(255,255,255,0.2)" />
      </div>

      <div class="home-current-midhero__shade" aria-hidden="true" />
      <div class="home-current-midhero__vignette" aria-hidden="true" />

      <div class="home-current-midhero__inner">
        <div class="home-current-midhero__body">
          <div class="home-current-midhero__labels">
            <span class="home-current-midhero__label home-current-midhero__label--live">
              <span class="home-current-midhero__live-dot" />
              Şu an oynuyor
            </span>
            <span v-if="games.length > 1" class="home-current-midhero__label home-current-midhero__label--count">
              +{{ games.length - 1 }} oyun daha
            </span>
          </div>

          <h2 class="home-current-midhero__title default-title-letter">
            {{ featuredGame.name }}
          </h2>

          <p v-if="featuredSubtitle" class="home-current-midhero__sub default-title-letter">
            {{ featuredSubtitle }}
          </p>

          <div class="home-current-midhero__meta">
            <v-chip
              v-if="featuredGame.metacritic"
              size="small"
              variant="elevated"
              class="home-current-midhero__meta-chip"
              :color="useMetacriticStyle(featuredGame.metacritic).color"
              prepend-icon="mdi-star"
              :text="String(featuredGame.metacritic)"
            />
            <v-chip
              v-if="featuredGame.playtime"
              size="small"
              variant="tonal"
              color="grey-darken-3"
              class="home-current-midhero__meta-chip"
              prepend-icon="mdi-timer-outline"
              :text="`${featuredGame.playtime} saat`"
            />
          </div>

          <div class="home-current-midhero__actions">
            <v-btn
              color="green-accent-2"
              variant="flat"
              rounded="pill"
              size="large"
              :block="btnBlock"
              class="home-current-midhero__btn home-current-midhero__btn--primary text-black font-weight-bold text-capitalize default-title-letter"
              prepend-icon="mdi-information-outline"
              text="Oyun detayı"
              :ripple="false"
              @click="onRowClick(featuredGame)"
            />
          </div>
        </div>
      </div>

      <div v-if="games.length > 1" class="home-current-midhero__rail" role="list">
        <button
          v-for="(item, index) in games"
          :key="item.firestoreId ?? index"
          type="button"
          class="home-current-midhero__thumb"
          :class="{ 'home-current-midhero__thumb--active': index === activeIndex }"
          role="listitem"
          @click="activeIndex = index"
        >
          <v-img :src="item.background_image" cover class="h-100 w-100" />
          <span class="home-current-midhero__thumb-name text-truncate">{{ item.name }}</span>
        </button>
      </div>
    </template>
  </section>
</template>

<script lang="ts" setup>
import { formatGameYearAndGenres, useMetacriticStyle } from "~/composables/data/handleData";

const props = defineProps<{
  games: any[];
  loading?: boolean;
  onRowClick: (item: any) => void;
}>();

const display = useDisplay();
const activeIndex = ref(0);

const btnBlock = computed(() => display.smAndDown.value);

const featuredGame = computed(() => props.games[activeIndex.value] ?? props.games[0] ?? null);

const featuredSubtitle = computed(() => {
  const game = featuredGame.value;
  return game ? formatGameYearAndGenres(game) : "";
});

watch(
  () => props.games.length,
  () => {
    activeIndex.value = 0;
  }
);
</script>

<style scoped>
@import "~/assets/css/home_page.css";
</style>
