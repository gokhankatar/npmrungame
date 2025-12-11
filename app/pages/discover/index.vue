<template>
  <v-responsive height="100" v-if="!smallScreen" />
  <v-responsive height="70" v-else />

  <v-container class="pa-0 pa-lg-10 pa-xl-15">
    <Game_Genres />

    <v-divider color="transparent" class="w-100 my-5 my-lg-10" />

    <!-- Game Platform Chips -->
    <v-row class="d-flex align-center mt-5 mt-lg-10">
      <v-col cols="12" sm="6" lg="4">
        <Animated_Text
          @click="resetAllFilter"
          text="Tüm Oyunlar"
          class="cursor-pointer"
          :msPerChar="50"
          :duration="550"
          :loop="true"
        />
        <p
          class="text-center text-sm-start text-caption text-lg-subtitle-2 text-blue-grey-darken-2 default-title-letter"
        >
          {{ formatNumber(total_count) }} oyun bulundu, yaklaşık
          {{ formatNumber(totalPagesDisplay) }} sayfa.
        </p>
      </v-col>

      <v-col cols="12" sm="6" lg="8">
        <div
          class="d-flex flex-wrap align-center justify-center justify-sm-end ga-1 ga-md-2 ga-lg-4"
        >
          <v-btn
            @click="isOpenSearchGame = true"
            prepend-icon="mdi-magnify"
            :ripple="false"
            :size="getCategoryChipSize"
            class="rounded-xl text-capitalize my-2 my-sm-0"
            text="Oyun Ara..."
            :variant="display.xs.value ? 'outlined' : 'text'"
            color="green-accent-2"
            :elevation="0"
            :block="display.xs.value"
          />

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
    <v-row
      class="d-flex justify-start align-center mx-auto"
      :dense="display.smAndDown.value"
    >
      <Game_Card :loading="isLoading" :arr="gamesArr" :onRowClick="handleRowClick" />

      <v-row
        class="d-flex justify-space-evenly align-center w-100 mx-auto my-3 my-lg-6"
        :dense="display.smAndDown.value"
      >
        <!-- prev -->
        <v-col cols="4" lg="4" xl="3">
          <v-btn
            :disabled="!_store.prevPage"
            @click="goPrev"
            variant="tonal"
            rounded="xl"
            prepend-icon="mdi-chevron-left"
            text="Geri"
            :size="display.smAndDown.value ? 'small' : 'large'"
            :ripple="false"
            block
          />
        </v-col>

        <!-- pagination -->
        <v-col cols="4" lg="3" xl="2" class="d-flex justify-center">
          <v-chip
            class="d-flex align-center justify-center"
            color="primary"
            style="padding: 0 8px; height: 36px; min-width: 80px"
          >
            <input
              type="number"
              v-model.number="currentPageInput"
              @input="onPageChange"
              :min="1"
              :max="totalPagesDisplay"
              style="
                width: 50px;
                border: none;
                background: transparent;
                text-align: center;
                color: white;
                font-weight: bold;
              "
            />
            <span style="margin-left: 4px; color: white">/ {{ totalPagesDisplay }}</span>
          </v-chip>
        </v-col>

        <!-- Next -->
        <v-col cols="4" lg="4" xl="3">
          <v-btn
            :disabled="!_store.nextPage"
            @click="goNext"
            variant="tonal"
            rounded="xl"
            append-icon="mdi-chevron-right"
            text="İleri"
            :size="display.smAndDown.value ? 'small' : 'large'"
            :ripple="false"
            block
          />
        </v-col>
      </v-row>
    </v-row>
  </v-container>

  <!-- Search Game Pop Up -->
  <v-dialog
    v-model="isOpenSearchGame"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.1rem);
      -webkit-backdrop-filter: blur(0.1rem);
    "
  >
    <div class="search-game-pop-up pa-2 pa-lg-5 rounded-lg">
      <v-btn
        class="close-icon-in-search-game-pop-up ma-1 ma-lg-2"
        @click="isOpenSearchGame = false"
        icon="mdi-close"
        variant="text"
        color="grey-darken-1"
        :ripple="false"
        :size="smallScreen ? 'small' : 'default'"
      />

      <div class="mt-5 mt-lg-10 mb-3 mb-lg-5 d-flex justify-center align-center ga-2">
        <p
          class="text-subtitle-2 text-lg-h5 default-title-letter text-blue-grey-lighten-1"
        >
          Hangi Oyunu Arıyorsun ?
        </p>
      </div>

      <v-text-field
        v-model="searchGameText"
        @input="searchGame"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        class="w-100 text-grey-lighten-1"
        color="grey-lighten-1"
        rounded="xl"
        label="Oyun Ara"
        placeholder="Black Myth Wukong..."
        :density="extraLgScreen ? 'comfortable' : 'compact'"
        clearable
      />

      <!-- 🔥 Arama sonuç alanı -->
      <div class="w-100" style="max-height: 350px; overflow-y: auto">
        <!-- Loading -->
        <div v-if="isSearchingGameLoading" class="d-flex justify-start py-2 py-lg-4">
          <v-progress-circular indeterminate size="24" color="grey-lighten-1" />
        </div>

        <!-- Search Results -->
        <template v-else>
          <p
            v-if="searchResults?.length"
            class="text-caption text-grey-darken-1 text-start default-title-letter"
          >
            {{ `${searchResults?.length} oyun bulundu` }}
          </p>
          <v-card
            @click="handleRowClick(game)"
            v-for="game in searchResults"
            :key="game.id"
            :ripple="false"
            class="research-game pa-2 mb-2 d-flex align-center ga-3 rounded-lg cursor-pointer"
          >
            <v-avatar :size="smallScreen ? 30 : 48" rounded>
              <v-img :src="game.background_image" :alt="game.name" cover />
            </v-avatar>

            <div class="d-flex flex-column">
              <p class="text-caption text-lg-subtitle-2 default-title-letter">
                {{ `${game.name}` }}
                <span v-if="game.released"
                  >({{ new Date(game.released).getFullYear() }})</span
                >
              </p>

              <p
                class="text-caption"
                :class="`text-${useMetacriticStyle(game?.metacritic).color}`"
              >
                Metacritic: {{ game.metacritic ?? "N/A" }}
              </p>
            </div>
          </v-card>

          <!-- No Result -->
          <p
            v-if="searchResults?.length === 0 && searchGameText?.length > 2"
            class="text-center text-grey-darken-1 mt-3"
          >
            Sonuç bulunamadı
          </p>
        </template>
      </div>
    </div>
  </v-dialog>
</template>

<script lang="ts" setup>
import { formatNumber, useMetacriticStyle } from "~/composables/data/handleData";
import store from "~/store/store";
import axios from "axios";
import Game_Genres from "~/components/common/Game_Genres.vue";
import Game_Card from "~/components/common/Game_Card.vue";
import { useDiscoverStore } from "~/store/queryStore";
import Animated_Text from "~/components/common/Animated_Text.vue";

useHead({
  title: "npmrungame | Keşfet",
});

const _store = store();
const discover_store = useDiscoverStore();
const router = useRouter();
const route = useRoute();
const display = useDisplay();

const page = computed(() => Number(route.query.page) || 1);
const smallScreen = computed(() => display.smAndDown.value);
const extraLgScreen = computed(() => display.xlAndUp.value);
const totalPagesDisplay = computed(() => Math.max(total_pages.value, 1));

const isLoading = ref(false);
const isOpenSearchGame = ref(false);
const isSearchingGameLoading = ref(false);

const gamesArr = ref<any[]>([]);
const searchResults = ref<any[]>([]);
const searchGameText = ref<string>("");
const total_count = ref<number>(0);
const total_pages = ref<number>(0);
const currentPageInput = ref(Number(route.query.page) || 1);

const onPageChange = () => {
  let page = currentPageInput.value;

  if (page < 1) page = 1;
  if (page > totalPagesDisplay.value) page = totalPagesDisplay.value;

  currentPageInput.value = page;

  router.push({
    query: {
      ...route.query,
      page: page.toString(),
    },
  });

  getGames();
};

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

const getGames = async (url?: string) => {
  try {
    isLoading.value = true;

    const requestUrl = url || "/api/games?page=1&page_size=40";

    const { data } = await axios.get(requestUrl);

    gamesArr.value = data?.results ?? [];
    total_count.value = data?.totalCount || 0;
    total_pages.value = data?.totalPages || 0;

    const parsedUrl = new URL(requestUrl, window.location.origin);
    const current = Number(parsedUrl.searchParams.get("page")) || 1;

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

const handleGamePlatform = (platform: any) => {
  const current = route.query.platform;

  if (current === platform) {
    _store.clearActiveGamePlatform();

    router.push({
      query: {
        ...route.query,
        platform: undefined,
        page: 1,
      },
    });
  } else {
    _store.changeGamePlatform(platform);

    router.push({
      query: {
        ...route.query,
        platform,
        page: 1,
      },
    });
  }
};

const resetAllFilter = () => {
  _store.clearActiveGamePlatform();

  router.push({
    query: {
      page: 1,
    },
  });
};

const handleRowClick = (item: any) => {
  discover_store.setQuery(route.query);

  _store.setActiveDetailedGame(item.id, item.name);
  router.replace(`/game-detail/${item.name}`);
};

const goNext = () => {
  if (_store.nextPage) {
    const nextPage = new URL(_store.nextPage, window.location.origin).searchParams.get(
      "page"
    );

    router.push({
      query: {
        ...route.query,
        page: nextPage,
      },
    });
  }
};

const goPrev = () => {
  if (_store.prevPage) {
    const prevPage = new URL(_store.prevPage, window.location.origin).searchParams.get(
      "page"
    );

    router.push({
      query: {
        ...route.query,
        page: prevPage,
      },
    });
  }
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

watch(
  () => [route.query.page, route.query.platform],
  () => {
    const qPlatform = route.query.platform ? route.query.platform : undefined;

    getGames(
      `/api/games?page=${page.value}&page_size=40${
        qPlatform ? `&platform=${qPlatform}` : ""
      }`
    );
  },
  { immediate: true }
);

onMounted(() => {
  const qPlatform = route.query.platform ? route.query.platform : undefined;

  getGames(
    `/api/games?page=${page.value}&page_size=40${
      qPlatform ? `&platform=${qPlatform}` : ""
    }`
  );
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/discover.css";
</style>
