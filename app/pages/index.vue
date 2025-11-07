<template>
  <div class="banner-container"></div>

  <v-responsive height="100vh" />

  <v-row>
    <v-chip-group mutliple column> </v-chip-group>
  </v-row>

  <v-row
    class="d-flex justify-center align-center mx-auto pa-0 pa-lg-5 pa-xl-15"
    density="comfortable"
  >
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
              <p class="default-title-letter text-caption text-lg-subtitle-2 text-white">
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

const getAllPs5Games = async () => {
  try {
    isLoading.value = true;
    let page = 1;
    const exclusiveGames: any[] = [];
    const foundIds = new Set();
    const minRequired = 20;
    const maxPages = 30; // güvenlik limiti, çok uzamasın diye

    while (exclusiveGames.length < minRequired && page <= maxPages) {
      const url = `https://api.rawg.io/api/games?key=${config.public.apiKey}&platforms=187&page_size=40&page=${page}`;
      const { data } = await axios.get(url);

      const filtered = data.results.filter((game: any) => {
        const platforms = game.platforms?.map((p: any) => p.platform.id);
        return platforms?.length === 1 && platforms.includes(187);
      });

      // yinelenenleri atla
      const newOnes = filtered.filter((g: any) => !foundIds.has(g.id));
      newOnes.forEach((g: any) => foundIds.add(g.id));

      exclusiveGames.push(...newOnes);

      console.log(
        `Page ${page} → ${newOnes.length} exclusive found (total ${exclusiveGames.length})`
      );

      if (exclusiveGames.length >= minRequired) break;

      page++;
      await new Promise((r) => setTimeout(r, 1000)); // API'yi yormamak için 1 saniye bekle
    }

    gamesArr.value = exclusiveGames;
    console.log(`✅ Found ${exclusiveGames.length} PS5-exclusive games.`);
  } catch (error: any) {
    console.error("Error while getting PS5-exclusive games:", error.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  gamesArr.value = example_results.results;
  // getAllPs5Games();
});
</script>

<style scoped>
@import url("~/assets/css/main.css");
</style>
