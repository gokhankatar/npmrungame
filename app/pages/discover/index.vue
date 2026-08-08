<template>
  <div class="discover-page">
    <div class="discover-page-glow discover-page-glow--left" aria-hidden="true" />
    <div class="discover-page-glow discover-page-glow--right" aria-hidden="true" />

    <v-responsive :height="smallScreen ? 70 : 100" />

    <v-container class="discover-container pa-3 pa-md-6 pa-lg-10 pa-xl-15">
      <header class="discover-hero">
        <div class="discover-hero-badge default-title-letter">
          <v-icon icon="mdi-compass-outline" size="16" color="#69f0ae" />
          <span>Keşfet</span>
        </div>
        <h1 class="discover-hero-title default-title-letter">Oyun dünyasını tara</h1>
        <p class="discover-hero-sub default-title-letter">
          Türlerden başla veya platforma göre filtrele — binlerce oyuna tek tıkla ulaş.
        </p>
      </header>

      <Game_Genres />

      <section class="discover-catalog">
        <div class="discover-catalog__toolbar">
          <div class="discover-catalog__info">
            <template v-if="isLoading">
              <v-skeleton-loader type="heading" width="140" class="mb-2" />
              <v-skeleton-loader type="text" width="220" />
            </template>
            <template v-else>
              <h2
                class="discover-catalog__heading default-title-letter"
                role="button"
                tabindex="0"
                @click="resetAllFilter"
                @keydown.enter="resetAllFilter"
              >
                Tüm oyunlar
              </h2>
              <p class="discover-catalog__count default-title-letter">
                {{ formatNumber(total_count) }} oyun · yaklaşık
                {{ formatNumber(totalPagesDisplay) }} sayfa
              </p>
            </template>
          </div>

          <div class="discover-catalog__actions">
            <v-btn
              prepend-icon="mdi-magnify"
              :ripple="false"
              :size="getCategoryChipSize"
              class="discover-search-btn rounded-pill text-capitalize default-title-letter"
              text="Oyun ara"
              variant="tonal"
              color="green-accent-2"
              @click="isOpenSearchGame = true"
            />

            <div class="discover-platform-chips">
              <v-chip
                v-for="item in game_category_list"
                :key="item.name"
                class="cursor-pointer transition category-chip"
                :class="
                  _store.active_game_platform === item.slug
                    ? `active-game-platform-${item.slug}`
                    : ''
                "
                color="grey"
                variant="outlined"
                :size="getCategoryChipSize"
                :text="item.name"
                :prepend-icon="item.icon"
                :ripple="false"
                @click="handleGamePlatform(item.slug)"
              />
            </div>
          </div>
        </div>

        <v-row class="discover-games-grid d-flex justify-start align-center mx-auto" :dense="display.smAndDown.value">
          <Game_Card :loading="isLoading" :arr="gamesArr" :on-row-click="handleRowClick" />

          <v-col cols="12" class="discover-pagination">
            <Discover_Pagination
              :current-page="_store.currentPage || page"
              :total-pages="totalPagesDisplay"
              :total-count="total_count"
              :can-prev="!!_store.prevPage"
              :can-next="!!_store.nextPage"
              :loading="isLoading"
              @prev="goPrev"
              @next="goNext"
              @go="goToPage"
            />
          </v-col>
        </v-row>
      </section>
    </v-container>

    <v-dialog
      v-model="isOpenSearchGame"
      max-width="560"
      scrollable
      class="discover-search-dialog"
      scrim="rgba(0,0,0,0.9)"
      @after-leave="onSearchDialogClosed"
    >
      <v-card class="discover-search-card rounded-xl" :ripple="false">
        <div class="discover-search-card__header">
          <div class="discover-search-card__title-block">
            <div class="discover-search-card__icon-wrap" aria-hidden="true">
              <v-icon icon="mdi-magnify" size="22" color="#69f0ae" />
            </div>
            <div>
              <h2 class="discover-search-card__title default-title-letter">Oyun ara</h2>
              <p class="discover-search-card__sub default-title-letter mb-0">
                Hangi oyunu arıyorsun? En az 3 karakter yaz.
              </p>
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="grey-lighten-1"
            :ripple="false"
            aria-label="Kapat"
            @click="isOpenSearchGame = false"
          />
        </div>

        <v-card-text class="discover-search-card__body">
          <v-text-field
            v-model="searchGameText"
            autofocus
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            class="discover-search-field default-title-letter"
            color="green-accent-2"
            rounded="pill"
            placeholder="Örn. Elden Ring, GTA V…"
            hide-details
            clearable
            :density="extraLgScreen ? 'comfortable' : 'default'"
            @update:model-value="onSearchInput"
            @keydown.esc="isOpenSearchGame = false"
          />

          <p
            v-if="searchGameText.length > 0 && searchGameText.length < 3"
            class="discover-search-hint default-title-letter mb-0"
          >
            <v-icon icon="mdi-keyboard" size="16" class="mr-1" />
            {{ 3 - searchGameText.length }} karakter daha…
          </p>

          <div class="discover-search-results">
            <div v-if="isSearchingGameLoading" class="discover-search-state">
              <v-progress-circular indeterminate size="32" color="#69f0ae" />
              <span class="default-title-letter">Aranıyor…</span>
            </div>

            <div
              v-else-if="!searchGameText.length"
              class="discover-search-state discover-search-state--idle"
            >
              <v-icon icon="mdi-gamepad-variant-outline" size="40" color="rgba(105,240,174,0.35)" />
              <span class="default-title-letter">Oyun adı yazmaya başla</span>
            </div>

            <template v-else-if="searchGameText.length >= 3">
              <p
                v-if="searchResults.length"
                class="discover-search-count default-title-letter"
              >
                {{ searchResults.length }} sonuç
              </p>

              <button
                v-for="game in searchResults"
                :key="game.id"
                type="button"
                class="discover-search-pick"
                @click="selectSearchGame(game)"
              >
                <v-avatar :size="52" rounded="lg" class="discover-search-pick__avatar">
                  <v-img
                    v-if="game.background_image"
                    :src="game.background_image"
                    :alt="game.name"
                    cover
                  />
                  <v-icon v-else icon="mdi-gamepad-variant-outline" color="grey" />
                </v-avatar>
                <div class="discover-search-pick__info min-w-0">
                  <p class="discover-search-pick__name default-title-letter mb-0 text-truncate">
                    {{ game.name }}
                    <span v-if="game.released" class="discover-search-pick__year">
                      {{ new Date(game.released).getFullYear() }}
                    </span>
                  </p>
                  <v-chip
                    v-if="game.metacritic"
                    size="x-small"
                    variant="elevated"
                    class="discover-search-pick__score mt-1"
                    :color="useMetacriticStyle(game.metacritic).color"
                    prepend-icon="mdi-star"
                    :text="String(game.metacritic)"
                  />
                  <span v-else class="discover-search-pick__na text-caption">Metacritic yok</span>
                </div>
                <v-icon
                  icon="mdi-chevron-right"
                  size="22"
                  color="rgba(255,255,255,0.35)"
                  class="discover-search-pick__arrow"
                />
              </button>

              <div
                v-if="!searchResults.length"
                class="discover-search-state discover-search-state--empty"
              >
                <v-icon icon="mdi-magnify-close" size="36" color="rgba(255,255,255,0.25)" />
                <span class="default-title-letter">Sonuç bulunamadı</span>
                <span class="discover-search-state__sub default-title-letter">
                  Farklı bir isim dene
                </span>
              </div>
            </template>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { formatNumber, useMetacriticStyle } from "~/composables/data/handleData";
import store from "~/store/store";
import axios from "axios";
import _ from "lodash";
import Game_Genres from "~/components/common/Game_Genres.vue";
import Game_Card from "~/components/common/Game_Card.vue";
import Discover_Pagination from "~/components/common/Discover_Pagination.vue";
import { useDiscoverStore } from "~/store/queryStore";
import { slugify } from "~/composables/core/basicFunc";
import { game_category_list } from "~/utils/Game_Categories_List";

useHead({
  title: "Keşfet | npmrungame",
  meta: [
    {
      name: "description",
      content: "npmrungame keşfet — türlere ve platformlara göre oyun ara.",
    },
  ],
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
const searchGameText = ref("");
const total_count = ref(0);
const total_pages = ref(0);

let searchDebounce: ReturnType<typeof setTimeout> | null = null;

const searchGame = async () => {
  if (searchGameText.value.length <= 2) {
    searchResults.value = [];
    isSearchingGameLoading.value = false;
    return;
  }

  try {
    isSearchingGameLoading.value = true;
    const { data } = await axios.get("/api/search-games", {
      params: { search: searchGameText.value },
    });
    searchResults.value = data?.results ?? [];
  } catch (error: any) {
    console.error(error.message);
    searchResults.value = [];
  } finally {
    isSearchingGameLoading.value = false;
  }
};

const onSearchInput = () => {
  if (searchDebounce) clearTimeout(searchDebounce);
  if (searchGameText.value.length <= 2) {
    searchResults.value = [];
    isSearchingGameLoading.value = false;
    return;
  }
  searchDebounce = setTimeout(searchGame, 400);
};

const getCategoryChipSize = computed(() => {
  if (display.xlAndUp.value) return "default";
  if (display.mdAndUp.value) return "small";
  return "x-small";
});

const handleGamePlatform = (platform: string) => {
  const current = route.query.platform;

  if (current === platform) {
    _store.clearActiveGamePlatform();
    router.push({
      query: { ...route.query, platform: undefined, page: 1 },
    });
  } else {
    _store.changeGamePlatform(platform);
    router.push({
      query: { ...route.query, platform, page: 1 },
    });
  }
};

const resetAllFilter = () => {
  _store.clearActiveGamePlatform();
  router.push({ query: { page: 1 } });
};

const handleRowClick = (item: any) => {
  discover_store.setQuery(route.query);
  _store.setActiveDetailedGame(item.id, item.name);
  router.push(`/game-detail/${slugify(item.name)}`);
};

const selectSearchGame = (game: any) => {
  isOpenSearchGame.value = false;
  handleRowClick(game);
};

const onSearchDialogClosed = () => {
  searchGameText.value = "";
  searchResults.value = [];
  isSearchingGameLoading.value = false;
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

const goNext = () => {
  if (!_store.nextPage) return;
  const nextPage = new URL(_store.nextPage, window.location.origin).searchParams.get("page");
  router.push({ query: { ...route.query, page: nextPage } });
};

const goPrev = () => {
  if (!_store.prevPage) return;
  const prevPage = new URL(_store.prevPage, window.location.origin).searchParams.get("page");
  router.push({ query: { ...route.query, page: prevPage } });
};

const goToPage = (target: number) => {
  if (!target || target === page.value) return;
  if (target < 1 || target > totalPagesDisplay.value) return;
  router.push({ query: { ...route.query, page: String(target) } });
};

const buildGamesUrl = () => {
  const qPlatform = route.query.platform ? `&platform=${route.query.platform}` : "";
  return `/api/games?page=${page.value}&page_size=40${qPlatform}`;
};

watch(
  () => [route.query.page, route.query.platform],
  () => getGames(buildGamesUrl()),
  { immediate: true }
);

watch(
  () => searchGameText.value,
  (val) => {
    if (!val || val.length < 2) {
      searchResults.value = [];
      isSearchingGameLoading.value = false;
    }
  }
);

onUnmounted(() => {
  if (searchDebounce) clearTimeout(searchDebounce);
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/discover.css";
</style>
