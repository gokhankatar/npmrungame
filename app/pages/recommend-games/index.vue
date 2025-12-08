<template>
  <v-responsive height="100" v-if="!display.smAndDown.value" />
  <v-responsive height="70" v-else />

  <v-container class="pa-2 pa-md-5 pa-lg-10 pa-xl-15">
    <v-row class="w-100 mx-auto d-flex flex-column align-center justify-center">
      <v-col cols="12" lg="9" xl="7">
        <p
          class="text-center text-subtitle-1 text-sm-h5 text-xl-h4 default-title-letter text-blue-grey-darken-1"
        >
          npmrungame için oyun öner
        </p>
      </v-col>

      <v-col cols="12" lg="9" xl="7">
        <v-form
          class="recommend-game-form-container pa-5 pa-lg-10 rounded-lg"
          ref="recommendGameForm"
          @submit.prevent="handleRecommendGame"
        >
          <v-text-field
            ref="recommendedGameFormNameInput"
            v-model="models.name"
            :rules="rules.name"
            rounded="xl"
            label="Ad"
            type="text"
            variant="outlined"
            class="default-title-letter text-grey-lighten-2"
            prepend-inner-icon="mdi-account"
            :density="display.smAndDown.value ? 'compact' : 'comfortable'"
            clearable
          />
          <v-text-field
            v-model="models.email"
            :rules="rules.email"
            rounded="xl"
            label="Email"
            type="email"
            variant="outlined"
            class="default-title-letter text-grey-lighten-2"
            prepend-inner-icon="mdi-email"
            :density="display.smAndDown.value ? 'compact' : 'comfortable'"
            clearable
          />
          <v-textarea
            rounded="xl"
            label="Neden Bu Oyun/Oyunlar"
            variant="outlined"
            counter
            class="default-title-letter text-grey-lighten-2"
            prepend-inner-icon="mdi-email"
            :density="display.smAndDown.value ? 'compact' : 'comfortable'"
            clearable
          />

          <div
            class="add-game-container d-flex flex-column align-center ga-2 ga-lg-4 rounded"
          >
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
              :density="display.xl.value ? 'comfortable' : 'compact'"
              clearable
            />

            <transition name="slide-up">
              <v-alert
                v-if="showNoGameSelectedWarning"
                type="warning"
                variant="tonal"
                density="compact"
                class="text-caption w-100"
                text="Lütfen en az 1 oyun seç."
              />
            </transition>

            <transition name="slide-up">
              <v-alert
                v-if="showMaxLimitWarning"
                type="warning"
                variant="tonal"
                density="compact"
                class="text-caption w-100"
                text="En fazla 3 oyun önerebilirsin."
              />
            </transition>

            <!-- 🔥 Arama sonuç alanı -->
            <div
              v-if="searchGameText?.length"
              class="w-100"
              style="max-height: 350px; overflow-y: auto"
            >
              <!-- Loading -->
              <div
                v-if="isSearchingGameLoading"
                class="d-flex justify-start py-2 py-lg-4"
              >
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
                  v-for="game in searchResults"
                  :key="game.id"
                  :ripple="false"
                  class="research-game pa-2 mb-2 d-flex align-center ga-3 rounded-lg cursor-pointer"
                  @click="selectGameAfterSearch(game)"
                  :class="{
                    'selected-research-game': selectedGamesAfterResearch.some(
                      (i) => i.id === game.id
                    ),
                  }"
                >
                  <v-avatar :size="display.smAndDown.value ? 30 : 48" rounded>
                    <v-img :src="game.background_image" :alt="game.name" cover />
                  </v-avatar>

                  <div class="d-flex flex-column">
                    <p
                      class="text-caption text-lg-subtitle-2 default-title-letter"
                      :class="
                        selectedGamesAfterResearch.some((i) => i.id === game.id)
                          ? 'text-grey-lighten-3'
                          : 'text-grey-lighten-1'
                      "
                    >
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

            <v-row
              class="w-100 mx-auto d-flex align-center"
              :class="
                selectedGamesAfterResearch.length == 0 ? 'justify-end' : 'justify-center'
              "
              dense
            >
              <v-col cols="12" sm="6">
                <v-btn
                  @click="handleRecommendGame"
                  :loading="isAddingToDb"
                  :text="
                    selectedGamesAfterResearch.length > 0
                      ? `Öner (${selectedGamesAfterResearch?.length})`
                      : 'Öner'
                  "
                  :size="display.smAndDown.value ? 'small' : 'large'"
                  :ripple="false"
                  prepend-icon="mdi-plus"
                  variant="tonal"
                  color="success"
                  rounded="xl"
                  class="text-capitalize"
                  block
                />
              </v-col>

              <v-col cols="12" sm="6" v-if="selectedGamesAfterResearch?.length > 0">
                <v-btn
                  @click="selectedGamesAfterResearch = []"
                  text="Tüm Seçimleri Kaldır"
                  variant="tonal"
                  color="warning"
                  :size="display.smAndDown.value ? 'small' : 'large'"
                  rounded="xl"
                  :ripple="false"
                  class="text-capitalize"
                  prepend-icon="mdi-broom"
                  block
                />
              </v-col>
            </v-row>

            <transition name="slide-up">
              <v-row class="w-100" v-if="isAddedToDb">
                <v-col cols="12">
                  <v-alert
                    class="w-100 text-caption text-lg-subtitle-2"
                    density="compact"
                    color="success"
                    variant="text"
                    :text="`${addedGameToDbCount} oyun eklendi`"
                  />
                </v-col>
              </v-row>
            </transition>
          </div>
        </v-form>
      </v-col>

      <v-col cols="12" class="mt-3 mt-lg-5 mt-xl-8">
        <p
          class="text-subtitle-2 text-sm-subtitle-1 text-xl-h5 default-title-letter text-blue-grey-darken-1"
        >
          Daha Önce Önerilen Oyunlar
        </p>

        <v-divider class="mt-2 mb-5 mb-lg-8" />
      </v-col>
    </v-row>

    <v-row class="w-100 mx-auto">
      <Game_Card
        :arr="recommendedGames"
        :loading="isGettingRecommendedGames"
        :onRowClick="handleRowClick"
      />
    </v-row>
  </v-container>
</template>
<script lang="ts" setup>
import axios from "axios";
import { VForm } from "vuetify/components";
import { getDocs, collection, addDoc, writeBatch, doc } from "firebase/firestore";
import Game_Card from "~/components/common/Game_Card.vue";
import { useMetacriticStyle } from "~/composables/data/handleData";
import store from "~/store/store";

useHead({
  title: "npmrungame | Oyun Öner",
});

const { $firestore } = useNuxtApp();

const config = useRuntimeConfig();
const _store = store();
const router = useRouter();
const display = useDisplay();

const recommendGameForm = ref<InstanceType<typeof VForm> | null>(null);
const recommendedGameFormNameInput = ref<InstanceType<typeof VForm> | null>(null);

const isGettingRecommendedGames = ref(false);
const isSearchingGameLoading = ref(false);
const isAddingToDb = ref(false);
const isAddedToDb = ref(false);
const showMaxLimitWarning = ref(false);
const showNoGameSelectedWarning = ref(false);

const addedGameToDbCount = ref(0);
const searchGameText = ref<string>("");
const recommendedGames = ref<any[]>([]);
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

      const { data } = await axios.get("https://api.rawg.io/api/games", {
        params: {
          key: config.public.apiKey,
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

    // 🔥 Single
    if (games.length === 1) {
      const finalGameData = {
        ...games[0],
        ...metadata,
      };

      await addDoc(collection($firestore, "recommended_games"), finalGameData);

      console.log("Tek oyun eklendi:", finalGameData.name);

      isAddedToDb.value = true;
      setTimeout(() => (isAddedToDb.value = false), 2500);

      return;
    }

    // 🔥 Multiple (batch)
    const batch = writeBatch($firestore);

    games.forEach((g) => {
      const ref = doc(collection($firestore, "recommended_games"));

      const finalGameData = {
        ...g,
        ...metadata,
      };

      batch.set(ref, finalGameData);
    });

    await batch.commit();

    console.log(`${games.length} oyun toplu olarak eklendi`);
    isAddedToDb.value = true;

    setTimeout(() => {
      isAddedToDb.value = false;
    }, 2500);

    return;
  } catch (error: any) {
    console.error("Error while add to db:", error.message);
  } finally {
    await getRecommendedGames();
    isAddingToDb.value = false;
    selectedGamesAfterResearch.value = [];
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

    recommendedGames.value = gamesList;
  } catch (error) {
    console.error("Error getting games :", error);
    return [];
  } finally {
    isGettingRecommendedGames.value = false;
  }
};

const handleRowClick = (item: any) => {
  _store.setActiveDetailedGame(item.id, item.name);
  router.replace(`/game-detail/${item.name}`);
};

const handleRecommendGame = async () => {
  // ❗ Oyun seçilmemişse uyarı göster ve çık
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

onMounted(() => {
  getRecommendedGames();
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/recommended_games.css";
</style>
