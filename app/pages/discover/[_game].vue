<template>
  <v-responsive height="90" v-if="!isSmallScreen" />
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

      <Game_Card
        :arr="gamesList"
        :loading="isGettingGames"
        :onRowClick="handleRowClick"
      />
    </v-row>
  </v-container>
</template>
<script lang="ts" setup>
import axios from "axios";
import store from "~/store/store";
import { useDiscoverStore } from "~/store/queryStore";
import Game_Card from "~/components/common/Game_Card.vue";

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

const defaultTitle = "npmrungame | Keşfet";

useHead({
  title: defaultTitle,
});

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
