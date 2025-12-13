<template>
  <v-row :dense="isSmallScreen">
    <v-col cols="12">
      <p
        class="text-subtitle-2 text-md-subtitle-1 text-xl-h5 text-blue-grey-darken-1 default-title-letter text-center text-sm-start"
      >
        Oyun Türleri
      </p>

      <v-divider class="w-100 mt-2 mb-3" color="white" />
    </v-col>
    <v-col v-for="(item, index) of game_genres" :key="item.slug" cols="6" lg="3">
      <v-card
        class="game-genre-card rounded-lg cursor-pointer"
        :ripple="false"
        @click="handleRouteGameGenre(item)"
      >
        <v-img :src="item.background_img" class="game-genre-card-img" cover />
        <div
          class="w-100 game-genre-title pa-1 pa-lg-2 d-flex justify-center justify-sm-start align-center"
        >
          <p
            class="text-white text-caption text-sm-subtitle-2 text-lg-subtitle-1 text-xl-h5 default-title-letter"
          >
            {{ item.name }}
          </p>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>
<script lang="ts" setup>
import type { Game_Genre } from "~/composables/core/interfaces";
import store from "~/store/store";

const _store = store();
const route = useRoute();
const router = useRouter();
const display = useDisplay();

const isSmallScreen = computed(() => display.smAndDown.value);

const handleRouteGameGenre = (item: Game_Genre) => {
  _store.setActiveGameGenre(item.slug, item.name, item.type);
  router.replace(`/discover/${item.slug}-games`);
};
</script>
<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/discover.css";
</style>
