<template>
  <section class="discover-genres">
    <div class="discover-genres__head">
      <div>
        <h2 class="discover-genres__title default-title-letter">Oyun türleri</h2>
        <p class="discover-genres__hint default-title-letter mb-0">
          Bir türe tıkla — o kategorideki oyunları listele
        </p>
      </div>
    </div>

    <div class="discover-genres__grid">
      <v-card
        v-for="item in game_genres"
        :key="item.slug"
        class="game-genre-card cursor-pointer"
        :ripple="false"
        @click="handleRouteGameGenre(item)"
      >
        <v-img :src="item.background_img" class="game-genre-card-img" cover />
        <div class="game-genre-card__shade" aria-hidden="true" />
        <div class="game-genre-title">
          <p
            class="text-white text-caption text-sm-subtitle-2 text-lg-subtitle-1 default-title-letter"
          >
            {{ item.name }}
          </p>
          <v-icon
            icon="mdi-arrow-top-right"
            size="18"
            class="game-genre-card__arrow"
          />
        </div>
      </v-card>
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { Game_Genre } from "~/composables/core/interfaces";
import { game_genres } from "~/utils/Game_Genres";
import store from "~/store/store";

const _store = store();
const router = useRouter();

const handleRouteGameGenre = (item: Game_Genre) => {
  _store.setActiveGameGenre(item.slug, item.name, item.type);
  router.push(`/discover/${item.slug}-games`);
};
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/discover.css";
</style>
