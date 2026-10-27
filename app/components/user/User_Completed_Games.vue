<template>
  <v-row class="d-flex justify-center align-center mx-auto mt-5 mt-lg-10">
    <v-col cols="12" lg="10" class="d-flex justify-space-between align-center">
      <div
        class="d-flex align-center justify-center justify-sm-start ga-2 ga-lg-5 mt-2 mt-lg-5"
      >
        <PanelPageTitle text="Bitirdiğim Oyunlar" />
      </div>

      <div class="d-flex align-center flex-wrap justify-end ga-2">
        <PanelListSort
          v-if="games.length || isLoading"
          v-model="sortMode"
        />
        <PanelListActions
          :games="games"
          title="Bitirdiğim Oyunlar"
          file-name="bitirdigim-oyunlar"
          :editing="bulkDeleteMode"
          :edit-disabled="!games.length"
          @add="isAddGame = true"
          @edit="toggleBulkMode"
        />
      </div>
    </v-col>

    <v-col cols="12" lg="10">
      <Admin_Bulk_Delete_Bar
        :active="bulkDeleteMode"
        :selected-count="selectedCount"
        :total-count="games.length"
        @select-all="selectAll(games)"
        @clear="clearSelection"
        @delete="bulkConfirmOpen = true"
        @cancel="exitBulkMode"
      />

      <PanelEmptyState
        v-if="!isLoading && games.length === 0"
        icon="mdi-trophy-outline"
        :title="tx('panel.empty.completed.title')"
        :description="tx('panel.empty.completed.body')"
        :tips="emptyTips"
        :primary-action-text="tx('panel.empty.addGame')"
        @primary-action="isAddGame = true"
      />

      <template v-else>
        <Game_Card
          v-if="viewMode === 'card'"
          :loading="isLoading"
          :arr="paginatedItems"
          :onRowClick="handleRowClick"
          :bulk-delete-mode="bulkDeleteMode"
          :is-selected="isSelected"
          :on-toggle-select="toggleSelect"
        />

        <Admin_Game_List
          v-else-if="viewMode === 'list'"
          :loading="isLoading"
          :arr="paginatedItems"
          :onDeleteClick="bulkDeleteMode ? undefined : handleDeleteGame"
          :onRowClick="handleRowClick"
          :bulk-delete-mode="bulkDeleteMode"
          :is-selected="isSelected"
          :on-toggle-select="toggleSelect"
        />

        <Admin_Game_Table
          v-else
          :loading="isLoading"
          :arr="paginatedItems"
          :onDeleteClick="bulkDeleteMode ? undefined : handleDeleteGame"
          :onRowClick="handleRowClick"
          :bulk-delete-mode="bulkDeleteMode"
          :is-selected="isSelected"
          :on-toggle-select="toggleSelect"
        />

        <PanelListPagination
          v-model="page"
          v-model:page-size="pageSize"
          :page-count="pageCount"
          :page-size="pageSize"
          :total-count="totalCount"
        />
      </template>
    </v-col>
  </v-row>

  <PanelBulkDeleteConfirm
    v-model="bulkConfirmOpen"
    :count="selectedCount"
    :loading="isBulkDeleting"
    @confirm="confirmBulkDelete"
  />

  <Admin_Add_Game_Dialog
    v-model="isAddGame"
    v-model:search="searchGameText"
    theme="green"
    title="Oyun Ekle"
    subtitle="Bitirdiğin oyunları ara, seç ve koleksiyonuna ekle"
    submit-text="Bitirdiklerime ekle"
    :search-results="searchResults"
    :selected="selectedGamesAfterResearch"
    :loading="isSearchingGameLoading"
    :adding="isAddingToDb"
    @search="onSearchInput(searchGameText)"
    @toggle-select="selectGameAfterSearch"
    @submit="addGameToDb"
    @clear-selection="selectedGamesAfterResearch = []"
  />

</template>

<script lang="ts" setup>
import axios from "axios";
import _ from "lodash";
import { getDocs, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import Admin_Game_Table from "../common/Admin_Game_Table.vue";
import Admin_Game_List from "../common/Admin_Game_List.vue";
import Game_Card from "../common/Game_Card.vue";
import Admin_Add_Game_Dialog from "~/components/admin/Admin_Add_Game_Dialog.vue";
import Admin_Bulk_Delete_Bar from "~/components/common/Admin_Bulk_Delete_Bar.vue";
import PanelBulkDeleteConfirm from "~/components/panel/PanelBulkDeleteConfirm.vue";
import PanelEmptyState from "~/components/panel/PanelEmptyState.vue";
import PanelListPagination from "~/components/panel/PanelListPagination.vue";
import PanelListSort, {
  type PanelSortMode,
} from "~/components/panel/PanelListSort.vue";
import PanelPageTitle from "~/components/panel/PanelPageTitle.vue";
import store from "~/store/store";
import { useAppLocale } from "~/composables/useAppLocale";
import {
  batchDeleteUserListGames,
  usePanelBulkEdit,
} from "~/composables/usePanelBulkEdit";
import { usePanelListPagination } from "~/composables/usePanelListPagination";
import { isAbortError } from "~/utils/isAbortError";
import { getGameTimestampMs, shouldMirrorToThisYearList } from "~/utils/gameYear";
import { gameDoc, gamesCollection } from "~/utils/channelOwnerGames";

const { $firestore } = useNuxtApp();
const _store = store();
const { tx } = useAppLocale();

const {
  bulkDeleteMode,
  selectedIds,
  selectedCount,
  isSelected,
  toggleBulkMode,
  exitBulkMode,
  toggleSelect,
  selectAll,
  clearSelection,
} = usePanelBulkEdit();

const bulkConfirmOpen = ref(false);
const isBulkDeleting = ref(false);

const emptyTips = computed(() => [
  { icon: "mdi-lightbulb-on-outline", text: tx("panel.empty.tipSearch") },
]);

const isLoading = ref(false);
const isAddGame = ref(false);
const isSearchingGameLoading = ref(false);
const isAddingToDb = ref(false);

const games = ref<any[]>([]);
const sortMode = ref<PanelSortMode>("added");
const viewMode = ref<"card" | "list" | "table">("card");
const searchGameText = ref<string>("");
const searchResults = ref<any[]>([]);
const selectedGamesAfterResearch = ref<any[]>([]);

const {
  page,
  pageSize,
  pageCount,
  paginatedItems,
  totalCount,
} = usePanelListPagination(games);

function releaseSortKey(g: any) {
  const raw = g?.released || g?.releaseDate || "";
  const t = Date.parse(String(raw).slice(0, 10));
  return Number.isNaN(t) ? 0 : t;
}

function applySort(list: any[] = games.value) {
  const mode = sortMode.value;
  let next = [...list];
  if (mode === "added") {
    next = _.sortBy(next, (g) => getGameTimestampMs(g) ?? 0).reverse();
  } else if (mode === "release-new") {
    next = _.sortBy(next, releaseSortKey).reverse();
  } else if (mode === "release-old") {
    next = _.sortBy(next, releaseSortKey);
  } else if (mode === "meta") {
    next = _.sortBy(next, (g) => Number(g?.metacritic) || 0).reverse();
  }
  games.value = next;
}

watch(sortMode, () => {
  applySort();
  page.value = 1;
});

const getGames = async () => {
  if (!_store.user?.uid || !$firestore) return;

  try {
    isLoading.value = true;
    const gamesCol = gamesCollection(
      $firestore,
      _store.user.uid,
      "completed_games"
    );
    const gamesSnapshot = await getDocs(gamesCol);

    const gamesList = gamesSnapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
    }));

    applySort(gamesList);
  } catch (error) {
    if (!isAbortError(error)) console.error("Error getting games:", error);
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 250);
  }
};

const onSearchInput = (value: string | null) => {
  searchGames(String(value ?? "").trim());
};

const searchGames = _.debounce(async (value: string) => {
  if (!value || value.length < 3) {
    searchResults.value = [];
    return;
  }

  try {
    isSearchingGameLoading.value = true;
    const response = await axios.get("/api/search-games", {
      params: { search: value, page: 1 },
    });
    searchResults.value = response.data.results || [];
  } catch (error) {
    console.error("Error searching games:", error);
  } finally {
    isSearchingGameLoading.value = false;
  }
}, 500);

const selectGameAfterSearch = (item: any) => {
  const exists = selectedGamesAfterResearch.value.some((game: any) => game.id === item.id);

  if (exists) {
    selectedGamesAfterResearch.value = selectedGamesAfterResearch.value.filter(
      (game: any) => game.id !== item.id
    );
  } else {
    selectedGamesAfterResearch.value.push(item);
  }
};

const addGameToDb = async () => {
  if (!_store.user?.uid || !$firestore || selectedGamesAfterResearch.value.length === 0) return;

  try {
    isAddingToDb.value = true;
    const gamesCol = gamesCollection(
      $firestore,
      _store.user.uid,
      "completed_games"
    );

    const yearCol = shouldMirrorToThisYearList()
      ? gamesCollection($firestore, _store.user.uid, "target_2026_games")
      : null;

    for (const game of selectedGamesAfterResearch.value) {
      const payload = {
        ...game,
        createdAt: serverTimestamp(),
      };
      await addDoc(gamesCol, payload);
      // Bu yıl bitenler listesine de yaz (her oyuncu)
      if (yearCol) {
        await addDoc(yearCol, payload);
      }
    }

    selectedGamesAfterResearch.value = [];
    searchGameText.value = "";
    searchResults.value = [];
    isAddGame.value = false;
    await getGames();
  } catch (error) {
    console.error("Error adding game:", error);
  } finally {
    isAddingToDb.value = false;
  }
};

const handleRowClick = (item: any) => {
  // Navigate to game detail or show dialog
  console.log("Game clicked:", item);
};

const handleDeleteGame = async (game: any) => {
  if (!_store.user?.uid || !$firestore || !game.firestoreId) return;

  try {
    await deleteDoc(
      gameDoc($firestore, _store.user.uid, "completed_games", game.firestoreId)
    );
    await getGames();
  } catch (error) {
    console.error("Error deleting game:", error);
  }
};

const confirmBulkDelete = async () => {
  if (!_store.user?.uid || !$firestore || !selectedIds.value.length) return;

  try {
    isBulkDeleting.value = true;
    await batchDeleteUserListGames(
      $firestore,
      _store.user.uid,
      "completed_games",
      selectedIds.value
    );
    bulkConfirmOpen.value = false;
    exitBulkMode();
    await getGames();
  } catch (error) {
    console.error("Error bulk deleting games:", error);
  } finally {
    isBulkDeleting.value = false;
  }
};

onMounted(() => {
  getGames();
});
</script>

<style scoped>
@import "~/assets/css/main.css";

</style>
