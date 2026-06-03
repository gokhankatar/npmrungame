<template>
  <div class="upcoming-public-page">
    <div class="upcoming-public-glow upcoming-public-glow--left" aria-hidden="true" />
    <div class="upcoming-public-glow upcoming-public-glow--right" aria-hidden="true" />

    <v-responsive height="70" />

    <v-container class="upcoming-public-container pa-3 pa-md-6 pa-lg-10 pa-xl-15">
      <header class="upcoming-public-hero mb-6 mb-lg-10">
        <div class="upcoming-public-hero-badge">
          <v-icon icon="mdi-radar" size="18" color="#ffb74d" />
          <span>Radar</span>
        </div>
        <div class="flex-grow-1">
          <h1 class="upcoming-public-hero-title default-title-letter">Radarımdaki Oyunlar</h1>
          <p class="upcoming-public-hero-subtitle default-title-letter">
            Takip ettiğim oyunlar — çıkış tarihine göre sıralı, en yakın çıkış en üstte.
          </p>
        </div>
        <div v-if="!isLoading" class="upcoming-public-hero-pill">
          <v-icon icon="mdi-gamepad-variant" size="small" color="#ffb74d" />
          <span>{{ sortedGames.length }} oyun radarda</span>
        </div>
        <v-skeleton-loader v-else type="chip" width="160" />
      </header>

      <div v-if="!isLoading && sortedGames.length" class="upcoming-public-stats mb-6 mb-lg-8">
        <div class="upcoming-public-stat upcoming-public-stat--metric upcoming-public-stat--total">
          <div class="upcoming-public-stat__glow" aria-hidden="true" />
          <div class="upcoming-public-stat__icon-wrap" aria-hidden="true">
            <v-icon icon="mdi-radar" size="22" color="#ffb74d" />
          </div>
          <div class="upcoming-public-stat__body">
            <p class="upcoming-public-stat__value default-title-letter">{{ sortedGames.length }}</p>
            <p class="upcoming-public-stat__label default-title-letter">Toplam</p>
          </div>
        </div>
        <div class="upcoming-public-stat upcoming-public-stat--metric upcoming-public-stat--soon">
          <div class="upcoming-public-stat__glow" aria-hidden="true" />
          <div class="upcoming-public-stat__icon-wrap" aria-hidden="true">
            <v-icon icon="mdi-calendar-clock" size="22" color="#ffb74d" />
          </div>
          <div class="upcoming-public-stat__body">
            <p class="upcoming-public-stat__value default-title-letter">{{ soonCount }}</p>
            <p class="upcoming-public-stat__label default-title-letter">30 gün içinde</p>
          </div>
        </div>
        <div class="upcoming-public-stat upcoming-public-stat--metric upcoming-public-stat--year">
          <div class="upcoming-public-stat__glow" aria-hidden="true" />
          <div class="upcoming-public-stat__icon-wrap" aria-hidden="true">
            <v-icon icon="mdi-calendar-star" size="22" color="#ffb74d" />
          </div>
          <div class="upcoming-public-stat__body">
            <p class="upcoming-public-stat__value default-title-letter">{{ thisYearCount }}</p>
            <p class="upcoming-public-stat__label default-title-letter">Bu yıl</p>
          </div>
        </div>
        <article
          v-if="nextGame"
          class="upcoming-public-stat upcoming-public-stat--next"
          tabindex="0"
          role="button"
          :aria-label="`${nextGame.name}, ${nextCountdown.value} ${nextCountdown.unit}`"
          @click="openGameDetail(nextGame)"
          @keydown.enter="openGameDetail(nextGame)"
        >
          <v-img
            v-if="nextGame.background_image"
            :src="nextGame.background_image"
            :alt="nextGame.name"
            cover
            class="upcoming-public-stat--next__bg"
          />
          <div v-else class="upcoming-public-stat--next__bg upcoming-public-stat--next__bg--empty">
            <v-icon icon="mdi-gamepad-variant-outline" size="28" color="rgba(255,255,255,0.25)" />
          </div>
          <div class="upcoming-public-stat--next__shade" aria-hidden="true" />
          <div class="upcoming-public-stat--next__content">
            <p class="upcoming-public-stat__label default-title-letter">En yakın</p>
            <p class="upcoming-public-stat--next__name default-title-letter">{{ nextGame.name }}</p>
            <div class="upcoming-public-stat--next__countdown default-title-letter">
              <span class="upcoming-public-stat--next__countdown-value">{{ nextCountdown.value }}</span>
              <span class="upcoming-public-stat--next__countdown-unit">{{ nextCountdown.unit }}</span>
            </div>
          </div>
        </article>
        <div v-else class="upcoming-public-stat upcoming-public-stat--metric upcoming-public-stat--next-fallback">
          <div class="upcoming-public-stat__glow" aria-hidden="true" />
          <div class="upcoming-public-stat__icon-wrap" aria-hidden="true">
            <v-icon icon="mdi-star-shooting" size="22" color="#ffb74d" />
          </div>
          <div class="upcoming-public-stat__body">
            <p class="upcoming-public-stat__value default-title-letter">—</p>
            <p class="upcoming-public-stat__label default-title-letter">En yakın</p>
          </div>
        </div>
      </div>

      <v-row v-if="isLoading" :dense="display.smAndDown.value">
        <v-col v-for="i in 4" :key="i" cols="12">
          <v-skeleton-loader type="image, article" class="rounded-xl" />
        </v-col>
      </v-row>

      <v-row v-else-if="sortedGames.length" :dense="display.smAndDown.value">
        <v-col v-for="(game, index) in sortedGames" :key="game.firestoreId" cols="12">
          <article
            class="upcoming-public-card"
            :style="{ animationDelay: `${index * 0.04}s` }"
            @click="openGameDetail(game)"
          >
            <div class="upcoming-public-card__media">
              <v-img
                v-if="game.background_image"
                :src="game.background_image"
                :alt="game.name"
                cover
                class="upcoming-public-card__img"
              />
              <div v-else class="upcoming-public-card__img upcoming-public-card__img--empty">
                <v-icon icon="mdi-gamepad-variant-outline" size="40" color="rgba(255,255,255,0.3)" />
              </div>
            </div>

            <div class="upcoming-public-card__body">
              <div class="d-flex align-start justify-space-between ga-2 mb-2">
                <div class="upcoming-date-pill">
                  <span class="upcoming-date-pill__day">{{ getDateParts(game.releaseDate).day }}</span>
                  <span class="upcoming-date-pill__month">{{ getDateParts(game.releaseDate).month }}</span>
                  <span class="upcoming-date-pill__year">{{ getDateParts(game.releaseDate).year }}</span>
                </div>
                <v-icon
                  v-if="game.rawgId"
                  icon="mdi-arrow-top-right"
                  size="20"
                  color="rgba(255,255,255,0.35)"
                />
              </div>

              <h2 class="upcoming-public-card__title default-title-letter">{{ game.name }}</h2>
              <p class="upcoming-public-card__date default-title-letter">
                {{ formatReleaseDate(game.releaseDate) }}
              </p>
              <v-chip
                size="small"
                variant="tonal"
                class="upcoming-countdown-chip default-title-letter"
                :color="getCountdownChip(game.releaseDate).color"
                :prepend-icon="getCountdownChip(game.releaseDate).icon"
                :text="getCountdownChip(game.releaseDate).text"
              />
            </div>
          </article>
        </v-col>
      </v-row>

      <div v-else class="upcoming-public-empty">
        <v-icon icon="mdi-radar" size="48" color="rgba(255,183,77,0.45)" />
        <p class="text-subtitle-1 text-grey-lighten-1 default-title-letter mt-4 mb-2">
          Henüz radarda oyun yok
        </p>
        <p class="text-caption text-grey-darken-1 mb-0">
          Takip ettiğim oyunlar burada listelenecek.
        </p>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { slugify } from "~/composables/core/basicFunc";
import { useUpcomingGames } from "~/composables/data/useUpcomingGames";
import {
  formatReleaseDate,
  getCountdownChip,
  getCountdownHeadline,
  getDateParts,
  type UpcomingGame,
} from "~/utils/upcomingGames";
import store from "~/store/store";

const router = useRouter();
const display = useDisplay();
const _store = store();

const { sortedGames, nextGame, soonCount, thisYearCount, isLoading, fetchUpcomingGames } =
  useUpcomingGames();

const nextCountdown = computed(() =>
  nextGame.value ? getCountdownHeadline(nextGame.value.releaseDate) : { value: "—", unit: "" }
);

const openGameDetail = (game: UpcomingGame) => {
  if (!game.rawgId) return;
  _store.setActiveDetailedGame(game.rawgId, game.name);
  router.push(`/game-detail/${slugify(game.name)}`);
};

onMounted(() => {
  fetchUpcomingGames();
});
</script>

<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/admin_collection_page.css");
@import url("~/assets/css/upcoming_games_page.css");
</style>
