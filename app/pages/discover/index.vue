<template>
  <v-responsive height="100" v-if="!smallScreen" />
  <v-responsive height="70" v-else />

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
    <v-row class="d-flex justify-start align-center mx-auto" :dense="display.smAndDown.value">
      <Game_Card :loading="isLoading" :arr="gamesArr" :onRowClick="handleRowClick" />

      <v-row class="d-flex justify-center align-center w-100 mx-auto my-3 my-lg-6" :dense="display.smAndDown.value">
        <v-col cols="6" lg="3" xl="2">
          <v-btn :disabled="!_store.prevPage" @click="goPrev" variant="tonal" rounded="xl"
            prepend-icon="mdi-chevron-left" text="Geri" :size="display.smAndDown.value ? 'small' : 'large'"
            :ripple="false" block />
        </v-col>
        <v-col cols="6" lg="3" xl="2">
          <v-btn :disabled="!_store.nextPage" @click="goNext" variant="tonal" rounded="xl"
            append-icon="mdi-chevron-right" text="İleri" :size="display.smAndDown.value ? 'small' : 'large'"
            :ripple="false" block />
        </v-col>
      </v-row>
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
        <p class="text-subtitle-2 text-lg-h5 default-title-letter text-blue-grey-lighten-1">
          Hangi Oyunu Arıyorsun ?
        </p>
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
import {
  useMetacriticStyle,
} from "~/composables/data/handleData";
import store from "~/store/store";
import axios from "axios";
import Game_Genres from "~/components/common/Game_Genres.vue";
import Game_Card from "~/components/common/Game_Card.vue";

useHead({
  title: "npmrungame | Keşfet",
});

const _store = store();
const router = useRouter();
const display = useDisplay();

const smallScreen = computed(() => display.smAndDown.value);
const extraLgScreen = computed(() => display.xlAndUp.value);

const isLoading = ref(false);
const isOpenSearchGame = ref(false);
const isSearchingGameLoading = ref(false);

const gamesArr = ref<any[]>([]);
const searchResults = ref<any[]>([]);
const searchGameText = ref<string>("");

const searchGame = async () => {
  try {
    if (searchGameText.value.length > 2) {
      isSearchingGameLoading.value = true;

      const { data } = await axios.get("/api/search-games", {
        params: {
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

// const getGames = async () => {
//   try {
//     isLoading.value = true;

//     const { data } = await axios.get("/api/games", {
//       params: {
//         page_size: 40,
//       },
//     });

//     gamesArr.value = data?.results ?? [];
//   } catch (error: any) {
//     console.error("Error while getting games", error.message);
//   } finally {
//     isLoading.value = false;
//   }
// };

const getGames = async (url?: string) => {

  try {
    isLoading.value = true;

    const requestUrl = url || "/api/games?page=1&page_size=40";

    const { data } = await axios.get(requestUrl);

    gamesArr.value = data?.results ?? [];

    // URL içindeki current page'i çekelim
    const parsedUrl = new URL(requestUrl, window.location.origin);
    const current = Number(parsedUrl.searchParams.get("page")) || 1;

    // Store update
    _store.setPagination(current, data?.next, data?.previous);

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
  _store.setActiveDetailedGame(item.id, item.name);
  router.replace(`/game-detail/${item.name}`);
};

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

const goNext = () => {
  if (_store.nextPage) {
    getGames(_store.nextPage);
  }
};

const goPrev = () => {
  if (_store.prevPage) {
    getGames(_store.prevPage);
  }
};

onMounted(() => {
  getGames(`/api/games?page=${_store.currentPage}&page_size=40`);
});

</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/discover.css";
</style>
