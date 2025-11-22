<template>
  <v-responsive height="100" />

  <v-container class="pa-0 pa-lg-10 pa-xl-15">
    <!-- Game Platform Chips -->
    <v-row class="d-flex align-center">
      <v-col cols="12" sm="6">
        <div
          class="d-flex flex-wrap align-center justify-center justify-sm-start ga-1 ga-md-2 ga-lg-4"
        >
          <v-chip
            v-for="(item, index) of game_category_list"
            :key="item.name"
            @click="handleGamePlatform(item.slug)"
            class="cursor-pointer transition category-chip"
            :class="
              _store.active_game_platform == item.slug
                ? `active-game-platform-${item.slug}`
                : ''
            "
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
    <v-row class="d-flex justify-start align-center mx-auto" density="comfortable">
      <v-col
        v-for="(item, index) of gamesArr"
        :key="index"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-skeleton-loader
          v-if="isLoading || isLoadingSearch"
          type="card"
          class="rounded-lg h-100"
        />

        <v-card
          v-if="!isLoading && !isLoadingSearch && !isStartSearching"
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
                v-if="item.playtime"
                class="playtime-icon rounded-xl ma-1 ma-lg-2"
                :ripple="false"
                size="small"
                variant="elevated"
                prepend-icon="mdi-timer-outline"
                color="black"
                :text="`${item.playtime} saat`"
              />
            </template>
          </v-tooltip>

          <!-- Metacritic -->
          <v-tooltip text="Metacritic puanı" location="top">
            <template #activator="{ props }">
              <v-chip
                v-bind="props"
                v-if="item.metacritic"
                class="metacritic-point rounded-xl ma-1 ma-lg-2"
                :ripple="false"
                size="small"
                :prepend-icon="item.metacritic < 90 ? 'mdi-star-outline' : ''"
                :prepend-avatar="item.metacritic >= 90 ? fireAnimation : ''"
                variant="elevated"
                :color="useMetacriticStyle(item.metacritic).color"
                :text="item.metacritic"
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

              <div class="d-flex align-center flex-wrap ga-1">
                <template
                  v-for="icon in getUniquePlatformIcons(item.platforms)"
                  :key="icon"
                >
                  <v-icon
                    v-if="icon"
                    size="x-small"
                    color="grey-lighten-1"
                    :icon="icon"
                  />
                </template>
              </div>
            </div>

            <!-- Genres -->
            <div class="d-flex flex-wrap ga-1">
              <template v-if="item.genres">
                <v-chip
                  v-for="(genre, index) in item.genres"
                  :key="index"
                  :size="smallScreen ? 'x-small' : 'small'"
                  variant="outlined"
                  :ripple="false"
                  :text="genre.name"
                />
              </template>

              <template v-else>
                <v-chip
                  :size="smallScreen ? 'x-small' : 'small'"
                  variant="outlined"
                  :ripple="false"
                  text="N/A"
                />
              </template>
            </div>

            <!-- Tags -->
            <div class="d-none d-md-flex flex-wrap ga-1">
              <v-chip
                v-for="(tag, index) in useLimitedTags(item.tags, 3).visibleTags"
                :key="index"
                color="grey-darken-1"
                size="x-small"
                class="rounded text-black"
                variant="elevated"
                :ripple="false"
                :text="truncateText(tag.name, 15)"
              />
              <v-chip
                v-if="useLimitedTags(item.tags, 3).hiddenCount > 0"
                color="grey-darken-2"
                size="x-small"
                variant="elevated"
                class="rounded text-white"
                :ripple="false"
                :text="useLimitedTags(item.tags, 3).hiddenText"
              />
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts" setup>
import { truncateText } from "~/composables/core/basicFunc";
import {
  getUniquePlatformIcons,
  useLimitedTags,
  useMetacriticStyle,
} from "~/composables/data/handleData";
import store from "~/store/store";
import fireAnimation from "~/assets/img/fire_anim.gif";
import example_results from "~/example_response.json";
import axios from "axios";

const config = useRuntimeConfig();
const _store = store();
const display = useDisplay();
const smallScreen = computed(() => display.smAndDown.value);
const extraLgScreen = computed(() => display.xlAndUp.value);
const gamesArr = ref<any[]>([]);
const isLoading = ref(false);
const isLoadingSearch = ref(false);
const isStartSearching = ref(false);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

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

const handleGamePlatform = (platform: "pc" | "ps5" | "xbox" | "nintendo" | "star") => {
  if (platform == _store.active_game_platform) {
    _store.clearActiveGamePlatform();
  } else {
    _store.changeGamePlatform(platform);
  }
};

onMounted(() => {
  gamesArr.value = example_results.results;
});
</script>
<style scoped>
@import "~/assets/css/main.css";
</style>
