<template>
  <div class="completed-page to-play-page">
    <div class="completed-page-glow completed-page-glow--left" aria-hidden="true" />
    <div class="completed-page-glow completed-page-glow--right" aria-hidden="true" />

    <v-responsive height="70" />

    <v-container class="completed-container pa-3 pa-md-6 pa-lg-10 pa-xl-15">
      <header class="completed-hero mb-6 mb-lg-10">
        <div class="completed-hero-badge">
          <v-icon icon="mdi-playlist-play" size="18" color="#4fc3f7" />
          <span>Bekleme Listesi</span>
        </div>
        <div class="completed-hero-main">
          <h1 class="completed-hero-title default-title-letter">Oynayacağım Oyunlar</h1>
          <p class="completed-hero-subtitle">
            Sırada bekleyen oyunlar — tahmini süre, tür ve puanlarla planla.
          </p>
        </div>
        <div v-if="!isGettingToPlayGames" class="completed-hero-pill">
          <v-icon icon="mdi-gamepad-variant" size="small" color="#4fc3f7" />
          <span>{{ totalGamesCount }} oyun kuyrukta</span>
        </div>
        <v-skeleton-loader v-else type="chip" width="160" class="completed-hero-pill-skeleton" />
      </header>

      <v-row class="completed-stats-row" :dense="display.smAndDown.value">
        <v-col cols="12" sm="6" md="3" class="d-flex">
          <v-card class="stat-card stat-card--games rounded-xl pa-4 h-100 w-100" :ripple="false">
            <div class="stat-card-inner">
              <div class="stat-card-ring-wrap">
                <v-progress-circular
                  v-if="isGettingToPlayGames"
                  :size="ringSize"
                  :width="4"
                  color="#4fc3f7"
                  indeterminate
                />
                <v-progress-circular
                  v-else
                  :model-value="collectionProgress"
                  :size="ringSize"
                  :width="4"
                  color="#4fc3f7"
                  bg-color="rgba(255, 255, 255, 0.08)"
                >
                  <span class="stat-ring-center">{{ collectionProgress }}%</span>
                </v-progress-circular>
              </div>
              <div class="stat-card-body">
                <p class="stat-card-label default-title-letter">Toplam Oyun</p>
                <p v-if="!isGettingToPlayGames" class="stat-card-value">{{ totalGamesCount }}</p>
                <p v-if="!isGettingToPlayGames" class="stat-card-hint">
                  {{ totalGamesCount }} / {{ collectionMilestone }} hedef
                </p>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3" class="d-flex">
          <v-card class="stat-card stat-card--time rounded-xl pa-4 h-100 w-100" :ripple="false">
            <div class="stat-card-inner">
              <div class="stat-card-ring-wrap">
                <v-progress-circular
                  v-if="isGettingToPlayGames"
                  :size="ringSize"
                  :width="4"
                  color="#4fc3f7"
                  indeterminate
                />
                <v-progress-circular
                  v-else
                  :model-value="playtimeProgress"
                  :size="ringSize"
                  :width="4"
                  color="#29b6f6"
                  bg-color="rgba(255, 255, 255, 0.08)"
                >
                  <span class="stat-ring-center">{{ playtimeProgress }}%</span>
                </v-progress-circular>
              </div>
              <div class="stat-card-body">
                <p class="stat-card-label default-title-letter">Tahmini Süre</p>
                <p v-if="!isGettingToPlayGames" class="stat-card-value">
                  {{ totalPlaytime }} <span class="stat-card-unit">saat</span>
                </p>
                <p v-if="!isGettingToPlayGames" class="stat-card-hint">
                  Sonraki hedef: {{ playtimeMilestone }} saat
                </p>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3" class="d-flex">
          <v-card class="stat-card stat-card--genre rounded-xl pa-4 h-100 w-100" :ripple="false">
            <div class="stat-card-inner">
              <div class="stat-card-ring-wrap">
                <v-progress-circular
                  v-if="isGettingToPlayGames"
                  :size="ringSize"
                  :width="4"
                  color="#4fc3f7"
                  indeterminate
                />
                <v-progress-circular
                  v-else
                  :model-value="topGenreShare"
                  :size="ringSize"
                  :width="4"
                  color="#81d4fa"
                  bg-color="rgba(255, 255, 255, 0.08)"
                >
                  <span class="stat-ring-center">{{ topGenreShare }}%</span>
                </v-progress-circular>
              </div>
              <div class="stat-card-body stat-card-genre-text">
                <p class="stat-card-label default-title-letter">En Yaygın Tür</p>
                <p v-if="!isGettingToPlayGames" class="stat-card-value text-truncate">{{ mostCommonGenre }}</p>
                <p v-if="!isGettingToPlayGames" class="stat-card-hint">
                  {{ topGenreGameCount }} oyunda geçiyor
                </p>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3" class="d-flex">
          <v-card class="stat-card stat-card--meta rounded-xl pa-4 h-100 w-100" :ripple="false">
            <div class="stat-card-inner">
              <div class="stat-card-ring-wrap">
                <v-progress-circular
                  v-if="isGettingToPlayGames"
                  :size="ringSize"
                  :width="4"
                  color="#4fc3f7"
                  indeterminate
                />
                <v-progress-circular
                  v-else
                  :model-value="metaProgress"
                  :size="ringSize"
                  :width="4"
                  :color="metaRingColor"
                  bg-color="rgba(255, 255, 255, 0.08)"
                >
                  <span class="stat-ring-center">{{ metaProgress }}</span>
                </v-progress-circular>
              </div>
              <div class="stat-card-body">
                <p class="stat-card-label default-title-letter">Ortalama Metacritic</p>
                <p v-if="!isGettingToPlayGames" class="stat-card-value">
                  {{ avgMetacritic?.toFixed(0) }}
                  <span class="stat-card-unit">/ 100</span>
                </p>
                <p v-if="!isGettingToPlayGames" class="stat-card-hint">
                  {{ metaRatedCount }} puanlı oyun
                </p>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" class="d-flex">
          <v-card class="genre-breakdown-card rounded-xl pa-4 pa-md-5 w-100" :ripple="false">
            <div class="genre-breakdown-header">
              <div class="d-flex align-center ga-2">
                <div class="toolbar-icon-ring">
                  <v-icon icon="mdi-chart-donut" color="#4fc3f7" size="22" />
                </div>
                <div>
                  <h3 class="genre-breakdown-title default-title-letter">Tür Dağılımı</h3>
                  <p class="genre-breakdown-subtitle">
                    Kuyruktaki oyunlarda hangi türler öne çıkıyor
                  </p>
                </div>
              </div>
              <v-chip
                v-if="!isGettingToPlayGames && genreBreakdown.length"
                size="small"
                variant="tonal"
                color="light-blue-accent-2"
                class="genre-total-chip"
              >
                {{ uniqueGenreCount }} farklı tür
              </v-chip>
            </div>

            <div v-if="isGettingToPlayGames" class="genre-breakdown-loading mt-4">
              <v-skeleton-loader type="list-item@4" class="bg-transparent" />
            </div>

            <div v-else-if="genreBreakdown.length" class="genre-breakdown-list mt-4">
              <div
                v-for="(item, index) in genreBreakdown"
                :key="item.name"
                class="genre-breakdown-row"
              >
                <div class="genre-row-top">
                  <span class="genre-rank">{{ index + 1 }}</span>
                  <span class="genre-name text-truncate">{{ item.name }}</span>
                  <span class="genre-count">{{ item.count }} oyun</span>
                  <span class="genre-percent">{{ item.shareOfLibrary }}%</span>
                </div>
                <div class="genre-bar-track">
                  <div
                    class="genre-bar-fill"
                    :style="{ width: `${item.barWidth}%` }"
                    :class="`genre-bar-fill--${index % 4}`"
                  />
                </div>
              </div>
            </div>

            <p v-else class="genre-breakdown-empty mt-4 text-caption text-grey-darken-1">
              Henüz tür verisi yok.
            </p>
          </v-card>
        </v-col>
      </v-row>

      <section class="games-library-panel">
        <div class="games-library-toolbar">
          <div class="games-library-toolbar-title">
            <div class="toolbar-icon-ring">
              <v-icon icon="mdi-playlist-check" color="#4fc3f7" :size="smallScreen ? 'small' : 'default'" />
            </div>
            <div>
              <h2 class="library-title default-title-letter">Oyun Kuyruğu</h2>
              <p class="library-subtitle text-grey-darken-1">
                <template v-if="isGettingToPlayGames">Yükleniyor...</template>
                <template v-else-if="searchText.length >= 2">
                  {{ toPlayGames.length }} / {{ totalGamesCount }} oyun gösteriliyor
                </template>
                <template v-else>{{ totalGamesCount }} oyun listeleniyor</template>
              </p>
            </div>
          </div>

          <div class="games-library-toolbar-actions">
            <div
              v-if="!display.smAndDown.value"
              class="search-box"
              :class="{ 'search-box--focused': searchFocused, 'search-box--active': searchText?.length >= 2 }"
            >
              <v-icon icon="mdi-magnify" class="search-box-icon" size="20" />
              <input
                ref="searchInputRef"
                v-model="searchText"
                type="search"
                class="search-box-input default-title-letter"
                placeholder="Oyun adı ara..."
                autocomplete="off"
                @focus="searchFocused = true"
                @blur="searchFocused = false"
              />
              <kbd v-if="!searchText && !searchFocused" class="search-box-kbd">Ctrl K</kbd>
              <button
                v-if="searchText"
                type="button"
                class="search-box-clear"
                aria-label="Aramayı temizle"
                @click="clearSearch"
              >
                <v-icon icon="mdi-close" size="16" />
              </button>
              <span v-if="searchText.length >= 2 && !isLoadingSearchGame" class="search-box-badge">
                {{ toPlayGames.length }} sonuç
              </span>
            </div>

            <v-menu
              v-if="!display.xs.value"
              :close-on-content-click="true"
              :offset="[5, 10]"
              location="bottom end"
            >
              <template #activator="{ props: menuProps }">
                <v-btn
                  v-bind="menuProps"
                  prepend-icon="mdi-sort-variant"
                  class="toolbar-btn text-capitalize"
                  variant="tonal"
                  rounded="pill"
                  color="light-blue-accent-2"
                  :size="display.smAndDown.value ? 'small' : 'default'"
                  :ripple="false"
                  text="Sırala"
                />
              </template>
              <v-card class="toolbar-menu-card pa-1 pa-sm-2" :ripple="false" elevation="2">
                <v-list density="compact" class="bg-transparent">
                  <v-list-item prepend-icon="mdi-star" @click="sortBy('meta')">
                    <v-list-item-title class="text-grey-lighten-1">Metacritic Puanı</v-list-item-title>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-arrow-up" @click="sortBy('new')">
                    <v-list-item-title class="text-grey-lighten-1">Tarihe Göre En Yeni</v-list-item-title>
                  </v-list-item>
                  <v-list-item prepend-icon="mdi-arrow-down" :ripple="false" @click="sortBy('old')">
                    <v-list-item-title class="text-grey-lighten-1">Tarihe Göre En Eski</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>

            <v-btn
              icon="mdi-refresh"
              class="toolbar-icon-btn"
              variant="tonal"
              rounded="pill"
              :color="isGettingToPlayGames ? 'light-blue-accent-2' : 'grey-darken-1'"
              :size="smallScreen ? 'small' : 'default'"
              :loading="isGettingToPlayGames"
              :ripple="false"
              @click="getToPlayGames"
            />
          </div>
        </div>

        <div v-if="display.smAndDown.value" class="games-library-mobile-controls mt-3">
          <div
            class="search-box search-box--block"
            :class="{ 'search-box--active': searchText?.length >= 2 }"
          >
            <v-icon icon="mdi-magnify" class="search-box-icon" size="20" />
            <input
              ref="searchInputMobileRef"
              v-model="searchText"
              type="search"
              class="search-box-input default-title-letter"
              placeholder="Oyun adı ara..."
              autocomplete="off"
            />
            <button
              v-if="searchText"
              type="button"
              class="search-box-clear"
              aria-label="Aramayı temizle"
              @click="clearSearch"
            >
              <v-icon icon="mdi-close" size="16" />
            </button>
            <span v-if="searchText.length >= 2 && !isLoadingSearchGame" class="search-box-badge">
              {{ toPlayGames.length }}
            </span>
          </div>
        </div>

        <div v-if="display.xs.value" class="mt-2">
          <v-menu :close-on-content-click="true" :offset="[5, 0]" location="bottom end">
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                prepend-icon="mdi-sort"
                class="text-capitalize w-100"
                variant="tonal"
                rounded="pill"
                color="light-blue-accent-2"
                size="small"
                :ripple="false"
                text="Sırala"
                block
              />
            </template>
            <v-card class="toolbar-menu-card pa-1 pa-sm-2" :ripple="false" elevation="2">
              <v-list density="compact" class="bg-transparent">
                <v-list-item prepend-icon="mdi-star" @click="sortBy('meta')">
                  <v-list-item-title class="text-grey-lighten-1">Metacritic Puanı</v-list-item-title>
                </v-list-item>
                <v-list-item prepend-icon="mdi-arrow-up" @click="sortBy('new')">
                  <v-list-item-title class="text-grey-lighten-1">Tarihe Göre En Yeni</v-list-item-title>
                </v-list-item>
                <v-list-item prepend-icon="mdi-arrow-down" :ripple="false" @click="sortBy('old')">
                  <v-list-item-title class="text-grey-lighten-1">Tarihe Göre En Eski</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </div>

        <div v-if="isLoadingSearchGame || noGameFound" class="library-status mt-4">
          <div v-if="isLoadingSearchGame" class="d-flex align-center ga-2">
            <v-progress-circular indeterminate size="16" width="2" color="light-blue-accent-2" />
            <p class="text-caption text-grey-lighten-1 default-title-letter">Oyun aranıyor...</p>
          </div>
          <p v-if="noGameFound" class="text-caption text-grey-lighten-1 library-empty-msg">
            <v-icon icon="mdi-gamepad-variant-outline" size="small" class="mr-1" />
            Aradığınız oyun bulunamadı.
          </p>
        </div>

        <div class="to-play-games-grid mt-4 mt-lg-6">
          <Game_Card
            density="comfortable"
            :loading="isGettingToPlayGames"
            :arr="toPlayGames"
            :on-row-click="handleRowClick"
          />
        </div>
      </section>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { getDocs, collection } from "firebase/firestore";
import pkg from "lodash";
import store from "~/store/store";
import _ from "lodash";
import Game_Card from "~/components/common/Game_Card.vue";
import { slugify } from "~/composables/core/basicFunc";

useHead({
  title: "npmrungame | Oynayacaklarım",
});

const { $firestore } = useNuxtApp();
const { sumBy } = pkg;

const _store = store();
const router = useRouter();
const display = useDisplay();

const smallScreen = computed(() => display.smAndDown.value);
const ringSize = computed(() => (smallScreen.value ? 56 : 64));

const isGettingToPlayGames = ref(false);
const isLoadingSearchGame = ref(false);
const noGameFound = ref(false);
const searchFocused = ref(false);

const allToPlayGames = ref<any[]>([]);
const toPlayGames = ref<any[]>([]);
const searchText = ref("");
const searchInputRef = ref<HTMLInputElement | null>(null);
const searchInputMobileRef = ref<HTMLInputElement | null>(null);

const BACKLOG_GOAL = 50;

const totalGamesCount = computed(() => allToPlayGames.value.length);

const totalPlaytime = computed(() =>
  sumBy(allToPlayGames.value, (g: any) => Number(g.playtime) || 0)
);

const collectionMilestone = computed(() => BACKLOG_GOAL);

const collectionProgress = computed(() => {
  if (!totalGamesCount.value) return 0;
  return Math.min(100, Math.round((totalGamesCount.value / BACKLOG_GOAL) * 100));
});

const playtimeMilestone = computed(() => {
  const t = totalPlaytime.value;
  if (t <= 0) return 500;
  return Math.max(500, Math.ceil(t / 500) * 500);
});

const playtimeProgress = computed(() => {
  if (!totalPlaytime.value) return 0;
  return Math.min(100, Math.round((totalPlaytime.value / playtimeMilestone.value) * 100));
});

const avgMetacritic = computed(() => {
  const scores = allToPlayGames.value
    .map((g) => g.metacritic)
    .filter((v) => v != null && !Number.isNaN(Number(v)));
  return scores.length ? sumBy(scores, (v) => Number(v)) / scores.length : 0;
});

const metaRatedCount = computed(
  () => allToPlayGames.value.filter((g) => g.metacritic != null).length
);

const metaProgress = computed(() => Math.round(avgMetacritic.value));

const metaRingColor = computed(() => {
  const s = metaProgress.value;
  if (s >= 85) return "#4fc3f7";
  if (s >= 70) return "#81d4fa";
  if (s >= 50) return "#ffb74d";
  return "#ef5350";
});

const genreCountMap = computed(() => {
  const map: Record<string, number> = {};
  for (const game of allToPlayGames.value) {
    const seen = new Set<string>();
    for (const genre of game.genres ?? []) {
      const name = genre?.name;
      if (!name || seen.has(name)) continue;
      seen.add(name);
      map[name] = (map[name] || 0) + 1;
    }
  }
  return map;
});

const mostCommonGenre = computed(() => {
  const entries = Object.entries(genreCountMap.value);
  if (!entries.length) return "—";
  return entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
});

const topGenreGameCount = computed(() => genreCountMap.value[mostCommonGenre.value] ?? 0);

const topGenreShare = computed(() => {
  if (!totalGamesCount.value || !topGenreGameCount.value) return 0;
  return Math.round((topGenreGameCount.value / totalGamesCount.value) * 100);
});

const uniqueGenreCount = computed(() => Object.keys(genreCountMap.value).length);

const genreBreakdown = computed(() => {
  const total = totalGamesCount.value;
  if (!total) return [];

  const sorted = Object.entries(genreCountMap.value)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const maxCount = sorted[0]?.[1] ?? 1;

  return sorted.map(([name, count]) => ({
    name,
    count,
    shareOfLibrary: Math.round((count / total) * 100),
    barWidth: Math.round((count / maxCount) * 100),
  }));
});

const applySearch = () => {
  const q = searchText.value?.trim().toLowerCase();

  if (!q || q.length < 2) {
    toPlayGames.value = [...allToPlayGames.value];
    noGameFound.value = false;
    isLoadingSearchGame.value = false;
    return;
  }

  const filtered = allToPlayGames.value.filter((game: any) =>
    game?.name?.toLowerCase().includes(q)
  );

  toPlayGames.value = filtered;
  noGameFound.value = filtered.length === 0;
  isLoadingSearchGame.value = false;
};

const debouncedSearch = _.debounce(() => {
  isLoadingSearchGame.value = true;
  applySearch();
}, 280);

const clearSearch = () => {
  searchText.value = "";
  applySearch();
};

const focusSearch = () => {
  const el = searchInputRef.value ?? searchInputMobileRef.value;
  el?.focus();
};

const onSearchHotkey = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    focusSearch();
  }
};

const getToPlayGames = async () => {
  try {
    isGettingToPlayGames.value = true;
    const gamesCol = collection($firestore, "to_play_games");
    const gamesSnapshot = await getDocs(gamesCol);
    const gamesList = gamesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const sorted = _.sortBy(gamesList, (g: any) => g.released).reverse();
    allToPlayGames.value = sorted;
    applySearch();
  } catch (error) {
    console.error("Error getting games :", error);
    return [];
  } finally {
    setTimeout(() => {
      isGettingToPlayGames.value = false;
    }, 250);
  }
};

const handleRowClick = (item: any) => {
  _store.setActiveDetailedGame(item.id, item.name);
  router.push(`/game-detail/${slugify(item.name)}`);
};

const sortGames = (games: any[], type: "new" | "old" | "meta") => {
  if (!games || games.length === 0) return [];

  if (type === "meta") {
    const byMeta = _.sortBy(games, (g) => g?.metacritic ?? 0);
    return byMeta.reverse();
  }

  const byDate = _.sortBy(games, (g) => g?.released ?? 0);

  return type === "new" ? byDate.reverse() : byDate;
};

const sortBy = (mode: "new" | "old" | "meta") => {
  allToPlayGames.value = sortGames(allToPlayGames.value, mode);
  applySearch();
};

watch(searchText, () => debouncedSearch());

onMounted(() => {
  getToPlayGames();
  window.addEventListener("keydown", onSearchHotkey);
});

onUnmounted(() => {
  debouncedSearch.cancel();
  window.removeEventListener("keydown", onSearchHotkey);
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/completed_games.css";
@import "~/assets/css/to_play_games.css";
</style>
