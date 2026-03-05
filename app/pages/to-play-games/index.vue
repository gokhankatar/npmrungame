<template>
  <v-responsive height="70" />

  <v-container class="pa-2 pa-md-5 pa-lg-10 pa-xl-15">
    <v-row class="d-flex justify-start align-center mx-auto" :dense="smallScreen">
      <!-- Total Game -->
      <v-col cols="12" sm="6" md="3" class="d-flex">
        <v-card class="stat-card stat-card-games rounded-xl pa-4 h-100 w-100">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex flex-column ga-1">
              <p class="stat-card-label default-title-letter">Toplam Oyun</p>
              <v-progress-circular
                v-if="isGettingToPlayGames"
                size="24"
                width="2"
                color="green-accent-2"
                indeterminate
              />
              <p v-else class="stat-card-value">{{ toPlayGames?.length }}</p>
            </div>
            <v-icon icon="mdi-trophy-outline" class="stat-card-icon" color="green-accent-2" size="40" />
          </div>
        </v-card>
      </v-col>

      <!-- Total Playtime -->
      <v-col cols="12" sm="6" md="3" class="d-flex">
        <v-card class="stat-card stat-card-time rounded-xl pa-4 h-100 w-100">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex flex-column ga-1">
              <p class="stat-card-label default-title-letter">Bitirme Süresi</p>
              <v-progress-circular
                v-if="isGettingToPlayGames"
                size="24"
                width="2"
                color="green-accent-2"
                indeterminate
              />
              <p v-else class="stat-card-value">{{ `${totalPlaytime} saat` }}</p>
            </div>
            <v-icon icon="mdi-timer-outline" class="stat-card-icon" color="green-accent-2" size="40" />
          </div>
        </v-card>
      </v-col>

      <!-- Common Genre -->
      <v-col cols="12" sm="6" md="3" class="d-flex">
        <v-card class="stat-card stat-card-genre rounded-xl pa-4 h-100 w-100">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex flex-column ga-1 flex-grow-1 stat-card-genre-text">
              <p class="stat-card-label default-title-letter">En Yaygın Tür</p>
              <v-progress-circular
                v-if="isGettingToPlayGames"
                size="24"
                width="2"
                color="green-accent-2"
                indeterminate
              />
              <p v-else class="stat-card-value text-truncate">{{ mostCommonGenre }}</p>
            </div>
            <v-icon icon="mdi-tag-outline" class="stat-card-icon flex-shrink-0" color="green-accent-2" size="40" />
          </div>
        </v-card>
      </v-col>

      <!-- Avg Metacritic Point -->
      <v-col cols="12" sm="6" md="3" class="d-flex">
        <v-card class="stat-card stat-card-metacritic rounded-xl pa-4 h-100 w-100">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex flex-column ga-1">
              <p class="stat-card-label default-title-letter">Ortalama Metacritic</p>
              <v-progress-circular
                v-if="isGettingToPlayGames"
                size="24"
                width="2"
                color="green-accent-2"
                indeterminate
              />
              <p v-else class="stat-card-value">{{ avgMetacritic?.toFixed(0) }}</p>
            </div>
            <v-icon icon="mdi-star-outline" class="stat-card-icon" color="green-accent-2" size="40" />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <div
            class="d-flex align-center justify-center justify-sm-start ga-2 ga-lg-5 mt-2 mt-lg-5"
          >
            <v-icon
              icon="mdi-gamepad-variant-outline"
              color="blue-grey-darken-1"
              :size="smallScreen ? 'small' : 'default'"
            />
            <Animated_Text
              text="Oynayacağım Oyunlar"
              class="d-flex justify-center justify-sm-start align-center"
              :msPerChar="50"
              :duration="550"
              :loop="true"
            />
          </div>

          <!-- Action & Filter -->
          <div class="d-flex align-center ga-1 ga-lg-2">
            <v-text-field
              v-if="!display.smAndDown.value"
              v-model="searchText"
              @input="searchGame"
              variant="outlined"
              label="Ara..."
              density="compact"
              clearable
              rounded="xl"
              :elevation="0"
              width="300"
              prepend-inner-icon="mdi-magnify"
              class="text-grey-lighten-1 mt-5"
            />

            <v-menu
              :close-on-content-click="true"
              :offset="[5, 10]"
              location="bottom end"
            >
              <template #activator="{ props }">
                <v-btn
                  v-if="!display.xs.value"
                  v-bind="props"
                  icon="mdi-sort"
                  class="rounded text-caption text-lg-subtitle-2"
                  :ripple="false"
                  variant="text"
                  rounded="xl"
                  color="grey-lighten-1"
                  :size="display.smAndDown.value ? 'x-small' : 'small'"
                />
              </template>

              <v-card
                class="pa-1 pa-sm-2"
                :ripple="false"
                style="
                  background: rgba(0, 0, 0, 0.2);
                  border: 1px solid rgba(255, 255, 255, 0.15);
                  backdrop-filter: blur(0.5rem);
                  -webkit-backdrop-filter: blur(0.5rem);
                "
                elevation="2"
              >
                <v-list density="compact" class="bg-transparent">
                  <v-list-item @click="sortBy('meta')" prepend-icon="mdi-star">
                    <v-list-item-title
                      class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                      >Metacritic Puanı</v-list-item-title
                    >
                  </v-list-item>

                  <v-list-item @click="sortBy('new')" prepend-icon="mdi-arrow-up">
                    <v-list-item-title
                      class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                      >Tarihe Göre En Yeni</v-list-item-title
                    >
                  </v-list-item>

                  <v-list-item
                    @click="sortBy('old')"
                    :ripple="false"
                    prepend-icon="mdi-arrow-down"
                  >
                    <v-list-item-title
                      class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                      >Tarihe Göre En Eski</v-list-item-title
                    >
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>

            <v-btn
              icon="mdi-refresh"
              class="rounded text-caption text-lg-subtitle-2"
              :ripple="false"
              variant="text"
              rounded="xl"
              :color="isGettingToPlayGames ? 'green-accent-2' : 'grey-lighten-1'"
              @click="getToPlayGames"
              :size="smallScreen ? 'x-small' : 'small'"
              :loading="isGettingToPlayGames"
            />
          </div>
        </div>
        <v-divider color="white" class="w-100 mt-2 mb-5" />
      </v-col>

      <v-col cols="12" v-if="display.xs.value">
        <v-menu :close-on-content-click="true" :offset="[5, 0]" location="bottom end">
          <template #activator="{ props }">
            <v-btn
              prepend-icon="mdi-sort"
              v-bind="props"
              class="text-caption text-lg-subtitle-2"
              :ripple="false"
              text="Sırala"
              variant="tonal"
              rounded="xl"
              color="grey-lighten-1"
              size="small"
              block
            />
          </template>

          <v-card
            class="pa-1 pa-sm-2"
            :ripple="false"
            style="
              background: rgba(0, 0, 0, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.15);
              backdrop-filter: blur(0.5rem);
              -webkit-backdrop-filter: blur(0.5rem);
            "
            elevation="2"
          >
            <v-list density="compact" class="bg-transparent">
              <v-list-item @click="sortBy('meta')" prepend-icon="mdi-star">
                <v-list-item-title
                  class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                  >Metacritic Puanı</v-list-item-title
                >
              </v-list-item>

              <v-list-item @click="sortBy('new')" prepend-icon="mdi-arrow-up">
                <v-list-item-title
                  class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                  >Tarihe Göre En Yeni</v-list-item-title
                >
              </v-list-item>

              <v-list-item
                @click="sortBy('old')"
                :ripple="false"
                prepend-icon="mdi-arrow-down"
              >
                <v-list-item-title
                  class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                  >Tarihe Göre En Eski</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </v-col>

      <v-col cols="12" v-if="display.smAndDown.value">
        <v-text-field
          v-model="searchText"
          @input="searchGame"
          variant="outlined"
          label="Ara..."
          density="compact"
          clearable
          rounded="xl"
          :elevation="0"
          width="100%"
          prepend-inner-icon="mdi-magnify"
          class="text-grey-lighten-1 mt-2"
        />
      </v-col>

      <!-- After Search  -->
      <v-col cols="12" v-if="isLoadingSearchGame || noGameFound">
        <div v-if="isLoadingSearchGame" class="d-flex align-center ga-1 ga-sm-2 ga-lg-3">
          <v-progress-circular indeterminate size="16" width="2" color="grey-lighten-1" />
          <p
            class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter"
          >
            Oyun Aranıyor...
          </p>
        </div>

        <p v-if="noGameFound" class="text-caption text-grey-lighten-1">
          Aradığınız oyun bulunamadı.
        </p>
      </v-col>

      <Game_Card
        :loading="isGettingToPlayGames"
        :arr="toPlayGames"
        :onRowClick="handleRowClick"
      />
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { getDocs, collection } from "firebase/firestore";
import pkg from "lodash";
import store from "~/store/store";
import _ from "lodash";
import Animated_Text from "~/components/common/Animated_Text.vue";
import Game_Card from "~/components/common/Game_Card.vue";

useHead({
  title: "npmrungame | Oynayacaklarım",
});

const { $firestore } = useNuxtApp();
const { sumBy, flatMap, chain } = pkg;

const _store = store();
const router = useRouter();
const display = useDisplay();
const smallScreen = computed(() => display.smAndDown.value);
const isMediumScreen = computed(() => display.mdAndUp.value);

const isLoadingSearchGame = ref(false);
const noGameFound = ref(false);
const isGettingToPlayGames = ref(false);

const toPlayGames = ref<any[]>([]);
const searchText = ref<string>("");

const totalPlaytime = computed(() => sumBy(toPlayGames.value, "playtime"));

const avgMetacritic = computed(() => {
  const scores = toPlayGames.value.map((g) => g.metacritic).filter(Boolean);
  return scores.length ? sumBy(scores, (v) => v) / scores.length : 0;
});

const mostCommonGenre = computed(() => {
  const allGenres = flatMap(toPlayGames.value, (g) => g.genres.map((gg: any) => gg.name));

  const pairs: [string, number][] = chain(allGenres).countBy().toPairs().value() as [
    string,
    number
  ][];

  if (!pairs.length) return "Unknown";

  const [genre] = pairs.reduce((prev, curr) => (curr[1] > prev[1] ? curr : prev));
  return genre;
});

const getToPlayGames = async () => {
  try {
    isGettingToPlayGames.value = true;
    const gamesCol = collection($firestore, "to_play_games");
    const gamesSnapshot = await getDocs(gamesCol);
    const gamesList = gamesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    toPlayGames.value = _.sortBy(gamesList, (g: any) => g.released).reverse();
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
  router.push(`/game-detail/${item.name}`);
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
  toPlayGames.value = sortGames(toPlayGames.value, mode);
};

const searchGame = async () => {
  try {
    isLoadingSearchGame.value = true;
    noGameFound.value = false;

    const q = searchText.value?.trim().toLowerCase();

    if (q.length > 2) {
      const filtered = toPlayGames.value?.filter((game: any) =>
        game?.name?.toLowerCase().includes(q)
      );

      toPlayGames.value = filtered;

      if (!filtered.length) {
        noGameFound.value = true;
        toPlayGames.value = [];
      }
    }
  } catch (error: any) {
    console.log(error.message);
  } finally {
    isLoadingSearchGame.value = false;
  }
};

watch(
  () => searchText.value,
  (val) => {
    if (!val || val.length < 2) {
      isLoadingSearchGame.value = false;
      noGameFound.value = false;
      getToPlayGames();
      return;
    }
  },
  { immediate: true }
);

onMounted(() => {
  getToPlayGames();
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/completed_games.css";
</style>
