<template>
  <Anim_Recommend_Game />

  <v-container class="pa-2 pa-md-5 pa-lg-10 pa-xl-15">
    <v-row class="w-100 mx-auto" v-if="recommendedGames?.length > 0">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center w-100">
          <p class="text-subtitle-2 text-sm-subtitle-1 text-xl-h5 default-title-letter text-deep-purple-lighten-1">
            Daha Önce Önerilen Oyunlar
          </p>
          <v-btn @click="getRecommendedGames" :loading="isGettingRecommendedGames" variant="text" :ripple="false"
            :color="isGettingRecommendedGames ? 'deep-purple' : 'grey-lighten-1'" icon="mdi-refresh"
            :size="display.smAndDown.value ? 'small' : 'default'" />
        </div>

        <v-divider class="mt-2 mb-3 mb-lg-6" />
      </v-col>

      <Game_Card :arr="recommendedGames" :loading="isGettingRecommendedGames" :onRowClick="handleRowClick" />
    </v-row>

    <!-- Recommend Game Section -->
    <v-row class="my-5 my-lg-8 w-100 mx-auto d-flex flex-column justify-center align-center">
      <v-col cols="12" sm="8" lg="6" xl="4">
        <v-btn v-if="!isOpenRecommendGame" @click="isOpenRecommendGame = true" class="default-title-letter"
          text="Oyun Öner" variant="elevated" :size="display.smAndDown.value ? 'default' : 'x-large'" rounded="xl"
          :ripple="false" :elevation="0" block prepend-icon="mdi-microsoft-xbox-controller" color="deep-purple" />
        <v-btn v-else @click="isOpenRecommendGame = false" class="default-title-letter" text="Iptal" variant="elevated"
          :size="display.smAndDown.value ? 'default' : 'x-large'" rounded="xl" :ripple="false" :elevation="0" block
          prepend-icon="mdi-close" />
      </v-col>

      <!-- Recommend Game Form -->
      <transition name="slide-down">
        <v-col cols="12" lg="8" xl="6" v-if="isOpenRecommendGame">
          <v-form class="recommend-game-form-container pa-5 pa-lg-10 rounded-lg" ref="recommendGameForm"
            @submit.prevent="handleRecommendGame">
            <v-text-field v-model="models.name" :rules="rules.name" rounded="xl" label="Ad" type="text"
              variant="outlined" class="default-title-letter text-grey-lighten-2" prepend-inner-icon="mdi-account"
              :density="display.smAndDown.value ? 'compact' : 'comfortable'" clearable />
            <v-text-field v-model="models.email" :rules="rules.email" rounded="xl" label="Email" type="email"
              variant="outlined" class="default-title-letter text-grey-lighten-2" prepend-inner-icon="mdi-email"
              :density="display.smAndDown.value ? 'compact' : 'comfortable'" clearable />
            <v-textarea rounded="xl" label="Neden Bu Oyun/Oyunlar" variant="outlined" counter
              class="default-title-letter text-grey-lighten-2" prepend-inner-icon="mdi-email"
              :density="display.smAndDown.value ? 'compact' : 'comfortable'" clearable />

            <div class="add-game-container d-flex flex-column align-center ga-2 ga-lg-4 rounded">
              <v-text-field v-model="searchGameText" @input="searchGame" prepend-inner-icon="mdi-magnify"
                variant="outlined" class="w-100 text-grey-lighten-1" color="grey-lighten-1" rounded="xl"
                label="Oyun Ara" placeholder="Black Myth Wukong..."
                :density="display.xl.value ? 'comfortable' : 'compact'" clearable />

              <transition name="slide-up">
                <v-alert v-if="showNoGameSelectedWarning" type="warning" variant="tonal" density="compact"
                  class="text-caption w-100" text="Lütfen en az 1 oyun seç." />
              </transition>

              <transition name="slide-up">
                <v-alert v-if="showMaxLimitWarning" type="warning" variant="tonal" density="compact"
                  class="text-caption w-100" text="En fazla 3 oyun önerebilirsin." />
              </transition>

              <!-- 🔥 Arama sonuç alanı -->
              <div v-if="searchGameText?.length" class="w-100" style="max-height: 350px; overflow-y: auto">
                <!-- Loading -->
                <div v-if="isSearchingGameLoading" class="d-flex justify-start py-2 py-lg-4">
                  <v-progress-circular indeterminate size="24" color="grey-lighten-1" />
                </div>

                <!-- Search Results -->
                <template v-else>
                  <p v-if="searchResults?.length"
                    class="text-caption text-grey-darken-1 text-start default-title-letter">
                    {{ `${searchResults?.length} oyun bulundu` }}
                  </p>
                  <v-card v-for="game in searchResults" :key="game.id" :ripple="false"
                    class="research-game pa-2 mb-2 d-flex align-center ga-3 rounded-lg cursor-pointer"
                    @click="selectGameAfterSearch(game)" :class="{
                      'selected-research-game': selectedGamesAfterResearch.some(
                        (i) => i.id === game.id
                      ),
                    }">
                    <v-avatar :size="display.smAndDown.value ? 30 : 48" rounded>
                      <v-img :src="game.background_image" :alt="game.name" cover />
                    </v-avatar>

                    <div class="d-flex flex-column">
                      <p class="text-caption text-lg-subtitle-2 default-title-letter" :class="selectedGamesAfterResearch.some((i) => i.id === game.id)
                        ? 'text-grey-lighten-3'
                        : 'text-grey-lighten-1'
                        ">
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

              <v-row class="w-100 mx-auto d-flex align-center" :class="selectedGamesAfterResearch.length == 0
                ? 'justify-end'
                : 'justify-center'
                " dense>
                <v-col cols="12" sm="6">
                  <v-btn @click="handleRecommendGame" :loading="isAddingToDb" :text="selectedGamesAfterResearch.length > 0
                    ? `Öner (${selectedGamesAfterResearch?.length})`
                    : 'Öner'
                    " :size="display.smAndDown.value ? 'small' : 'large'" :ripple="false" prepend-icon="mdi-plus"
                    variant="elevated" color="deep-purple" rounded="xl" class="text-capitalize" block />
                </v-col>

                <v-col cols="12" sm="6" v-if="selectedGamesAfterResearch?.length > 0">
                  <v-btn @click="selectedGamesAfterResearch = []" text="Tüm Seçimleri Kaldır" variant="tonal"
                    color="warning" :size="display.smAndDown.value ? 'small' : 'large'" rounded="xl" :ripple="false"
                    class="text-capitalize" prepend-icon="mdi-broom" block />
                </v-col>
              </v-row>

              <transition name="slide-up">
                <v-row class="w-100" v-if="isAddedToDb">
                  <v-col cols="12">
                    <v-alert class="w-100 text-caption text-lg-subtitle-2" density="compact" color="success"
                      variant="text" :text="`${addedGameToDbCount} oyun eklendi`" />
                  </v-col>
                </v-row>
              </transition>
            </div>
          </v-form>
        </v-col>
      </transition>
    </v-row>
  </v-container>
  <v-dialog v-model="isAddedToDb" :max-width="600" style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.2rem);
      -webkit-backdrop-filter: blur(0.2rem);
    ">
    <div
      class="successfull-recommended-pop-up-container d-flex flex-column align-center ga-1 ga-lg-3 pa-2 pa-md-5 pa-lg-10 rounded-lg w-100">
      <v-btn class="successfull-recommended-pop-up-container-close-btn ma-1 ma-lg-2" variant="text" size="small"
        icon="mdi-close" color="grey" :ripple="false" @click="isAddedToDb = false" />

      <v-img v-if="msgGenre == 'successfull'" :src="successfullyDoneImg" :width="display.smAndDown.value ? 50 : 75" />
      <p class="text-center text-subtitle-2 text-lg-subtitle-1 text-grey-lighten-1 default-title-letter">
        {{ dialogMsg }}
      </p>
    </div>
  </v-dialog>
</template>
<script lang="ts" setup>
import axios from "axios";
import { VForm } from "vuetify/components";
import { getDocs, collection, addDoc, writeBatch, doc } from "firebase/firestore";
import Game_Card from "~/components/common/Game_Card.vue";
import { useMetacriticStyle } from "~/composables/data/handleData";
import store from "~/store/store";
import _ from "lodash";
import Anim_Recommend_Game from "~/components/layout/Anim_Recommend_Game.vue";
import successfullyDoneImg from "~/assets/img/successfully_done_anim.gif";

useHead({
  title: "npmrungame | Oyun Öner",
});

const { $firestore } = useNuxtApp();

const _store = store();
const router = useRouter();
const display = useDisplay();

const recommendGameForm = ref<InstanceType<typeof VForm> | null>(null);

const isGettingRecommendedGames = ref(false);
const isSearchingGameLoading = ref(false);
const isAddingToDb = ref(false);
const isAddedToDb = ref(false);
const showMaxLimitWarning = ref(false);
const showNoGameSelectedWarning = ref(false);
const isOpenRecommendGame = ref(false);
const isGettingCompletedGames = ref(false);
const isGettingToPlayGames = ref(false);

const addedGameToDbCount = ref(0);
const msgGenre = ref<"successfull" | "warning">("successfull");
const dialogMsg = ref<string>("");
const searchGameText = ref<string>("");
const recommendedGames = ref<any[]>([]);
const completedGames = ref<any[]>([]);
const toPlayGames = ref<any[]>([]);
const selectedGamesAfterResearch = ref<any[]>([]);
const searchResults = ref<any[]>([]);

const models = ref({
  name: "",
  email: "",
  suggestionText: "",
});

const rules = ref({
  name: [
    (v: string) => !!v || "Adınız Gerekli",
    (v: string) => (v && v.length >= 3) || "Adnınız en az 3 karakter olmalı",
  ],
  email: [
    (v: string) => !!v || "Email Gerekli!",
    (v: string) =>
      (v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) || "Geçerli mail adresi giriniz",
  ],
});

const selectGameAfterSearch = (game: any) => {
  const idx = selectedGamesAfterResearch.value.findIndex((g) => g.id === game.id);
  if (idx !== -1) {
    selectedGamesAfterResearch.value.splice(idx, 1);
    return;
  }

  // ❗ Max 3 Game
  if (selectedGamesAfterResearch.value.length >= 3) {
    showMaxLimitWarning.value = true;
    setTimeout(() => (showMaxLimitWarning.value = false), 2000);
    return;
  }

  selectedGamesAfterResearch.value.push(game);
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

      const results = data?.results ?? [];

      const excludedIds = new Set([
        ...recommendedGames.value?.map((g: any) => g.id),
        ...completedGames.value?.map((g: any) => g.id),
        ...toPlayGames.value?.map((g: any) => g.id),
      ]);

      searchResults.value = results.filter((game: any) => !excludedIds.has(game.id));
    } else {
      searchResults.value = [];
    }
  } catch (error: any) {
    console.log(error.message);
  } finally {
    isSearchingGameLoading.value = false;
  }
};

const resetForm = async () => {
  searchGameText.value = "";

  models.value.name = "";
  models.value.email = "";
  models.value.suggestionText = "";
  selectedGamesAfterResearch.value = [];

  await nextTick();
  recommendGameForm.value?.reset();
  recommendGameForm.value?.resetValidation();
};

const addGameToRecommendedGames = async () => {
  const games = selectedGamesAfterResearch.value;

  if (!games || games.length === 0) return;

  try {
    isAddingToDb.value = true;
    addedGameToDbCount.value = games.length;

    const metadata = {
      recommender_name: models.value?.name || null,
      recommender_email: models.value?.email || null,
      recommender_suggestion_msg: models.value?.suggestionText || null,
      recommended_at: new Date().toISOString(),
    };

    // ---------------------------
    // 🔥 SINGLE GAME
    // ---------------------------
    if (games.length === 1) {
      const game = games[0];

      const finalGameData = { ...game, ...metadata };
      await addDoc(collection($firestore, "recommended_games"), finalGameData);

      await addDoc(collection($firestore, "notifications"), {
        game_name: game?.name || game?.title || null,
        recommender_name: metadata.recommender_name,
        recommender_email: metadata.recommender_email,
        status: "recommended_game",
        read_status: false,
        created_at: new Date().toISOString(),
      });

      resetForm();
      msgGenre.value = "successfull";
      dialogMsg.value = "Oyun öneriniz başarıyla iletildi! 🎉";
      isAddedToDb.value = true;
      setTimeout(() => (isAddedToDb.value = false), 2500);

      return;
    }

    // ---------------------------
    // 🔥 MULTIPLE GAME — (Batch)
    // ---------------------------
    const batch = writeBatch($firestore);

    games.forEach((g) => {
      const ref = doc(collection($firestore, "recommended_games"));
      const finalGameData = { ...g, ...metadata };
      batch.set(ref, finalGameData);

      // notifications
      const notificationRef = doc(collection($firestore, "notifications"));
      batch.set(notificationRef, {
        game_name: g?.name || g?.title || null,
        recommender_name: metadata.recommender_name,
        recommender_email: metadata.recommender_email,
        status: "recommended_game",
        read_status: false,
        created_at: new Date().toISOString(),
      });
    });

    await batch.commit();

    resetForm();
    msgGenre.value = "successfull";
    dialogMsg.value = "Tüm oyun önerileriniz başarıyla iletildi! 🎉";
    isAddedToDb.value = true;
    setTimeout(() => (isAddedToDb.value = false), 3500);
  } catch (error: any) {
    console.error("DB Add Error:", error.message);
  } finally {
    await getRecommendedGames();
    isAddingToDb.value = false;
    selectedGamesAfterResearch.value = [];
  }
};

const getCompletedGames = async () => {
  try {
    isGettingCompletedGames.value = true;

    const gamesCol = collection($firestore, "completed_games");
    const gamesSnapshot = await getDocs(gamesCol);

    const gamesList = gamesSnapshot.docs.map((doc) => ({
      firestoreId: doc.id,
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

const getToPlayGames = async () => {
  try {
    isGettingToPlayGames.value = true;

    const gamesCol = collection($firestore, "to_play_games");
    const gamesSnapshot = await getDocs(gamesCol);

    const gamesList = gamesSnapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
    }));

    toPlayGames.value = gamesList;
  } catch (error) {
    console.error("Error getting games :", error);
    return [];
  } finally {
    setTimeout(() => {
      isGettingToPlayGames.value = false;
    }, 250);
  }
};

const getRecommendedGames = async () => {
  try {
    isGettingRecommendedGames.value = true;
    const gamesCol = collection($firestore, "recommended_games");
    const gamesSnapshot = await getDocs(gamesCol);
    const gamesList = gamesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    recommendedGames.value = _.uniqBy(gamesList, "id");
  } catch (error) {
    console.error("Error getting games :", error);
    return [];
  } finally {
    isGettingRecommendedGames.value = false;
  }
};

const handleRowClick = (item: any) => {
  _store.setActiveDetailedGame(item.id, item.name);
  router.push(`/game-detail/${item.name}`);
};

const handleRecommendGame = async () => {
  if (
    !selectedGamesAfterResearch.value ||
    selectedGamesAfterResearch.value.length === 0
  ) {
    showNoGameSelectedWarning.value = true;

    setTimeout(() => {
      showNoGameSelectedWarning.value = false;
    }, 2000);

    return;
  }

  const result = await recommendGameForm.value?.validate();
  if (!result || !result.valid) return;

  try {
    addGameToRecommendedGames();
  } catch (error: any) {
    console.error("Error while recommend game", error.message);
  } finally {
    recommendGameForm.value?.reset;
    recommendGameForm.value?.resetValidation();
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
  () => isOpenRecommendGame.value,
  async (val) => {
    if (!val) {
      searchResults.value = [];
      isSearchingGameLoading.value = false;

      resetForm();
    }
  }
);

onMounted(() => {
  getToPlayGames();
  getCompletedGames();
  getRecommendedGames();
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/recommended_games.css";
</style>
