<template>
  <div
    ref="cardRef"
    class="top10-share-card"
    :class="[
      `top10-share-card--${displayMode}`,
      { 'top10-share-card--compact': compact },
    ]"
  >
    <div class="top10-share-card__glow" aria-hidden="true" />
    <div class="top10-share-card__shine" aria-hidden="true" />

    <header v-if="displayMode !== 'wallpaper'" class="top10-share-card__head">
      <div class="top10-share-card__brand default-title-letter">
        <v-icon icon="mdi-numeric-9-plus-box-multiple-outline" size="18" color="#69f0ae" />
        npmrungame · top 9
      </div>
      <h2 class="top10-share-card__title default-title-letter">{{ title }}</h2>
      <p class="top10-share-card__user default-title-letter">
        <v-icon icon="mdi-account-circle" size="14" class="mr-1" />
        {{ username }}
      </p>
    </header>

    <!-- Wallpaper / ekran görünümü — 3×3 poster duvar -->
    <div v-if="displayMode === 'wallpaper'" class="top10-wallpaper">
      <div class="top10-wallpaper__wall">
        <article
          v-for="game in displayGames"
          :key="`wall-${game.rank}-${game.id}`"
          class="top10-wallpaper__cell"
          :class="{ [`top10-wallpaper__cell--top${game.rank}`]: game.rank <= 3 }"
        >
          <v-img
            v-if="coverSrc(game)"
            :src="coverSrc(game)!"
            :alt="game.name"
            cover
            position="center center"
            class="top10-wallpaper__img"
          />
          <div v-else class="top10-wallpaper__img top10-wallpaper__img--empty">
            <v-icon icon="mdi-gamepad-variant-outline" size="28" color="grey" />
          </div>
          <div class="top10-wallpaper__shade" aria-hidden="true" />
          <span class="top10-wallpaper__rank">{{ game.rank }}</span>
          <p class="top10-wallpaper__name default-title-letter">{{ game.name }}</p>
        </article>

        <article
          v-for="slot in emptySlots"
          :key="`wall-empty-${slot}`"
          class="top10-wallpaper__cell top10-wallpaper__cell--empty"
        >
          <span class="top10-wallpaper__rank">{{ slot }}</span>
          <v-icon icon="mdi-plus" size="22" color="rgba(255,255,255,0.22)" />
        </article>
      </div>

      <footer class="top10-wallpaper__bar">
        <div class="top10-wallpaper__brand default-title-letter">
          <v-icon icon="mdi-numeric-9-plus-box-multiple-outline" size="16" color="#69f0ae" />
          npmrungame · top 9
        </div>
        <div class="top10-wallpaper__meta">
          <strong class="default-title-letter">{{ title }}</strong>
          <span class="default-title-letter">{{ username }}</span>
        </div>
      </footer>
    </div>

    <!-- Grid / kart görünümü -->
    <div v-else-if="displayMode === 'grid'" class="top10-share-card__grid">
      <article
        v-for="game in displayGames"
        :key="`${game.rank}-${game.id}`"
        class="top10-share-card__item"
        :class="{ [`top10-share-card__item--top${game.rank}`]: game.rank <= 3 }"
      >
        <span class="top10-share-card__rank">{{ game.rank }}</span>
        <div class="top10-share-card__poster">
          <v-img
            v-if="coverSrc(game)"
            :src="coverSrc(game)!"
            :alt="game.name"
            cover
            position="center center"
            class="top10-share-card__img"
          />
          <div v-else class="top10-share-card__poster-fallback">
            <v-icon icon="mdi-gamepad-variant-outline" size="28" color="grey" />
          </div>
        </div>
        <p class="top10-share-card__name default-title-letter">{{ game.name }}</p>
      </article>

      <article
        v-for="slot in emptySlots"
        :key="`empty-${slot}`"
        class="top10-share-card__item top10-share-card__item--empty"
      >
        <span class="top10-share-card__rank">{{ slot }}</span>
        <div class="top10-share-card__poster top10-share-card__poster--empty">
          <v-icon icon="mdi-plus" size="22" color="rgba(255,255,255,0.2)" />
        </div>
        <p class="top10-share-card__name top10-share-card__name--empty default-title-letter">
          Boş slot
        </p>
      </article>
    </div>

    <!-- Liste görünümü -->
    <ol v-else class="top10-share-card__list">
      <li
        v-for="game in displayGames"
        :key="`${game.rank}-${game.id}`"
        class="top10-share-card__list-item"
        :class="{ [`top10-share-card__list-item--top${game.rank}`]: game.rank <= 3 }"
      >
        <span class="top10-share-card__list-rank">{{ game.rank }}</span>
        <div class="top10-share-card__list-poster">
          <v-img
            v-if="coverSrc(game)"
            :src="coverSrc(game)!"
            :alt="game.name"
            cover
            position="center center"
            class="top10-share-card__img"
          />
          <v-icon v-else icon="mdi-gamepad-variant-outline" size="20" color="grey" />
        </div>
        <div class="top10-share-card__list-info">
          <p class="top10-share-card__list-name default-title-letter">{{ game.name }}</p>
          <p class="top10-share-card__list-meta default-title-letter">
            <span v-if="game.released">{{ game.released.slice(0, 4) }}</span>
            <span v-if="game.metacritic" class="top10-share-card__list-mc">
              Metacritic puanı {{ game.metacritic }}
            </span>
          </p>
        </div>
      </li>

      <li
        v-for="slot in emptySlots"
        :key="`empty-list-${slot}`"
        class="top10-share-card__list-item top10-share-card__list-item--empty"
      >
        <span class="top10-share-card__list-rank">{{ slot }}</span>
        <div class="top10-share-card__list-poster top10-share-card__list-poster--empty">
          <v-icon icon="mdi-plus" size="18" color="rgba(255,255,255,0.2)" />
        </div>
        <p class="top10-share-card__list-name top10-share-card__list-name--empty default-title-letter">
          Oyun seç
        </p>
      </li>
    </ol>

    <footer
      v-if="showFooter && displayMode !== 'wallpaper'"
      class="top10-share-card__foot default-title-letter"
    >
      npmrungame.com/top-10
    </footer>
  </div>
</template>

<script lang="ts" setup>
import type { Top10DisplayMode, Top10GameEntry } from "~/composables/core/top10";
import { resolveTop10Cover, TOP10_MAX_GAMES } from "~/composables/core/top10";

const props = withDefaults(
  defineProps<{
    title: string;
    username: string;
    games: Top10GameEntry[];
    displayMode?: Top10DisplayMode;
    compact?: boolean;
    showFooter?: boolean;
    showEmptySlots?: boolean;
  }>(),
  {
    displayMode: "wallpaper",
    compact: false,
    showFooter: true,
    showEmptySlots: false,
  }
);

const cardRef = ref<HTMLElement | null>(null);

const displayGames = computed(() =>
  [...props.games]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, TOP10_MAX_GAMES)
);

const emptySlots = computed(() => {
  if (!props.showEmptySlots) return [];
  const filled = displayGames.value.length;
  return Array.from({ length: TOP10_MAX_GAMES - filled }, (_, i) => filled + i + 1);
});

function coverSrc(game: Top10GameEntry) {
  const url = resolveTop10Cover(game);
  if (!url) return null;
  if (url.startsWith("/") || url.startsWith("data:")) return url;
  try {
    const host = new URL(url).hostname;
    if (
      host === "media.rawg.io" ||
      host === "images.igdb.com" ||
      host === "img.igdb.com"
    ) {
      return `/api/img-proxy?url=${encodeURIComponent(url)}`;
    }
  } catch {
    /* ignore */
  }
  return url;
}

defineExpose({ cardRef });
</script>

<style scoped>
@import "~/assets/css/top10.css";
</style>
