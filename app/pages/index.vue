<template>
  <div class="banner-container"></div>

  <v-responsive height="100vh" />

  <v-container class="pa-0 pa-lg-10 pa-xl-15">
    <v-row>
      <v-col cols="12">
        <div
          class="d-flex flex-wrap align-center justify-center justify-sm-start ga-1 ga-md-2 ga-lg-4"
        >
          <v-chip
            v-for="(item, index) of game_category_list"
            :key="item.name"
            class="cursor-pointer transition category-chip"
            color="grey"
            variant="outlined"
            :size="getCategoryChipSize"
            :text="item.name"
            :prepend-icon="item.icon"
            :ripple="false"
          />
        </div>
      </v-col>
    </v-row>

    <!-- Games List -->
    <v-row class="d-flex justify-center align-center mx-auto" density="comfortable">
      <template v-if="isLoading">
        <v-col cols="12">
          <v-progress-circular color="primary" indeterminate />
        </v-col>
      </template>

      <template v-else>
        <v-col
          v-for="(item, index) of gamesArr"
          :key="index"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            class="game-card bg-transparent rounded-lg cursor-pointer transition"
            :height="smallScreen ? 250 : 375"
            :ripple="false"
          >
            <v-img
              :src="item.background_image"
              class="game-card-img h-100 rounded-lg"
              cover
            />

            <!-- Playtime -->
            <v-tooltip text="Toplam oynama süresi (Ana Hikaye)" location="top">
              <template #activator="{ props }">
                <v-chip
                  v-bind="props"
                  class="playtime-icon rounded-xl ma-1 ma-lg-2"
                  :ripple="false"
                  size="small"
                  variant="elevated"
                  prepend-icon="mdi-timer-outline"
                  color="black"
                  :text="item.playtime ? `${item.playtime} saat` : 'belirsiz'"
                />
              </template>
            </v-tooltip>

            <!-- Metacritic -->
            <v-tooltip text="Metacritic puanı" location="top">
              <template #activator="{ props }">
                <v-chip
                  v-bind="props"
                  class="metacritic-point rounded-xl ma-1 ma-lg-2"
                  :ripple="false"
                  size="small"
                  :prepend-icon="item.metacritic < 90 ? 'mdi-star-outline' : ''"
                  :prepend-avatar="item.metacritic >= 90 ? fireAnimation : ''"
                  variant="elevated"
                  :color="useMetacriticStyle(item.metacritic).color"
                  :text="item.metacritic ?? 'belirsiz'"
                />
              </template>
            </v-tooltip>

            <div
              class="game-card-info d-flex flex-column align-start ga-1 ga-lg-2 pa-1 pa-lg-2"
            >
              <!-- Name & Date -->
              <div class="d-flex flex-column align-start">
                <p
                  class="default-title-letter text-caption text-lg-subtitle-2 text-white"
                >
                  {{ item.name }}
                </p>
                <p class="text-white text-caption">
                  {{ new Date(item.released).getFullYear() }}
                </p>
              </div>

              <!-- Genres -->
              <div class="d-flex flex-wrap ga-1">
                <v-chip
                  v-for="(genre, index) in item.genres"
                  :key="index"
                  :size="smallScreen ? 'x-small' : 'small'"
                  variant="outlined"
                  :ripple="false"
                  :text="genre.name"
                />
              </div>

              <!-- Tags -->
              <div class="d-flex flex-wrap ga-1">
                <v-chip
                  v-for="(tag, index) in useLimitedTags(item.tags, 3).visibleTags"
                  :key="index"
                  color="blue-lighten-1"
                  size="x-small"
                  class="rounded text-black"
                  variant="elevated"
                  :ripple="false"
                  :text="truncateText(tag.name, 15)"
                />
                <v-chip
                  v-if="useLimitedTags(item.tags, 3).hiddenCount > 0"
                  color="blue-lighten-1"
                  size="x-small"
                  variant="elevated"
                  class="rounded text-black"
                  :ripple="false"
                  :text="useLimitedTags(item.tags, 3).hiddenText"
                />
              </div>
            </div>
          </v-card>
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>
<script lang="ts" setup>
import axios from "axios";
import store from "~/store/store";
import example_results from "~/example_response.json";
import { truncateText } from "~/composables/core/basicFunc";
import { useLimitedTags, useMetacriticStyle } from "~/composables/data/handleData";
import fireAnimation from "~/assets/img/fire_anim.gif";

const _store = store();

useHead({
  title: "npmrungame",
});

const config = useRuntimeConfig();
const display = useDisplay();
const smallScreen = computed(() => display.smAndDown.value);
const gamesArr = ref<any[]>([]);
const isLoading = ref(false);

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

const getCategoryChipSize = computed(() => {
  if (display.xlAndUp.value) {
    return "large";
  } else if (display.mdAndUp.value) {
    return "small";
  } else {
    return "x-small";
  }
});

onMounted(() => {
  gamesArr.value = example_results.results;
});
</script>

<style scoped>
@import url("~/assets/css/main.css");
</style>
