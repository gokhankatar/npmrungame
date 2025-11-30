<template>
  <v-responsive height="100" />

  <v-container class="pa-2 pa-md-5 pa-lg-10 pa-xl-15">
    <v-row class="d-flex justify-start align-center mx-auto" :density="smallScreen ? 'compact' : 'comfortable'">
      <!-- Total Game -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-lg d-flex flex-column align-center justify-center ga-2 pa-2 pa-lg-5"
          :min-height="isMediumScreen ? 100 : 'auto'">
          <p
            class="text-center text-caption text-lg-subtitle-2 text-xl-subtitle-1 default-title-letter text-grey-lighten-1">
            Toplam Oyun
          </p>

          <v-progress-circular v-if="isGettingCompletedGames" size="20" width="2" color="green-accent-2"
            indeterminate />
          <p v-else
            class="text-green-accent-2 text-subtitle-2 text-md-subtitle-1 text-xl-h5 font-weight-bold default-title-letter">
            {{ completedGames?.length }}
          </p>
        </v-card>
      </v-col>

      <!-- Total Playtime -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-lg d-flex flex-column align-center justify-center ga-2 pa-2 pa-lg-5"
          :min-height="isMediumScreen ? 100 : 'auto'">
          <p
            class="text-center text-caption text-lg-subtitle-2 text-xl-subtitle-1 default-title-letter text-grey-lighten-1">
            Toplam Bitirme Süresi
          </p>

          <v-progress-circular v-if="isGettingCompletedGames" size="20" width="2" color="green-accent-2"
            indeterminate />
          <p v-else
            class="text-green-accent-2 text-subtitle-2 text-md-subtitle-1 text-xl-h5 font-weight-bold default-title-letter">
            {{ `${totalPlaytime} saat` }}
          </p>
        </v-card>
      </v-col>

      <!-- Common Genre -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-lg d-flex flex-column align-center justify-center ga-2 pa-2 pa-lg-5"
          :min-height="isMediumScreen ? 100 : 'auto'">
          <p
            class="text-center text-caption text-lg-subtitle-2 text-xl-subtitle-1 default-title-letter text-grey-lighten-1">
            En Yaygın Tür
          </p>
          <v-progress-circular v-if="isGettingCompletedGames" size="20" width="2" color="green-accent-2"
            indeterminate />
          <p v-else
            class="text-green-accent-2 text-subtitle-2 text-md-subtitle-1 text-xl-h5 font-weight-bold default-title-letter">
            {{ mostCommonGenre }}
          </p>
        </v-card>
      </v-col>

      <!-- Avg Metacritic Point -->
      <v-col cols="12" sm="6" md="3">
        <v-card class="rounded-lg d-flex flex-column align-center justify-center ga-2 pa-2 pa-lg-5"
          :min-height="isMediumScreen ? 100 : 'auto'">
          <p
            class="text-center text-caption text-lg-subtitle-2 text-xl-subtitle-1 default-title-letter text-grey-lighten-1">
            Ortalama Metacritic Puan
          </p>

          <v-progress-circular v-if="isGettingCompletedGames" size="20" width="2" color="green-accent-2"
            indeterminate />
          <p v-else
            class="text-green-accent-2 text-subtitle-2 text-md-subtitle-1 text-xl-h5 font-weight-bold default-title-letter">
            {{ avgMetacritic?.toFixed(0) }}
          </p>
        </v-card>
      </v-col>

      <v-col cols="12">
        <div class="d-flex align-center justify-center justify-sm-start ga-2 ga-lg-5 mt-2 mt-lg-5">
          <v-icon icon="mdi-trophy-outline" :size="smallScreen ? 'small' : 'x-large'" />
          <p class="shadowed-text text-subtitle-2 text-sm-subtitle-1 text-lg-h5 text-xl-h4 default-title-letter">
            Bitirdiğim Oyunlar
          </p>
        </div>

        <v-divider color="white" class="w-100 mt-2 mb-5" />
      </v-col>

      <v-col v-for="(item, index) of completedGames" :key="index" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader v-if="isGettingCompletedGames" type="card" class="rounded-lg h-100" />

        <v-card v-if="!isGettingCompletedGames" class="game-card bg-transparent rounded-lg cursor-pointer transition"
          :height="smallScreen ? 250 : 375" :ripple="false" @click="handleRowClick(item)">
          <v-img :src="item.background_image" class="game-card-img h-100 rounded-lg" cover />

          <!-- Playtime -->
          <v-tooltip text="Toplam oynama süresi (Ana Hikaye)" location="top">
            <template #activator="{ props }">
              <v-chip v-if="item.playtime" v-bind="props" class="playtime-icon rounded-xl ma-1 ma-lg-2" :ripple="false"
                size="small" variant="elevated" prepend-icon="mdi-timer-outline" color="black"
                :text="`${item.playtime} saat`" />
            </template>
          </v-tooltip>

          <!-- Metacritic -->
          <v-tooltip text="Metacritic puanı" location="top">
            <template #activator="{ props }">
              <v-chip v-if="item.metacritic" v-bind="props" class="metacritic-point rounded-xl ma-1 ma-lg-2"
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
              <v-chip v-for="(genre, index) in item.genres" :key="index" :size="smallScreen ? 'x-small' : 'small'"
                variant="outlined" :ripple="false" :text="genre.name" />
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
</template>

<script lang="ts" setup>
import axios from "axios";
import { doc, getDocs, collection, addDoc } from "firebase/firestore";
import pkg from "lodash";
import {
  getUniquePlatformIcons,
  useLimitedTags,
  useMetacriticStyle,
} from "~/composables/data/handleData";
import fireAnimation from "~/assets/img/fire_anim.gif";
import { truncateText } from "~/composables/core/basicFunc";
import store from "~/store/store";

useHead({
  title: "npmrungame | Bitirdiğim Oyunlar",
});

const { $firestore } = useNuxtApp();
const { sumBy, flatMap, chain } = pkg;

const _store = store();
const router = useRouter();
const config = useRuntimeConfig();
const display = useDisplay();
const smallScreen = computed(() => display.smAndDown.value);
const isMediumScreen = computed(() => display.mdAndUp.value);

const completedGames = ref<any[]>([]);
const isGettingCompletedGames = ref(false);
const isAddingToDb = ref(false);

const getCompletedGames = async () => {
  try {
    isGettingCompletedGames.value = true;
    const gamesCol = collection($firestore, "completed_games");
    const gamesSnapshot = await getDocs(gamesCol);
    const gamesList = gamesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    completedGames.value = gamesList;
  } catch (error) {
    console.error("Error getting games :", error);
    return [];
  } finally {
    setTimeout(() => {
      isGettingCompletedGames.value = false;
    }, 250);
  }
};

const totalPlaytime = computed(() => sumBy(completedGames.value, "playtime"));

const avgMetacritic = computed(() => {
  const scores = completedGames.value.map((g) => g.metacritic).filter(Boolean);
  return scores.length ? sumBy(scores, (v) => v) / scores.length : 0;
});

const mostCommonGenre = computed(() => {
  const allGenres = flatMap(completedGames.value, (g) =>
    g.genres.map((gg: any) => gg.name)
  );

  const pairs: [string, number][] = chain(allGenres).countBy().toPairs().value() as [
    string,
    number
  ][];

  if (!pairs.length) return "Unknown";

  const [genre] = pairs.reduce((prev, curr) => (curr[1] > prev[1] ? curr : prev));
  return genre;
});

const addToCompletedGamesToDb = async (slug: string) => {
  try {
    isAddingToDb.value = true;
    const game = await axios.get(
      `https://api.rawg.io/api/games/${slug}?key=${config.public.apiKey}`
    );
    const docRef = await addDoc(collection($firestore, "completed_games"), game.data);

    console.log("RAWG oyunu Firestore'a eklendi:", docRef.id);
  } catch (error: any) {
    console.error("Error while adding game to db : ", error.message);
  } finally {
    isAddingToDb.value = false;
  }
};

const handleRowClick = (item: any) => {
  _store.setActiveDetailedGame(item.id, item.name)
  router.replace(`/game-detail/${item.name}`)
}

onMounted(() => {
  getCompletedGames();
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/completed_games.css";
</style>
