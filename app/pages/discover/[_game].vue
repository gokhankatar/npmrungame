<template>
  <v-responsive height="90" v-if="!isSmallScreen" />
  <v-responsive height="70" v-else />

  <v-container class="pa-0 pa-lg-10 pa-xl-15">
    <v-row>
      <v-row class="d-flex justify-space-between align-center w-100 mx-auto" :dense="display.smAndDown.value">
        <v-col cols="12" sm="8" xl="10">
          <template v-if="isGettingGames">
            <v-skeleton-loader type="text" width="190" height="12px" style="
              background-color: transparent;
              --v-skeleton-loader-bg-color: transparent;
            " />
            <v-skeleton-loader type="text" width="300" height="12px" class="mt-2 mb-5" style="
              background-color: transparent;
              --v-skeleton-loader-bg-color: transparent;
            " />
          </template>

          <template v-else>
            <Animated_Text :text="`${_store.active_game_genre?.title} Oyunları`"
              class="cursor-pointer d-flex justify-center justify-sm-start align-center" :msPerChar="50" :duration="550"
              :loop="true" />
            <p
              class="text-center text-sm-start text-caption text-lg-subtitle-2 text-blue-grey-darken-2 default-title-letter">
              {{ formatNumber(total_count) }} oyun bulundu, yaklaşık
              {{ formatNumber(totalPagesDisplay) }} sayfa.
            </p>
          </template>
        </v-col>

        <v-col cols="12" sm="4" xl="2">
          <div @click="handleToBack"
            class="w-100 w-sm-auto back-to-games-btn transition d-flex justify-center float-none float-sm-right justify-sm-end align-center cursor-pointer text-caption text-sm-subtitle-2 ga-1 ga-lg-3 pa-1 pa-lg-2 rounded-xl"
            style="width: fit-content">
            <v-icon :size="display.smAndDown.value ? 'small' : 'default'" color="grey-lighten-1"
              icon="mdi-arrow-left" />
            <p class="text-caption text-sm-subtitle-2 text-xl-subtitle-1 default-title-letter text-grey-lighten-1">
              Oyunlara Dön
            </p>
          </div>
        </v-col>
      </v-row>

      <v-divider class="w-100 mt-2 mb-5" color="white" />

      <Game_Card :arr="gamesList" :loading="isGettingGames" :onRowClick="handleRowClick" />

      <v-row class="d-flex justify-space-evenly align-center w-100 mx-auto my-3 my-lg-6"
        :dense="display.smAndDown.value">
        <!-- prev -->
        <v-col cols="12">
          <div class="d-flex justify-center align-center ga-2 ga-lg-4 w-100">
            <v-btn :disabled="!_store.prevPage" @click="goPrev" variant="tonal" rounded="xl"
              prepend-icon="mdi-chevron-left" class="text-capitalize" text="Geri"
              :size="display.smAndDown.value ? 'small' : 'default'" :ripple="false" />

            <div class="d-flex align-center ga-1 ga-lg-2">
              <v-progress-circular v-if="isGettingGames" color="grey-darken-1" size="12" width="2" indeterminate />
              <p v-else class="text-caption text-xl-subtitle-2 defaul-title-letter text-grey-darken-1">
                {{ _store.currentPage }} / {{ totalPagesDisplay }}
              </p>
            </div>

            <v-btn :disabled="!_store.nextPage" @click="goNext" variant="tonal" rounded="xl"
              append-icon="mdi-chevron-right" class="text-capitalize" text="İleri"
              :size="display.smAndDown.value ? 'small' : 'default'" :ripple="false" />
          </div>
        </v-col>
      </v-row>
    </v-row>
  </v-container>
</template>
<script lang="ts" setup>
import axios from "axios";
import store from "~/store/store";
import { useDiscoverStore } from "~/store/queryStore";
import Game_Card from "~/components/common/Game_Card.vue";
import { formatNumber } from "~/composables/data/handleData";
import Animated_Text from "~/components/common/Animated_Text.vue";
import { slugify } from "~/composables/core/basicFunc";

const router = useRouter();
const route = useRoute()
const discover_store = useDiscoverStore();
const _store = store();
const display = useDisplay();

const page = computed(() => Number(route.query.page) || 1);
const isSmallScreen = computed(() => display.smAndDown.value);

const isGettingGames = ref(false);

const total_count = ref<number>(0);
const total_pages = ref<number>(0);
const totalPagesDisplay = computed(() => Math.max(total_pages.value, 1));

const gamesList = ref<any[]>([]);

const getGamesByTagOrGenre = async () => {
  try {
    isGettingGames.value = true;

    const paramKey =
      _store.active_game_genre?.type === "genre" ? "genres" : "tags";

    const { data } = await axios.get("/api/games-by-filter", {
      params: {
        type: paramKey,
        slug: _store.active_game_genre?.slug,
        page: page.value,
        page_size: 40,
      },
    });

    gamesList.value = data.results;
    total_count.value = data?.totalCount || 0;
    total_pages.value = data?.totalPages || 0;

    _store.setPagination(data.current, data.next, data.previous);
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
  router.replace(`/game-detail/${slugify(item.name)}`);
};

const goNext = () => {
  if (_store.nextPage) {
    const page = new URL(_store.nextPage, window.location.origin)
      .searchParams.get("page");

    router.push({
      query: { ...route.query, page },
    });
  }
};

const goPrev = () => {
  if (_store.prevPage) {
    const page = new URL(_store.prevPage, window.location.origin)
      .searchParams.get("page");

    router.push({
      query: { ...route.query, page },
    });
  }
};

const defaultTitle = "npmrungame | Keşfet";

useHead({
  title: defaultTitle,
});

watch(
  () => route.query.page,
  () => {
    getGamesByTagOrGenre();
  },
  { immediate: true }
);

watch(
  () => _store.active_game_genre?.title,
  (newTitle) => {
    if (newTitle) {
      useHead({
        title: `${newTitle} Oyunları`,
      });
    } else {
      useHead({
        title: defaultTitle,
      });
    }
  },
  { immediate: true }
);

onMounted(() => {
  getGamesByTagOrGenre();
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/discover.css";
</style>
