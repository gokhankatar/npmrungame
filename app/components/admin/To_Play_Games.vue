<template>
  <Admin_Game_Collection_Shell
    theme="cyan"
    title="Oynayacağım Oyunlar"
    subtitle="Listendeki oyunları ekle, ara, sırala ve yönet."
    badge="Liste"
    badge-icon="mdi-playlist-play"
    accent-color="#4dd0e1"
    :show-added-sort="false"
    v-model:list-search-query="listSearchQuery"
    v-model:view-mode="viewMode"
    :total-games-count="totalGamesCount"
    :filtered-games-count="filteredGamesCount"
    :avg-playtime="avgPlaytime"
    :avg-metacritic="avgMetacritic"
    :sort-label="sortLabel"
    :sort-menu-icon="sortMenuIcon"
    :loading="isGettingToPlayGames"
    :bulk-delete-mode="bulkDeleteMode"
    @add="isAddGame = true"
    @refresh="getToPlayGames"
    @bulk-toggle="toggleBulkMode"
    @search-input="onListSearchInput"
    @clear-search="clearListSearch"
    @sort="sortBy"
  >
    <template #bulk-bar>
      <Admin_Bulk_Delete_Bar
        :active="bulkDeleteMode"
        :selected-count="selectedCount"
        :total-count="toPlayGames.length"
        @select-all="selectAll(toPlayGames)"
        @clear="clearSelection"
        @delete="openBulkDeleteDialog"
        @cancel="exitBulkMode"
      />
    </template>

    <div
      v-if="!isGettingToPlayGames && toPlayGames.length === 0"
      class="admin-collection-empty"
    >
      <v-icon icon="mdi-playlist-play" size="48" color="rgba(77,208,225,0.45)" />
      <p class="admin-collection-empty-title default-title-letter">
        {{ listSearchQuery ? "Sonuç bulunamadı" : "Henüz oyun yok" }}
      </p>
      <p class="admin-collection-empty-desc">
        {{
          listSearchQuery
            ? "Farklı bir arama dene veya filtreyi temizle."
            : "Oynayacağın ilk oyunu eklemek için Oyun Ekle butonunu kullan."
        }}
      </p>
      <v-btn
        v-if="!listSearchQuery"
        color="#4dd0e1"
        variant="tonal"
        rounded="lg"
        prepend-icon="mdi-plus"
        class="text-capitalize"
        text="Oyun ekle"
        @click="isAddGame = true"
      />
      <v-btn
        v-else
        variant="text"
        rounded="lg"
        class="text-capitalize"
        text="Aramayı temizle"
        @click="clearListSearch"
      />
    </div>

    <Game_Card
      v-else-if="viewMode === 'card'"
      :loading="isGettingToPlayGames"
      :arr="toPlayGames"
        density="admin-grid"
      :on-row-click="handleRowClick"
      :bulk-delete-mode="bulkDeleteMode"
      :is-selected="isSelected"
      :on-toggle-select="toggleSelect"
    />

    <Admin_Game_List
      v-else-if="viewMode === 'list'"
      :loading="isGettingToPlayGames"
      :arr="toPlayGames"
      :on-delete-click="bulkDeleteMode ? undefined : handleDeleteGame"
      :on-row-click="handleRowClick"
      :bulk-delete-mode="bulkDeleteMode"
      :is-selected="isSelected"
      :on-toggle-select="toggleSelect"
    />

    <Admin_Game_Table
      v-else-if="viewMode === 'table'"
      :loading="isGettingToPlayGames"
      :arr="toPlayGames"
      :on-delete-click="handleDeleteGame"
      :on-row-click="handleRowClick"
      :bulk-delete-mode="bulkDeleteMode"
      :is-selected="isSelected"
      :on-toggle-select="toggleSelect"
    />

  </Admin_Game_Collection_Shell>


    <!-- Bulk Delete Confirmation -->
  <v-dialog
    v-model="isOpenBulkConfirmationDialog"
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
        {{ selectedCount }} oyunu veritabanından silmek istediğinden emin misin?
      </p>

      <v-divider color="white" class="w-100" />

      <div class="w-100" style="max-height: 200px; overflow-y: auto">
        <p
          v-for="game in bulkDeletePreviewGames"
          :key="game.firestoreId"
          class="text-caption text-grey-lighten-2 default-title-letter mb-1"
        >
          • {{ game.name }}
        </p>
      </div>

      <div class="w-100 d-flex align-center justify-end ga-1 mt-2">
        <v-btn
          @click="isOpenBulkConfirmationDialog = false"
          :ripple="false"
          class="rounded"
          :size="isExtraLargeScreen ? 'default' : 'small'"
          color="grey-lighten-2"
          variant="text"
          prepend-icon="mdi-close"
          text="İptal"
        />

        <v-btn
          @click="deleteSelectedGamesFromDb"
          :loading="isDeletingGameFromDb"
          :ripple="false"
          class="rounded"
          color="error"
          :size="isExtraLargeScreen ? 'default' : 'small'"
          variant="tonal"
          prepend-icon="mdi-delete"
          text="Evet, sil"
        />
      </div>
    </div>
  </v-dialog>

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

  <Admin_Add_Game_Dialog
    v-model="isAddGame"
    v-model:search="searchGameText"
    theme="cyan"
    subtitle="Oynayacağın oyunları ara, seç ve listene ekle"
    submit-text="Oynayacaklarım'a ekle"
    :search-results="searchResults"
    :selected="selectedGamesAfterResearch"
    :loading="isSearchingGameLoading"
    :adding="isAddingToDb"
    :added="isAddedToDb"
    :added-count="addedGameToDbCount"
    @search="searchGame"
    @toggle-select="selectGameAfterSearch"
    @submit="addGameToDb('to_play_games')"
    @clear-selection="selectedGamesAfterResearch = []"
  />

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
import _ from "lodash";
import { truncateText } from "~/composables/core/basicFunc";
import {
  getUniquePlatformIcons,
  useMetacriticStyle,
} from "~/composables/data/handleData";
import successfullyDoneImg from "~/assets/img/successfully_done_anim.gif";
import Admin_Game_Table from "../common/Admin_Game_Table.vue";
import Admin_Game_List from "../common/Admin_Game_List.vue";
import Admin_Bulk_Delete_Bar from "../common/Admin_Bulk_Delete_Bar.vue";
import Admin_Game_Collection_Shell from "./Admin_Game_Collection_Shell.vue";
import Admin_Add_Game_Dialog from "./Admin_Add_Game_Dialog.vue";
import Game_Card from "../common/Game_Card.vue";
import {
  useAdminBulkDelete,
  batchDeleteFromFirestore,
} from "~/composables/admin/useAdminBulkDelete";
import { useAdminCollectionList } from "~/composables/admin/useAdminCollectionList";

const { $firestore } = useNuxtApp();

const display = useDisplay();
const smallScreen = computed(() => display.smAndDown.value);
const isExtraLargeScreen = computed(() => display.xlAndUp.value);

const TO_PLAY_COLLECTION = "to_play_games";

const {
  bulkDeleteMode,
  selectedCount,
  isSelected,
  toggleBulkMode,
  exitBulkMode,
  toggleSelect,
  selectAll,
  clearSelection,
  getSelectedFromList,
} = useAdminBulkDelete();

const isGettingToPlayGames = ref(false);
const isOpenConfirmationDialog = ref(false);
const isOpenBulkConfirmationDialog = ref(false);
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
const {
  games: toPlayGames,
  listSearchQuery,
  totalGamesCount,
  filteredGamesCount,
  avgPlaytime,
  avgMetacritic,
  sortLabel,
  sortMenuIcon,
  onListSearchInput,
  clearListSearch,
  sortBy,
  setAllGames,
} = useAdminCollectionList("new");
const viewMode = ref<"card" | "list" | "table">("card");
const activeGame = ref<any | null>(null);
const selectedGamesAfterResearch = ref<any[]>([]);
const searchGameText = ref<string>("");
const searchResults = ref<any[]>([]);

const displayedDescription = computed(() => {
  if (showFullDescription.value) return activeGame.value?.description;
  return truncateText(activeGame.value?.description, 250);
});

const bulkDeletePreviewGames = computed(() =>
  getSelectedFromList(toPlayGames.value).slice(0, 12)
);

const openBulkDeleteDialog = () => {
  if (selectedCount.value === 0) return;
  isOpenBulkConfirmationDialog.value = true;
};

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

    setAllGames(gamesList, "new");
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

const deleteThisGameFromDb = async (
  firestoreId: string,
  collectionName: string = "to_play_games"
) => {
  try {
    isDeletingGameFromDb.value = true;

    await deleteDoc(doc($firestore, collectionName, firestoreId));

    console.log("The game deleted from DB :", firestoreId);
    sendNotification(`${activeGame.value?.name} adlı oyun veritabanından silindi!`);
  } catch (error) {
    console.error("Silme hatası:", error);
  } finally {
    isOpenConfirmationDialog.value = false;
    isDeletingGameFromDb.value = false;

    await getToPlayGames();
  }
};

const deleteSelectedGamesFromDb = async () => {
  const selected = getSelectedFromList(toPlayGames.value);
  if (!selected.length) return;

  try {
    isDeletingGameFromDb.value = true;
    const ids = selected.map((g) => g.firestoreId);
    await batchDeleteFromFirestore($firestore, TO_PLAY_COLLECTION, ids);
    sendNotification(`${ids.length} oyun veritabanından silindi!`);
  } catch (error) {
    console.error("Toplu silme hatası:", error);
  } finally {
    isOpenBulkConfirmationDialog.value = false;
    isDeletingGameFromDb.value = false;
    exitBulkMode();
    await getToPlayGames();
  }
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

const addGameToDb = async (collectionName: string = "to_play_games") => {
  const games = selectedGamesAfterResearch.value;

  if (!games || games.length === 0) return;

  try {
    isAddingToDb.value = true;

    addedGameToDbCount.value = games.length;

    // 🔥 Single
    if (games.length === 1) {
      await addDoc(collection($firestore, collectionName), games[0]);
      console.log("Tek oyun eklendi:", games[0].name);
      isAddedToDb.value = true;

      setTimeout(() => {
        isAddedToDb.value = false;
      }, 2500);
    } else {
      // 🔥 Multiple
      const batch = writeBatch($firestore);

      games.forEach((g) => {
        const ref = doc(collection($firestore, collectionName));
        batch.set(ref, g);
      });

      await batch.commit();

      console.log(`${games.length} oyun toplu olarak eklendi`);
      isAddedToDb.value = true;

      setTimeout(() => {
        isAddedToDb.value = false;
      }, 2500);
    }
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
@import "~/assets/css/admin_collection_page.css";
@import "~/assets/css/to_play_games.css";
</style>
