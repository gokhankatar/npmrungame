<template>
  <div class="banner-container"></div>
  <v-responsive height="100vh" />
  <v-row class="d-flex align-center mx-auto" density="compact">
    <v-col
      v-for="(item, index) of gamesArr"
      :key="index"
      cols="12"
      sm="6"
      md="4"
      lg="3"
      xl="2"
    >
      <v-card
        class="game-card bg-transparent rounded-lg cursor-pointer transition"
        :height="smallScreen ? 250 : 350"
        :ripple="false"
      >
        <v-img
          :src="item.background_image"
          class="game-card-img h-100 rounded-lg"
          cover
        />
        <v-chip
          class="metacritic-point rounded-xl ma-1 ma-lg-2"
          :ripple="false"
          size="small"
          variant="elevated"
          color="black"
          :text="item.metacritic ?? 'unknown'"
        />
        <div class="game-card-info pa-1 pa-lg-2">
          <p class="default-title-letter text-caption text-lg-subtitle-2 text-white">
            {{ item.name }}
          </p>
          <p class="text-white text-caption">
            {{ new Date(item.released).getFullYear() }}
          </p>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>
<script lang="ts" setup>
import axios from "axios";
import store from "~/store/store";

const _store = store();

useHead({
  title: "npmrungame",
});

const config = useRuntimeConfig();
const display = useDisplay();
const smallScreen = computed(() => display.smAndDown.value);
const gamesArr = ref<any[]>([]);

const getGames = async () => {
  try {
    const url = `https://api.rawg.io/api/games?key=${config.public.apiKey}&page_size=40`;
    const request = await axios.get(url);

    console.log(request.data?.results);
    gamesArr.value = request.data?.results;
  } catch (error: any) {
    console.error("Error while getting games from api", error.message);
  }
};

onMounted(() => {
  getGames();
});
</script>

<style scoped>
@import url("~/assets/css/main.css");
</style>
