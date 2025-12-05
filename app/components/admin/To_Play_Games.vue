<template>
  <v-row class="d-flex justify-center align-center mx-auto mt-5 mt-lg-10">
    <v-col cols="12" lg="10" class="d-flex justify-space-between align-center">
      <div
        class="d-flex align-center justify-center justify-sm-start ga-2 ga-lg-5 mt-2 mt-lg-5"
      >
        <v-icon
          icon="mdi-gamepad-variant-outline"
          :size="smallScreen ? 'small' : 'x-large'"
        />
        <p
          class="shadowed-text text-subtitle-2 text-sm-subtitle-1 text-lg-h5 text-xl-h4 default-title-letter"
        >
          Oynayacağım Oyunlar
          <strong class="font-weight-bold default-title-letter"
            >({{ toPlayGames?.length }})</strong
          >
        </p>
      </div>

      <v-btn
        icon="mdi-refresh"
        class="rounded text-caption text-lg-subtitle-2"
        :ripple="false"
        variant="tonal"
        @click="getToPlayGames"
        :size="smallScreen ? 'x-small' : 'small'"
        :loading="isGettingToPlayGames"
      />
    </v-col>

    <v-col cols="12" lg="10">
      <v-data-table
        :items="toPlayGames"
        :headers="header_completed_games"
        :loading="isGettingToPlayGames"
        class="admin-data-table rounded-lg w-100"
        items-per-page-text="Sayfa Başı Oyun Sayısı"
        hover
      >
        <template #item="{ item, index }">
          <tr class="table-row cursor-pointer" @click="handleRowClick(item)">
            <td>
              <div class="d-flex align-center ga-1 ga-lg-2 py-2">
                <img
                  :src="item.background_image"
                  :width="smallScreen ? 30 : 60"
                  class="rounded-lg h-100"
                  cover
                />
                <p
                  class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter"
                >
                  {{ item.name }}
                </p>
              </div>
            </td>

            <td>
              <p
                class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter"
              >
                {{ new Date(item.released).getFullYear() }}
              </p>
            </td>

            <td>
              <div class="d-flex align-center ga-1 flex-wrap py-1">
                <v-chip
                  v-for="(genre, index) in item.genres"
                  :key="index"
                  :size="smallScreen ? 'x-small' : 'small'"
                  color="green-accent-2"
                  variant="tonal"
                  :ripple="false"
                  :text="genre.name"
                />
              </div>
            </td>

            <td>
              <div class="d-flex align-center flex-wrap ga-1">
                <template
                  v-for="icon in getUniquePlatformIcons(item.platforms)"
                  :key="icon"
                >
                  <v-icon v-if="icon" size="small" color="grey-lighten-1" :icon="icon" />
                </template>
              </div>
            </td>

            <td>
              <v-chip
                :ripple="false"
                size="small"
                :color="
                  item.metacritic ? useMetacriticStyle(item?.metacritic).color : 'warning'
                "
                :text="item.metacritic ?? 'N/A'"
              />
            </td>

            <td>
              <v-btn
                @click.stop="handleDeleteGame(item)"
                variant="tonal"
                prepend-icon="mdi-delete"
                class="text-caption text-lg-subtitle-2 default-title-letter rounded-xl"
                text="Sil"
                color="error"
                block
              />
            </td>
          </tr>
        </template>

        <template #loading>
          <v-skeleton-loader
            class="bg-transparent"
            :type="
              toPlayGames.length > 10 ? 'table-row@10' : `table-row@${toPlayGames.length}`
            "
          />
        </template>
      </v-data-table>
    </v-col>

    <v-col cols="12" lg="10">
      <v-btn
        @click="isAddGame = true"
        :ripple="false"
        color="green-accent-2"
        text="Oyun Ekle"
        prepend-icon="mdi-plus"
        class="float-right"
        :block="smallScreen ? true : false"
      />
    </v-col>
  </v-row>

  <!-- Confirmation Pop Up -->
  <v-dialog
    v-model="isOpenConfirmationDialog"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.1rem);
      -webkit-backdrop-filter: blur(0.1rem);
    "
  >
    <div
      class="delete-game-pop-up d-flex flex-column align-start ga-2 ga-lg-4 rounded pa-2 pa-lg-5"
    >
      <p
        class="text-subtitle-2 text-md-subtitle-1 text-xl-h5 default-title-letter text-grey-lighten-1"
      >
        Bu oyunu veri tabanından silmek istediğinden emin misin ?
      </p>

      <v-divider color="white" class="w-100" />

      <div class="d-flex flex-column align-start ga-1">
        <v-img :src="activeGame?.background_image" width="75" />
        <p class="text-caption text-lg-subtitle-2 text-grey-lighten-1">
          {{
            `${activeGame?.name}
          (${new Date(activeGame?.released).getFullYear()})`
          }}
        </p>
        <p
          v-html="truncateText(activeGame?.description, 150)"
          class="text-caption text-grey-lighten-3"
        ></p>
      </div>

      <div class="w-100 d-flex align-center justify-end ga-1 mt-2">
        <v-btn
          @click="isOpenConfirmationDialog = false"
          :ripple="false"
          class="rounded"
          :size="isExtraLargeScreen ? 'default' : 'small'"
          color="grey-lighten-2"
          variant="text"
          prepend-icon="mdi-close"
          text="Iptal"
        />

        <v-btn
          @click="deleteThisGameFromDb(activeGame?.firestoreId)"
          :loading="isDeletingGameFromDb"
          :ripple="false"
          class="rounded"
          color="error"
          :size="isExtraLargeScreen ? 'default' : 'small'"
          variant="tonal"
          prepend-icon="mdi-delete"
          text="Evet"
        />
      </div>
    </div>
  </v-dialog>

  <!-- Game Detail Pop Up -->
  <v-dialog
    v-model="isOpenGameDetail"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.7rem);
      -webkit-backdrop-filter: blur(0.7rem);
    "
  >
    <div
      class="game-detail-pop-up d-flex flex-column align-start ga-2 ga-lg-4 rounded pa-2 pa-lg-5"
    >
      <v-btn
        @click="isOpenGameDetail = false"
        icon="mdi-close"
        color="grey-darken-1"
        class="close-btn ma-1"
        variant="text"
        size="small"
        :ripple="false"
      />

      <!-- Game Detail Header -->
      <div class="d-flex align-center ga-2">
        <v-img :src="activeGame?.background_image" width="75" class="rounded-lg" />
        <div class="d-flex flex-column align-start">
          <p
            class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-grey-lighten-1 default-title-letter"
          >
            {{ activeGame?.name }}
          </p>
          <p
            class="text-caption text-xl-subtitle-2 text-grey-darken-1 default-title-letter"
          >
            {{ new Date(activeGame?.released).getFullYear() }}
          </p>
        </div>
      </div>

      <v-divider color="white" class="w-100" />

      <!-- Game Detail Body -->

      <!-- metacritic -->
      <div class="d-flex flex-wrap align-center ga-2">
        <v-chip
          size="small"
          :ripple="false"
          class="rounded default-title-letter"
          color="grey-darken-1"
          text="Metacritic"
        />

        <p
          class="text-caption text-lg-subtitle-2 default-title-letter"
          :class="`text-${useMetacriticStyle(activeGame?.metacritic).color}`"
        >
          {{ activeGame?.metacritic ?? "N/A" }}
        </p>
      </div>

      <!-- genres -->
      <div class="d-flex flex-wrap align-center ga-2">
        <v-chip
          size="small"
          :ripple="false"
          class="rounded default-title-letter"
          color="grey-darken-1"
          text="Genre"
        />

        <v-chip
          v-for="(genre, index) in activeGame?.genres"
          :key="index"
          :size="smallScreen ? 'x-small' : 'small'"
          color="green-accent-2"
          class="rounded-xl"
          variant="tonal"
          :ripple="false"
          :text="genre.name"
        />
      </div>

      <!-- Platforms -->
      <div class="d-flex flex-wrap align-center ga-2">
        <v-chip
          size="small"
          :ripple="false"
          class="rounded default-title-letter"
          color="grey-darken-1"
          text="Platform"
        />
        <template
          v-for="icon in getUniquePlatformIcons(activeGame?.platforms)"
          :key="icon"
        >
          <v-icon v-if="icon" size="small" color="grey-lighten-1" :icon="icon" />
        </template>
      </div>

      <!-- playtime -->
      <div class="d-flex flex-wrap align-center ga-2">
        <v-chip
          size="small"
          :ripple="false"
          class="rounded default-title-letter"
          color="grey-darken-1"
          text="Playtime"
        />

        <p
          class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter"
        >
          {{ activeGame?.playtime ? `${activeGame?.playtime} saat` : "N/A" }}
        </p>
      </div>

      <!-- Stores -->
      <div class="d-flex flex-wrap align-center ga-2">
        <v-chip
          size="small"
          :ripple="false"
          class="rounded default-title-letter"
          color="grey-darken-1"
          text="Store"
        />
        <template v-for="s in activeGame?.stores ?? []" :key="s.id">
          <v-chip
            :size="smallScreen ? 'x-small' : 'small'"
            :ripple="false"
            class="rounded default-title-letter"
            color="primary"
            :text="s.store.name"
          />
        </template>
      </div>

      <v-divider
        v-if="activeGame?.description?.length > 250"
        color="white"
        class="w-100"
      />

      <!-- description -->
      <p
        class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter"
        v-html="displayedDescription"
      ></p>

      <!-- toggle button -->
      <div
        v-if="activeGame?.description?.length > 250"
        class="d-flex align-center justify-end w-100"
      >
        <v-btn
          variant="text"
          size="small"
          :ripple="false"
          class="text-grey-lighten-1"
          @click="showFullDescription = !showFullDescription"
          :text="showFullDescription ? 'Daha az göster' : 'Açıklamanın tamamını oku'"
        />
      </div>
    </div>
  </v-dialog>

  <!-- Add Game -->
  <v-dialog
    v-model="isAddGame"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.1rem);
      -webkit-backdrop-filter: blur(0.1rem);
    "
  >
    <div
      class="add-game-pop-up d-flex flex-column align-center ga-2 ga-lg-4 rounded pa-2 pa-lg-5"
    >
      <v-btn
        @click="isAddGame = false"
        icon="mdi-close"
        color="grey-darken-1"
        class="close-btn ma-1"
        variant="text"
        size="small"
        :ripple="false"
      />

      <div class="d-flex justify-center align-center ga-2">
        <p
          class="text-center text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-grey-darken-1 default-title-letter"
        >
          Oyun Ekle
        </p>
        <v-icon icon="mdi-plus" color="grey-darken-1" />
      </div>

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
        :density="isExtraLargeScreen ? 'comfortable' : 'compact'"
        clearable
      />

      <!-- 🔥 Arama sonuç alanı -->
      <div class="w-100" style="max-height: 350px; overflow-y: auto">
        <!-- Loading -->
        <div v-if="isSearchingGameLoading" class="d-flex justify-start py-2 py-lg-4">
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
            <v-avatar :size="smallScreen ? 30 : 48" rounded>
              <v-img :src="game.background_image" :alt="game.name" cover />
            </v-avatar>

            <div class="d-flex flex-column">
              <p
                class="text-caption text-lg-subtitle-2 default-title-letter"
                :class="
                  selectedGamesAfterResearch.some((i) => i.id === game.id)
                    ? 'text-black'
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

      <transition name="slide-up">
        <v-row
          v-if="selectedGamesAfterResearch?.length > 0"
          class="w-100 mx-auto d-flex align-center"
          dense
        >
          <v-col cols="12" sm="6">
            <v-btn
              @click="addGameToDb"
              :loading="isAddingToDb"
              :text="`Tamamlanan Oyunlar Ekle (${selectedGamesAfterResearch?.length})`"
              size="small"
              :ripple="false"
              prepend-icon="mdi-plus"
              class="text-capitalize"
              block
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-btn
              @click="selectedGamesAfterResearch = []"
              text="Tüm Seçimleri Kaldır"
              size="small"
              :ripple="false"
              class="text-capitalize"
              prepend-icon="mdi-broom"
              block
            />
          </v-col>
        </v-row>
      </transition>

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
  </v-dialog>

  <!-- Toast -->
  <v-dialog
    v-model="notificationModels.isAvailable"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.1rem);
      -webkit-backdrop-filter: blur(0.1rem);
    "
  >
    <div
      class="successfully-done-container d-flex flex-column align-center justify-center pa-5 rounded-xl"
    >
      <v-btn
        @click="notificationModels.isAvailable = false"
        class="close-icon-in-successfully-done-container ma-1 ma-lg-2"
        icon="mdi-close"
        :ripple="false"
        variant="text"
        color="grey-darken-1"
        size="small"
      />
      <v-img :src="successfullyDoneImg" :width="smallScreen ? 50 : 75" />
      <p
        class="text-subtitle-2 text-lg-subtitle-1 text-grey-lighten-1 default-title-letter"
      >
        {{ notificationModels?.msg }}
      </p>
    </div>
  </v-dialog>
</template>

<script lang="ts" setup>
import axios from "axios";
import {
  doc,
  getDocs,
  collection,
  deleteDoc,
  addDoc,
  writeBatch,
} from "firebase/firestore";
import { truncateText } from "~/composables/core/basicFunc";
import {
  getUniquePlatformIcons,
  useMetacriticStyle,
} from "~/composables/data/handleData";
import { header_completed_games } from "~/composables/data/headerTables";
import successfullyDoneImg from "~/assets/img/successfully_done_anim.gif";

const { $firestore } = useNuxtApp();
const config = useRuntimeConfig();
const display = useDisplay();
const smallScreen = computed(() => display.smAndDown.value);
const isExtraLargeScreen = computed(() => display.xlAndUp.value);

const isGettingToPlayGames = ref(false);
const isOpenConfirmationDialog = ref(false);
const isOpenGameDetail = ref(false);
const isDeletingGameFromDb = ref(false);
const notificationModels = ref({
  isAvailable: false,
  msg: "",
});

const showFullDescription = ref(false);
const isAddGame = ref(false);
const isAddedToDb = ref(false);
const isSearchingGameLoading = ref(false);
const isAddingToDb = ref(false);

const addedGameToDbCount = ref(0);
const toPlayGames = ref<any[]>([]);
const activeGame = ref<any | null>(null);
const selectedGamesAfterResearch = ref<any[]>([]);
const searchGameText = ref<string>("");
const searchResults = ref<any[]>([]);

const displayedDescription = computed(() => {
  if (showFullDescription.value) return activeGame.value?.description;
  return truncateText(activeGame.value?.description, 250);
});

const selectGameAfterSearch = (item: any) => {
  const exists = selectedGamesAfterResearch.value.some(
    (game: any) => game.id === item.id
  );

  if (exists) {
    selectedGamesAfterResearch.value = selectedGamesAfterResearch.value.filter(
      (game: any) => game.id !== item.id
    );
  } else {
    selectedGamesAfterResearch.value.push(item);
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

const handleRowClick = (item: any) => {
  activeGame.value = item;
  isOpenGameDetail.value = true;
};

const handleDeleteGame = (game: any) => {
  activeGame.value = game;
  isOpenConfirmationDialog.value = true;
};

const sendNotification = (msg: string) => {
  notificationModels.value.msg = msg;
  notificationModels.value.isAvailable = true;

  setTimeout(() => {
    notificationModels.value.isAvailable = false;
  }, 3500);
};

const deleteThisGameFromDb = async (firestoreId: string) => {
  try {
    isDeletingGameFromDb.value = true;

    await deleteDoc(doc($firestore, "to_play_games", firestoreId));

    console.log("The game deleted from DB :", firestoreId);
    sendNotification(`${activeGame.value?.name} adlı oyun veritabanından silindi!`);
  } catch (error) {
    console.error("Silme hatası:", error);
  } finally {
    isOpenConfirmationDialog.value = false;
    isDeletingGameFromDb.value = false;

    // Update List
    await getToPlayGames();
  }
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

const addGameToDb = async () => {
  const games = selectedGamesAfterResearch.value;

  if (!games || games.length === 0) return;

  try {
    isAddingToDb.value = true;

    addedGameToDbCount.value = games.length;

    // 🔥 Single
    if (games.length === 1) {
      await addDoc(collection($firestore, "to_play_games"), games[0]);
      console.log("Tek oyun eklendi:", games[0].name);
      isAddedToDb.value = true;

      setTimeout(() => {
        isAddedToDb.value = false;
      }, 2500);
      return;
    }

    // 🔥 Multiple
    const batch = writeBatch($firestore);

    games.forEach((g) => {
      const ref = doc(collection($firestore, "to_play_games"));
      batch.set(ref, g);
    });

    await batch.commit();

    console.log(`${games.length} oyun toplu olarak eklendi`);
    isAddedToDb.value = true;

    setTimeout(() => {
      isAddedToDb.value = false;
    }, 2500);
    return;
  } catch (error: any) {
    console.error("Error while add to db : ", error.message);
  } finally {
    await getToPlayGames();
    isAddingToDb.value = false;
    selectedGamesAfterResearch.value = [];
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
  getToPlayGames();
});
</script>
<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/admin.css";
@import "~/assets/css/to_play_games.css";
</style>
