<template>
  <div class="discover-page discover-genre-page">
    <div class="discover-page-glow discover-page-glow--left" aria-hidden="true" />
    <div class="discover-page-glow discover-page-glow--right" aria-hidden="true" />

    <v-responsive :height="isSmallScreen ? 70 : 100" />

    <v-container class="discover-container pa-3 pa-md-6 pa-lg-10 pa-xl-15">
      <header class="discover-genre-hero">
        <div v-if="currentGenre?.background_img" class="discover-genre-hero__bg" aria-hidden="true">
          <img :src="currentGenre.background_img" alt="" loading="lazy" />
        </div>
        <div class="discover-genre-hero__shade" aria-hidden="true" />
        <div class="discover-genre-hero__vignette" aria-hidden="true" />

        <div class="discover-genre-hero__content">
          <button
            type="button"
            class="discover-genre-back default-title-letter"
            @click="handleToBack"
          >
            <v-icon icon="mdi-arrow-left" size="18" />
            <span>Oyunlara dön</span>
          </button>

          <div class="discover-genre-hero__main">
            <template v-if="isGettingGames && !genreTitle">
              <v-skeleton-loader type="chip" width="100" class="mb-3 bg-transparent" />
              <v-skeleton-loader type="heading" width="220" class="mb-2 bg-transparent" />
              <v-skeleton-loader type="text" width="180" class="bg-transparent" />
            </template>
            <template v-else>
              <div class="discover-hero-badge default-title-letter">
                <v-icon icon="mdi-gamepad-variant-outline" size="16" color="#69f0ae" />
                <span>{{ genreTypeLabel }}</span>
              </div>
              <h1 class="discover-genre-hero__title default-title-letter">
                {{ genreTitle }} Oyunları
              </h1>
              <p class="discover-genre-hero__meta default-title-letter">
                <span class="discover-genre-hero__stat">
                  <v-icon icon="mdi-database-outline" size="15" />
                  {{ formatNumber(total_count) }} oyun
                </span>
                <span class="discover-genre-hero__dot" aria-hidden="true">·</span>
                <span class="discover-genre-hero__stat">
                  <v-icon icon="mdi-book-open-page-variant-outline" size="15" />
                  {{ formatNumber(totalPagesDisplay) }} sayfa
                </span>
              </p>
            </template>
          </div>
        </div>
      </header>

      <section class="discover-catalog discover-catalog--genre">
        <div class="discover-catalog__toolbar discover-catalog__toolbar--compact">
          <div class="discover-catalog__info">
            <h2 class="discover-catalog__heading default-title-letter">
              {{ genreTitle || "Oyun" }} listesi
            </h2>
            <p class="discover-catalog__count default-title-letter mb-0">
              Sayfa {{ _store.currentPage }} / {{ totalPagesDisplay }}
            </p>
          </div>
        </div>

        <v-row
          class="discover-games-grid d-flex justify-start align-center mx-auto ma-0"
          :dense="display.smAndDown.value"
        >
          <Game_Card
            :arr="gamesList"
            :loading="isGettingGames"
            :on-row-click="handleRowClick"
          />

          <v-col cols="12" class="discover-pagination">
            <Discover_Pagination
              :current-page="_store.currentPage || page"
              :total-pages="totalPagesDisplay"
              :total-count="total_count"
              :can-prev="!!_store.prevPage"
              :can-next="!!_store.nextPage"
              :loading="isGettingGames"
              @prev="goPrev"
              @next="goNext"
              @go="goToPage"
            />
          </v-col>
        </v-row>
      </section>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import store from "~/store/store";
import { useDiscoverStore } from "~/store/queryStore";
import Game_Card from "~/components/common/Game_Card.vue";
import Discover_Pagination from "~/components/common/Discover_Pagination.vue";
import { formatNumber } from "~/composables/data/handleData";
import { slugify } from "~/composables/core/basicFunc";
import { game_genres } from "~/utils/Game_Genres";

const router = useRouter();
const route = useRoute();
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

const genreTitle = computed(() => _store.active_game_genre?.title ?? "");

const currentGenre = computed(() =>
  game_genres.find((g) => g.slug === _store.active_game_genre?.slug)
);

const genreTypeLabel = computed(() =>
  _store.active_game_genre?.type === "tag" ? "Etiket" : "Tür"
);

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
  router.push({
    path: "/discover",
    query: discover_store.lastQuery || {},
  });
};

const handleRowClick = (item: any) => {
  _store.setActiveDetailedGame(item.id, item.name);
  router.push(`/game-detail/${slugify(item.name)}`);
};

const goNext = () => {
  if (_store.nextPage) {
    const nextPage = new URL(_store.nextPage, window.location.origin).searchParams.get(
      "page"
    );

    router.push({
      query: { ...route.query, page: nextPage },
    });
  }
};

const goPrev = () => {
  if (_store.prevPage) {
    const prevPage = new URL(_store.prevPage, window.location.origin).searchParams.get(
      "page"
    );

    router.push({
      query: { ...route.query, page: prevPage },
    });
  }
};

const goToPage = (target: number) => {
  if (!target || target === page.value) return;
  if (target < 1 || target > totalPagesDisplay.value) return;
  router.push({
    query: { ...route.query, page: String(target) },
  });
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
        title: `${newTitle} Oyunları | npmrungame`,
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
