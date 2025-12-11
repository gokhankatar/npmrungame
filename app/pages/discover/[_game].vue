<template>
  <v-responsive height="100" v-if="!isSmallScreen" />
  <v-responsive height="70" v-else />

  <v-container class="pa-0 pa-lg-10 pa-xl-15">
    <v-row>
      <v-row
        class="d-flex justify-space-between align-center w-100 mx-auto"
        :dense="display.smAndDown.value"
      >
        <v-col cols="12" sm="8" xl="10">
          <p
            class="text-center text-sm-start text-subtitle-2 text-sm-subtitle-1 text-md-h5 text-lg-h4 text-xl-h3 default-title-letter font-weight-bold text-grey-lighten-1"
          >
            {{ `${_store.active_game_genre?.title} Oyunları` }}
          </p>
        </v-col>

        <v-col cols="12" sm="4" xl="2">
          <div
            @click="handleToBack"
            class="w-100 w-sm-auto back-to-games-btn transition d-flex justify-center float-none float-sm-right justify-sm-end align-center cursor-pointer text-caption text-sm-subtitle-2 ga-1 ga-lg-3 pa-1 pa-lg-2 rounded-xl"
            style="width: fit-content"
          >
            <v-icon
              :size="display.smAndDown.value ? 'small' : 'default'"
              color="grey-lighten-1"
              icon="mdi-arrow-left"
            />
            <p
              class="text-caption text-sm-subtitle-2 text-xl-subtitle-1 default-title-letter text-grey-lighten-1"
            >
              Oyunlara Dön
            </p>
          </div>
        </v-col>
      </v-row>

      <v-divider class="w-100 mt-2 mb-5" color="white" />

      <v-col
        v-for="(item, index) of gamesList"
        :key="index"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-skeleton-loader
          v-if="isGettingGames"
          type="card"
          class="my-2 rounded-lg h-100"
        />

        <v-card
          v-if="!isGettingGames"
          @click="handleRowClick(item)"
          class="game-card bg-transparent rounded-lg cursor-pointer transition"
          :height="isSmallScreen ? 250 : 375"
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
                v-if="item.playtime"
                v-bind="props"
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
                v-if="item.metacritic"
                v-bind="props"
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
              <v-chip
                v-for="(genre, index) in item.genres"
                :key="index"
                :size="isSmallScreen ? 'x-small' : 'small'"
                variant="outlined"
                :ripple="false"
                :text="genre.name"
              />
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
import axios from "axios";
import { truncateText } from "~/composables/core/basicFunc";
import {
  getUniquePlatformIcons,
  useLimitedTags,
  useMetacriticStyle,
} from "~/composables/data/handleData";
import store from "~/store/store";
import fireAnimation from "~/assets/img/fire_anim.gif";
import { useDiscoverStore } from "~/store/queryStore";

const router = useRouter();
const discover_store = useDiscoverStore();
const _store = store();
const display = useDisplay();

const isSmallScreen = computed(() => display.smAndDown.value);

const isGettingGames = ref(false);

const gamesList = ref<any[]>([]);

const getGamesByTagOrGenre = async () => {
  try {
    isGettingGames.value = true;

    // @ts-ignore
    const paramKey = _store.active_game_genre?.type === "genre" ? "genres" : "tags";

    const res = await axios.get("/api/games-by-filter", {
      params: {
        type: paramKey,
        slug: _store.active_game_genre?.slug,
        page_size: 40,
      },
    });

    gamesList.value = res.data.results;
  } catch (error: any) {
    console.error("Error while getting games:", error.message);
  } finally {
    isGettingGames.value = false;
  }
};

const handleToBack = () => {
  router.replace({
    path: "/discover",
    query: discover_store.lastQuery || {},
  });
};

const handleRowClick = (item: any) => {
  _store.setActiveDetailedGame(item.id, item.name);
  router.replace(`/game-detail/${item.name}`);
};

onMounted(() => {
  getGamesByTagOrGenre();
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/discover.css";
</style>
