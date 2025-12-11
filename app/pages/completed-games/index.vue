<template>
  <v-responsive height="100" v-if="!smallScreen" />
  <v-responsive height="70" v-else />

  <v-container class="pa-2 pa-md-5 pa-lg-10 pa-xl-15">
    <v-row
      class="d-flex justify-start align-center mx-auto"
      :density="smallScreen ? 'compact' : 'comfortable'"
    >
      <!-- Total Game -->
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="rounded-lg d-flex flex-column align-center justify-center ga-2 pa-2 pa-lg-5"
          :min-height="isMediumScreen ? 100 : 'auto'"
        >
          <p
            class="text-center text-caption text-lg-subtitle-2 text-xl-subtitle-1 default-title-letter text-grey-lighten-1"
          >
            Toplam Oyun
          </p>

          <v-progress-circular
            v-if="isGettingCompletedGames"
            size="20"
            width="2"
            color="green-accent-2"
            indeterminate
          />
          <p
            v-else
            class="text-green-accent-2 text-subtitle-2 text-md-subtitle-1 text-xl-h5 font-weight-bold default-title-letter"
          >
            {{ completedGames?.length }}
          </p>
        </v-card>
      </v-col>

      <!-- Total Playtime -->
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="rounded-lg d-flex flex-column align-center justify-center ga-2 pa-2 pa-lg-5"
          :min-height="isMediumScreen ? 100 : 'auto'"
        >
          <p
            class="text-center text-caption text-lg-subtitle-2 text-xl-subtitle-1 default-title-letter text-grey-lighten-1"
          >
            Toplam Bitirme Süresi
          </p>

          <v-progress-circular
            v-if="isGettingCompletedGames"
            size="20"
            width="2"
            color="green-accent-2"
            indeterminate
          />
          <p
            v-else
            class="text-green-accent-2 text-subtitle-2 text-md-subtitle-1 text-xl-h5 font-weight-bold default-title-letter"
          >
            {{ `${totalPlaytime} saat` }}
          </p>
        </v-card>
      </v-col>

      <!-- Common Genre -->
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="rounded-lg d-flex flex-column align-center justify-center ga-2 pa-2 pa-lg-5"
          :min-height="isMediumScreen ? 100 : 'auto'"
        >
          <p
            class="text-center text-caption text-lg-subtitle-2 text-xl-subtitle-1 default-title-letter text-grey-lighten-1"
          >
            En Yaygın Tür
          </p>
          <v-progress-circular
            v-if="isGettingCompletedGames"
            size="20"
            width="2"
            color="green-accent-2"
            indeterminate
          />
          <p
            v-else
            class="text-green-accent-2 text-subtitle-2 text-md-subtitle-1 text-xl-h5 font-weight-bold default-title-letter"
          >
            {{ mostCommonGenre }}
          </p>
        </v-card>
      </v-col>

      <!-- Avg Metacritic Point -->
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="rounded-lg d-flex flex-column align-center justify-center ga-2 pa-2 pa-lg-5"
          :min-height="isMediumScreen ? 100 : 'auto'"
        >
          <p
            class="text-center text-caption text-lg-subtitle-2 text-xl-subtitle-1 default-title-letter text-grey-lighten-1"
          >
            Ortalama Metacritic Puan
          </p>

          <v-progress-circular
            v-if="isGettingCompletedGames"
            size="20"
            width="2"
            color="green-accent-2"
            indeterminate
          />
          <p
            v-else
            class="text-green-accent-2 text-subtitle-2 text-md-subtitle-1 text-xl-h5 font-weight-bold default-title-letter"
          >
            {{ avgMetacritic?.toFixed(0) }}
          </p>
        </v-card>
      </v-col>

      <!-- Completed Games  -->
      <v-col cols="12">
        <div
          class="d-flex align-center justify-center justify-sm-start ga-2 ga-lg-5 mt-2 mt-lg-5"
        >
          <v-icon icon="mdi-trophy-outline" :size="smallScreen ? 'small' : 'x-large'" />
          <p
            class="shadowed-text text-subtitle-2 text-sm-subtitle-1 text-lg-h5 text-xl-h4 default-title-letter"
          >
            Bitirdiğim Oyunlar
          </p>
        </div>

        <v-divider color="white" class="w-100 mt-2 mb-5" />
      </v-col>

      <Game_Card
        :loading="isGettingCompletedGames"
        :arr="completedGames"
        :onRowClick="handleRowClick"
      />
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import axios from "axios";
import { getDocs, collection, addDoc } from "firebase/firestore";
import pkg from "lodash";
import store from "~/store/store";
import Game_Card from "~/components/common/Game_Card.vue";

useHead({
  title: "npmrungame | Bitirdiğim Oyunlar",
});

const { $firestore } = useNuxtApp();
const { sumBy, flatMap, chain } = pkg;

const _store = store();
const router = useRouter();
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

const handleRowClick = (item: any) => {
  _store.setActiveDetailedGame(item.id, item.name);
  router.replace(`/game-detail/${item.name}`);
};

onMounted(() => {
  getCompletedGames();
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/completed_games.css";
</style>
