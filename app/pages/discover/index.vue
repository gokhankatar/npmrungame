<template>
  <v-responsive height="100" />

  <v-container class="pa-0 pa-lg-10 pa-xl-15">
    <Game_Genres />

    <v-divider color="transparent" class="w-100 my-5 my-lg-10" />

    <!-- Game Platform Chips -->
    <v-row class="d-flex align-center mt-5 mt-lg-10">
      <v-col cols="12" sm="6" lg="4">
        <p
          class="text-subtitle-2 text-sm-subtitle-1 text-lg-h5 text-grey-lighten-1 default-title-letter text-center text-sm-start">
          Tüm Oyunlar
        </p>
      </v-col>

      <v-col cols="12" sm="6" lg="8">
        <div class="d-flex flex-wrap align-center justify-center justify-sm-end ga-1 ga-md-2 ga-lg-4">
          <v-btn @click="isOpenSearchGame = true" prepend-icon="mdi-magnify" :ripple="false" :size="getCategoryChipSize"
            class="rounded-xl text-capitalize my-2 my-sm-0" text="Oyun Ara..."
            :variant="display.xs.value ? 'outlined' : 'text'" color="green-accent-2" :elevation="0"
            :block="display.xs.value" />

          <v-chip v-for="(item, index) of game_category_list" :key="item.name" @click="handleGamePlatform(item.slug)"
            class="cursor-pointer transition category-chip" :class="_store.active_game_platform == item.slug
              ? `active-game-platform-${item.slug}`
              : ''
              " color="grey" variant="outlined" :size="getCategoryChipSize" :text="item.name" :prepend-icon="item.icon"
            :ripple="false" />
        </div>
      </v-col>
    </v-row>

    <!-- Games List -->
    <v-row class="d-flex justify-start align-center mx-auto" density="comfortable">
      <v-col v-for="(item, index) of gamesArr" :key="index" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader v-if="isLoading" type="card" class="rounded-lg h-100" />

        <v-card v-if="!isLoading" @click="handleRowClick(item)"
          class="game-card bg-transparent rounded-lg cursor-pointer transition" :height="smallScreen ? 250 : 375"
          :ripple="false">
          <v-img :src="item.background_image" class="game-card-img h-100 rounded-lg" cover />

          <!-- Playtime -->
          <v-tooltip text="Toplam oynama süresi (Ana Hikaye)" location="top">
            <template #activator="{ props }">
              <v-chip v-bind="props" v-if="item.playtime" class="playtime-icon rounded-xl ma-1 ma-lg-2" :ripple="false"
                size="small" variant="elevated" prepend-icon="mdi-timer-outline" color="black"
                :text="`${item.playtime} saat`" />
            </template>
          </v-tooltip>

          <!-- Metacritic -->
          <v-tooltip text="Metacritic puanı" location="top">
            <template #activator="{ props }">
              <v-chip v-bind="props" v-if="item.metacritic" class="metacritic-point rounded-xl ma-1 ma-lg-2"
                :ripple="false" size="small" :prepend-icon="item.metacritic < 90 ? 'mdi-star-outline' : ''"
                :prepend-avatar="item.metacritic >= 90 ? fireAnimation : ''" variant="elevated"
                :color="useMetacriticStyle(item.metacritic).color" :text="item.metacritic" />
            </template>
          </v-tooltip>

          <div class="game-card-info d-flex flex-column align-start ga-1 ga-lg-2 pa-1 pa-lg-2">
            <!-- Name & Date -->
            <div class="d-flex flex-column align-start">
              <p class="default-title-letter text-caption text-lg-subtitle-2 text-white">
                {{ item.name }}
              </p>
              <p class="text-white text-caption">
                {{ new Date(item.released).getFullYear() }}
              </p>

              <div class="d-flex align-center flex-wrap ga-1">
                <template v-for="icon in getUniquePlatformIcons(item.platforms)" :key="icon">
                  <v-icon v-if="icon" size="x-small" color="grey-lighten-1" :icon="icon" />
                </template>
              </div>
            </div>

            <!-- Genres -->
            <div class="d-flex flex-wrap ga-1">
              <template v-if="item.genres">
                <v-chip v-for="(genre, index) in item.genres" :key="index" :size="smallScreen ? 'x-small' : 'small'"
                  variant="outlined" :ripple="false" :text="genre.name" />
              </template>

              <template v-else>
                <v-chip :size="smallScreen ? 'x-small' : 'small'" variant="outlined" :ripple="false" text="N/A" />
              </template>
            </div>

            <!-- Tags -->
            <div class="d-none d-md-flex flex-wrap ga-1">
              <v-chip v-for="(tag, index) in useLimitedTags(item.tags, 3).visibleTags" :key="index"
                color="grey-darken-1" size="x-small" class="rounded text-black" variant="elevated" :ripple="false"
                :text="truncateText(tag.name, 15)" />
              <v-chip v-if="useLimitedTags(item.tags, 3).hiddenCount > 0" color="grey-darken-2" size="x-small"
                variant="elevated" class="rounded text-white" :ripple="false"
                :text="useLimitedTags(item.tags, 3).hiddenText" />
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Search Game Pop Up -->
  <v-dialog v-model="isOpenSearchGame" :max-width="600" style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.1rem);
      -webkit-backdrop-filter: blur(0.1rem);
    ">
    <div class="search-game-pop-up pa-2 pa-lg-5 rounded-lg">
      <v-btn class="close-icon-in-search-game-pop-up ma-1 ma-lg-2" @click="isOpenSearchGame = false" icon="mdi-close"
        variant="text" color="grey-darken-1" :ripple="false" :size="smallScreen ? 'small' : 'default'" />

      <div class="mt-5 mt-lg-10 mb-3 mb-lg-5 d-flex justify-center align-center ga-2">
        <p class="text-subtitle-2 text-lg-h5 default-title-letter text-blue-grey-lighten-1">Hangi Oyunu Arıyorsun ?</p>
      </div>

      <v-text-field v-model="searchGameText" @input="searchGame" prepend-inner-icon="mdi-magnify" variant="outlined"
        class="w-100 text-grey-lighten-1" color="grey-lighten-1" rounded="xl" label="Oyun Ara"
        placeholder="Black Myth Wukong..." :density="extraLgScreen ? 'comfortable' : 'compact'" clearable />

      <!-- 🔥 Arama sonuç alanı -->
      <div class="w-100" style="max-height: 350px; overflow-y: auto">
        <!-- Loading -->
        <div v-if="isSearchingGameLoading" class="d-flex justify-start py-2 py-lg-4">
          <v-progress-circular indeterminate size="24" color="grey-lighten-1" />
        </div>

        <!-- Search Results -->
        <template v-else>
          <p v-if="searchResults?.length" class="text-caption text-grey-darken-1 text-start default-title-letter">
            {{ `${searchResults?.length} oyun bulundu` }}
          </p>
          <v-card @click="handleRowClick(game)" v-for="game in searchResults" :key="game.id" :ripple="false"
            class="research-game pa-2 mb-2 d-flex align-center ga-3 rounded-lg cursor-pointer">
            <v-avatar :size="smallScreen ? 30 : 48" rounded>
              <v-img :src="game.background_image" :alt="game.name" cover />
            </v-avatar>

            <div class="d-flex flex-column">
              <p class="text-caption text-lg-subtitle-2 default-title-letter">
                {{ `${game.name}` }}
                <span v-if="game.released">({{ new Date(game.released).getFullYear() }})</span>
              </p>

              <p class="text-caption" :class="`text-${useMetacriticStyle(game?.metacritic).color}`">
                Metacritic: {{ game.metacritic ?? "N/A" }}
              </p>
            </div>
          </v-card>

          <!-- No Result -->
          <p v-if="searchResults?.length === 0 && searchGameText?.length > 2"
            class="text-center text-grey-darken-1 mt-3">
            Sonuç bulunamadı
          </p>
        </template>
      </div>
    </div>

  </v-dialog>
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
import Game_Genres from "~/components/common/Game_Genres.vue";

useHead({
  title: "npmrungame | Discover"
})

const config = useRuntimeConfig();
const _store = store();
const router = useRouter();
const display = useDisplay();

const smallScreen = computed(() => display.smAndDown.value);
const extraLgScreen = computed(() => display.xlAndUp.value);

const isLoading = ref(false);
const isOpenSearchGame = ref(false)
const isSearchingGameLoading = ref(false);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const gamesArr = ref<any[]>([]);
const searchResults = ref<any[]>([]);
const searchGameText = ref<string>("");

const searchGame = async () => {
  try {
    if (searchGameText.value.length > 2) {
      isSearchingGameLoading.value = true;

      const { data } = await axios.get("https://api.rawg.io/api/games", {
        params: {
          key: config.public.apiKey,
          search: searchGameText.value,
        },
      });

      searchResults.value = data?.results ?? [];
    } else {
      searchResults.value = [];
    }
  } catch (error: any) {
    console.log(error.message);
  } finally {
    isSearchingGameLoading.value = false;
  }
};

const getGames = async () => {
  try {
    isLoading.value = true;
    const url = `https://api.rawg.io/api/games?key=${config.public.apiKey}&page_size=40`;
    const request = await axios.get(url);

    console.log(request.data?.results);
    gamesArr.value = request.data?.results;
  } catch (error: any) {
    console.error("Error while getting games from api", error.message);
  } finally {
    isLoading.value = false;
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

const handleRowClick = (item: any) => {
  _store.setActiveDetailedGame(item.id, item.name)
  router.replace(`/game-detail/${item.name}`)
}

watch(
  () => searchGameText.value,
  (val) => {
    if (!val || val.length < 2) {
      searchResults.value = [];
      isSearchingGameLoading.value = false;
      return;
    }
  },
  { immediate: true }
);

onMounted(() => {
  gamesArr.value = example_results.results;
});
</script>
<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/discover.css";
</style>
