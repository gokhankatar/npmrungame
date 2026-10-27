<template>
  <v-row class="d-flex justify-center align-center mx-auto mt-5 mt-lg-10">
    <v-col cols="12" lg="10" class="d-flex justify-space-between align-center">
      <div
        class="d-flex align-center justify-center justify-sm-start ga-2 ga-lg-5 mt-2 mt-lg-5"
      >
        <PanelPageTitle :text="tx('panel.nav.playing')" />
      </div>

      <PanelListActions
        :games="games"
        :title="tx('panel.nav.playing')"
        file-name="su-an-oynadiklarim"
        :editing="bulkDeleteMode"
        :edit-disabled="!games.length"
        @add="isAddGame = true"
        @edit="toggleBulkMode"
      />
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
        icon="mdi-play-circle-outline"
        :title="tx('panel.empty.playing.title')"
        :description="tx('panel.empty.playing.body')"
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
          :show-playing-actions="!bulkDeleteMode"
          :on-complete-click="openCompleteDialog"
          :on-remove-click="openRemoveDialog"
          :bulk-delete-mode="bulkDeleteMode"
          :is-selected="isSelected"
          :on-toggle-select="toggleSelect"
        />

        <Admin_Game_List
          v-else-if="viewMode === 'list'"
          :loading="isLoading"
          :arr="paginatedItems"
          :onDeleteClick="bulkDeleteMode ? undefined : openRemoveDialog"
          :onRowClick="handleRowClick"
          :bulk-delete-mode="bulkDeleteMode"
          :is-selected="isSelected"
          :on-toggle-select="toggleSelect"
        />

        <Admin_Game_Table
          v-else
          :loading="isLoading"
          :arr="paginatedItems"
          :onDeleteClick="bulkDeleteMode ? undefined : openRemoveDialog"
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
    subtitle="Şu an oynadığın oyunları ara, seç ve listene ekle"
    submit-text="Şu an oynananlara ekle"
    :search-results="searchResults"
    :selected="selectedGamesAfterResearch"
    :loading="isSearchingGameLoading"
    :adding="isAddingToDb"
    @search="onSearchInput(searchGameText)"
    @toggle-select="selectGameAfterSearch"
    @submit="addGameToDb"
    @clear-selection="selectedGamesAfterResearch = []"
  />

  <!-- Tamamladım onayı -->
  <v-dialog
    v-model="completeDialog"
    :max-width="480"
    scrim="rgba(0,0,0,0.85)"
  >
    <div class="panel-feedback-card d-flex flex-column align-start ga-3 pa-5">
      <div class="d-flex align-center ga-3 w-100">
        <v-avatar size="56" rounded="lg" class="panel-feedback-cover">
          <v-img
            v-if="activeGame?.background_image"
            :src="activeGame.background_image"
            cover
          />
          <v-icon v-else icon="mdi-gamepad-variant" color="grey" />
        </v-avatar>
        <div class="flex-grow-1 min-w-0">
          <p class="panel-feedback-eyebrow mb-1">Bitirdin mi?</p>
          <p class="panel-feedback-title mb-0 text-truncate">
            {{ activeGame?.name }}
          </p>
        </div>
      </div>

      <p class="panel-feedback-body mb-0">
        Onaylarsan bu oyun listeden kalkar ve bitirdiğin oyunlara eklenir.
      </p>

      <div class="w-100 d-flex align-center justify-end ga-2 mt-1">
        <v-btn
          variant="text"
          color="grey-lighten-1"
          :ripple="false"
          prepend-icon="mdi-close"
          text="İptal"
          @click="completeDialog = false"
        />
        <v-btn
          color="success"
          variant="flat"
          :ripple="false"
          :loading="isCompleting"
          prepend-icon="mdi-check-circle"
          text="Evet, tamamladım"
          @click="confirmCompleteGame"
        />
      </div>
    </div>
  </v-dialog>

  <!-- Kaldır onayı -->
  <v-dialog
    v-model="removeDialog"
    :max-width="480"
    scrim="rgba(0,0,0,0.85)"
  >
    <div class="panel-feedback-card d-flex flex-column align-start ga-3 pa-5">
      <div class="d-flex align-center ga-3 w-100">
        <v-avatar size="56" rounded="lg" class="panel-feedback-cover">
          <v-img
            v-if="activeGame?.background_image"
            :src="activeGame.background_image"
            cover
          />
          <v-icon v-else icon="mdi-gamepad-variant" color="grey" />
        </v-avatar>
        <div class="flex-grow-1 min-w-0">
          <p class="panel-feedback-eyebrow panel-feedback-eyebrow--warn mb-1">
            Listeden kaldır
          </p>
          <p class="panel-feedback-title mb-0 text-truncate">
            {{ activeGame?.name }}
          </p>
        </div>
      </div>

      <p class="panel-feedback-body mb-0">
        Bu oyun şu an oynadıklarından silinecek. Emin misin?
      </p>

      <div class="w-100 d-flex align-center justify-end ga-2 mt-1">
        <v-btn
          variant="text"
          color="grey-lighten-1"
          :ripple="false"
          prepend-icon="mdi-close"
          text="İptal"
          @click="removeDialog = false"
        />
        <v-btn
          color="error"
          variant="flat"
          :ripple="false"
          :loading="isRemoving"
          prepend-icon="mdi-trash-can-outline"
          text="Evet, kaldır"
          @click="confirmRemoveGame"
        />
      </div>
    </div>
  </v-dialog>

  <!-- Başarı feedback -->
  <v-dialog
    v-model="toast.show"
    :max-width="540"
    scrim="rgba(0,0,0,0.82)"
  >
    <div class="panel-toast">
      <v-btn
        class="panel-toast__close"
        icon="mdi-close"
        size="small"
        variant="text"
        color="grey-lighten-1"
        :ripple="false"
        @click="toast.show = false"
      />

      <div class="panel-toast__glow" aria-hidden="true" />

      <div class="panel-toast__media">
        <img
          v-if="toast.cover"
          :src="toast.cover"
          alt=""
          class="panel-toast__cover"
        />
        <div class="panel-toast__check">
          <img
            :src="successfullyDoneImg"
            alt=""
            class="panel-toast__anim"
          />
        </div>
      </div>

      <p class="panel-toast__eyebrow">Tamamlandı</p>
      <p class="panel-toast__title">Tebrikler!</p>
      <p class="panel-toast__game">{{ toast.gameName }}</p>
      <p class="panel-toast__msg">{{ toast.msg }}</p>

      <div class="panel-toast__actions">
        <v-btn
          variant="text"
          color="grey-lighten-1"
          :ripple="false"
          text="Kapat"
          @click="toast.show = false"
        />
        <v-btn
          color="success"
          variant="flat"
          :ripple="false"
          prepend-icon="mdi-trophy-outline"
          text="Bitirdiklerime git"
          @click="goCompleted"
        />
      </div>
    </div>
  </v-dialog>
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
import PanelPageTitle from "~/components/panel/PanelPageTitle.vue";
import successfullyDoneImg from "~/assets/img/successfully_done_anim.gif";
import { resolveGameCardImage } from "~/composables/data/handleData";
import store from "~/store/store";
import { useAppLocale } from "~/composables/useAppLocale";
import {
  batchDeleteUserListGames,
  usePanelBulkEdit,
} from "~/composables/usePanelBulkEdit";
import { usePanelListPagination } from "~/composables/usePanelListPagination";
import { isAbortError } from "~/utils/isAbortError";
import { shouldMirrorToThisYearList } from "~/utils/gameYear";
import { gameDoc, gamesCollection } from "~/utils/channelOwnerGames";

const { $firestore } = useNuxtApp();
const _store = store();
const { tx } = useAppLocale();
const router = useRouter();

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
const isCompleting = ref(false);
const isRemoving = ref(false);

const completeDialog = ref(false);
const removeDialog = ref(false);
const activeGame = ref<any | null>(null);

const toast = ref({
  show: false,
  msg: "",
  gameName: "",
  cover: "",
});
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const games = ref<any[]>([]);
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

const showToast = (game: any, msg: string) => {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value = {
    show: true,
    msg,
    gameName: game?.name || "Oyun",
    cover: resolveGameCardImage(game),
  };
  toastTimer = setTimeout(() => {
    toast.value.show = false;
  }, 4800);
};

const goCompleted = () => {
  toast.value.show = false;
  router.push("/dashboard/completed");
};

const getGames = async () => {
  if (!_store.user?.uid || !$firestore) return;

  try {
    isLoading.value = true;
    const gamesCol = gamesCollection(
      $firestore,
      _store.user.uid,
      "current_games"
    );
    const gamesSnapshot = await getDocs(gamesCol);

    const gamesList = gamesSnapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
    }));

    games.value = _.sortBy(gamesList, (g: any) => g.released).reverse();
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

const addGameToDb = async () => {
  if (
    !_store.user?.uid ||
    !$firestore ||
    selectedGamesAfterResearch.value.length === 0
  )
    return;

  try {
    isAddingToDb.value = true;
    const gamesCol = gamesCollection(
      $firestore,
      _store.user.uid,
      "current_games"
    );

    for (const game of selectedGamesAfterResearch.value) {
      await addDoc(gamesCol, {
        ...game,
        createdAt: serverTimestamp(),
      });
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
  console.log("Game clicked:", item);
};

const openCompleteDialog = (game: any) => {
  activeGame.value = game;
  completeDialog.value = true;
};

const openRemoveDialog = (game: any) => {
  activeGame.value = game;
  removeDialog.value = true;
};

const confirmRemoveGame = async () => {
  const game = activeGame.value;
  if (!_store.user?.uid || !$firestore || !game?.firestoreId) return;

  try {
    isRemoving.value = true;
    await deleteDoc(
      gameDoc($firestore, _store.user.uid, "current_games", game.firestoreId)
    );
    removeDialog.value = false;
    activeGame.value = null;
    await getGames();
  } catch (error) {
    console.error("Error deleting game:", error);
  } finally {
    isRemoving.value = false;
  }
};

const confirmBulkDelete = async () => {
  if (!_store.user?.uid || !$firestore || !selectedIds.value.length) return;

  try {
    isBulkDeleting.value = true;
    await batchDeleteUserListGames(
      $firestore,
      _store.user.uid,
      "current_games",
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

const confirmCompleteGame = async () => {
  const game = activeGame.value;
  if (!_store.user?.uid || !$firestore || !game?.firestoreId) return;

  try {
    isCompleting.value = true;
    const uid = _store.user.uid;
    const { firestoreId, ...rest } = game;
    const payload = {
      ...rest,
      createdAt: serverTimestamp(),
      completed_at: new Date().toISOString(),
    };

    await addDoc(gamesCollection($firestore, uid, "completed_games"), payload);
    if (shouldMirrorToThisYearList()) {
      await addDoc(
        gamesCollection($firestore, uid, "target_2026_games"),
        payload
      );
    }
    await deleteDoc(gameDoc($firestore, uid, "current_games", firestoreId));

    completeDialog.value = false;
    const snapshot = { ...game };
    activeGame.value = null;
    await getGames();
    showToast(
      snapshot,
      "Bitirdiğin oyunlara taşındı. İstersen koleksiyonundan kontrol et."
    );
  } catch (error) {
    console.error("Error completing game:", error);
  } finally {
    isCompleting.value = false;
  }
};

onMounted(() => {
  getGames();
});
</script>

<style scoped>
@import "~/assets/css/main.css";

.panel-feedback-card {
  position: relative;
  border-radius: 1.15rem;
  background: linear-gradient(
    168deg,
    rgba(36, 40, 48, 0.98) 0%,
    rgba(20, 22, 28, 0.99) 45%,
    rgba(12, 14, 18, 1) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 28px 72px rgba(0, 0, 0, 0.75),
    0 0 0 1px rgba(255, 255, 255, 0.06) inset;
}

.panel-feedback-cover {
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.panel-feedback-eyebrow {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #69f0ae;
}

.panel-feedback-eyebrow--warn {
  color: #ff8a80;
}

.panel-feedback-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.25;
}

.panel-feedback-body {
  font-size: 0.9rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.62);
}

.panel-toast {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 18rem;
  padding: 1.75rem 1.5rem 1.35rem;
  border-radius: 1.4rem;
  background: linear-gradient(
    165deg,
    rgb(28 36 44 / 0.98) 0%,
    rgb(12 18 24 / 0.99) 48%,
    rgb(8 12 16 / 1) 100%
  );
  border: 1px solid rgb(105 240 174 / 0.28);
  box-shadow:
    0 32px 80px rgb(0 0 0 / 0.72),
    0 0 0 1px rgb(255 255 255 / 0.05) inset,
    0 0 48px rgb(105 240 174 / 0.12);
}

.panel-toast__glow {
  position: absolute;
  top: -30%;
  left: 50%;
  width: 18rem;
  height: 12rem;
  transform: translateX(-50%);
  background: radial-gradient(
    circle,
    rgb(105 240 174 / 0.28) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.panel-toast__close {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  z-index: 2;
}

.panel-toast__media {
  position: relative;
  z-index: 1;
  width: 7.5rem;
  height: 7.5rem;
  margin-bottom: 0.35rem;
}

.panel-toast__cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 1.15rem;
  border: 2px solid rgb(105 240 174 / 0.35);
  box-shadow: 0 14px 28px rgb(0 0 0 / 0.45);
}

.panel-toast__check {
  position: absolute;
  right: -0.55rem;
  bottom: -0.45rem;
  display: grid;
  place-items: center;
  width: 3.1rem;
  height: 3.1rem;
  border-radius: 999px;
  background: rgb(8 14 12 / 0.92);
  border: 2px solid rgb(105 240 174 / 0.55);
  box-shadow: 0 8px 18px rgb(0 0 0 / 0.4);
}

.panel-toast__anim {
  width: 2.35rem;
  height: 2.35rem;
  object-fit: contain;
}

.panel-toast__eyebrow {
  position: relative;
  z-index: 1;
  margin: 0.85rem 0 0;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #69f0ae;
}

.panel-toast__title {
  position: relative;
  z-index: 1;
  margin: 0.35rem 0 0;
  font-size: clamp(1.55rem, 3.5vw, 1.95rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #e8fff0;
}

.panel-toast__game {
  position: relative;
  z-index: 1;
  margin: 0.55rem 0 0;
  max-width: 26rem;
  font-size: 1.05rem;
  font-weight: 750;
  line-height: 1.3;
  color: #9ff5c0;
}

.panel-toast__msg {
  position: relative;
  z-index: 1;
  margin: 0.45rem 0 0;
  max-width: 26rem;
  font-size: 0.9rem;
  font-weight: 550;
  line-height: 1.45;
  color: rgb(226 232 240 / 0.72);
}

.panel-toast__actions {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  margin-top: 1.25rem;
  width: 100%;
}
</style>
