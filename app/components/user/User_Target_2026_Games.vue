<template>
  <v-row class="d-flex justify-center align-center mx-auto mt-5 mt-lg-10">
    <v-col cols="12" lg="10" class="d-flex justify-space-between align-center">
      <div
        class="d-flex align-center justify-center justify-sm-start ga-2 ga-lg-5 mt-2 mt-lg-5"
      >
        <Animated_Text
          text="2026 Hedef Oyunlar"
          class="cursor-pointer"
          :msPerChar="50"
          :duration="550"
          :loop="true"
        />
      </div>

      <div class="d-flex align-center ga-1 ga-lg-2">
        <!-- View Selector -->
        <v-menu :close-on-content-click="true" :offset="[5, 10]" location="bottom end">
          <template #activator="{ props }">
            <v-btn
              v-if="!display.xs.value"
              v-bind="props"
              icon="mdi-view-module"
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
              <v-list-item @click="viewMode = 'card'" prepend-icon="mdi-view-grid">
                <v-list-item-title
                  class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                  >Kart Görünümü</v-list-item-title
                >
              </v-list-item>

              <v-list-item @click="viewMode = 'list'" prepend-icon="mdi-view-list">
                <v-list-item-title
                  class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                  >Liste Görünümü</v-list-item-title
                >
              </v-list-item>

              <v-list-item @click="viewMode = 'table'" prepend-icon="mdi-table">
                <v-list-item-title
                  class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                  >Tablo Görünümü</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>

        <v-menu :close-on-content-click="true" :offset="[5, 10]" location="bottom end">
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
          :color="isLoading ? 'green-accent-2' : 'grey-lighten-1'"
          @click="getGames"
          :size="smallScreen ? 'x-small' : 'small'"
          :loading="isLoading"
        />

        <v-btn
          icon="mdi-plus"
          class="rounded text-caption text-lg-subtitle-2"
          :ripple="false"
          variant="text"
          rounded="xl"
          color="green-accent-2"
          @click="isAddGame = true"
          :size="smallScreen ? 'x-small' : 'small'"
        />
      </div>
    </v-col>

    <v-col cols="12" lg="10">
      <!-- Card View -->
      <Game_Card
        v-if="viewMode === 'card'"
        :loading="isLoading"
        :arr="games"
        :onRowClick="handleRowClick"
      />

      <!-- List View -->
      <Admin_Game_List
        v-else-if="viewMode === 'list'"
        :loading="isLoading"
        :arr="games"
        :onDeleteClick="handleDeleteGame"
        :onRowClick="handleRowClick"
      />

      <!-- Table View -->
      <Admin_Game_Table
        v-else
        :loading="isLoading"
        :arr="games"
        :onDeleteClick="handleDeleteGame"
        :onRowClick="handleRowClick"
      />
    </v-col>
  </v-row>

  <!-- Add Game Dialog -->
  <v-dialog
    v-model="isAddGame"
    :max-width="800"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.7rem);
      -webkit-backdrop-filter: blur(0.7rem);
    "
  >
    <div
      class="add-game-dialog d-flex flex-column align-start ga-2 ga-lg-4 rounded pa-2 pa-lg-5"
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

      <div class="d-flex align-center ga-2">
        <v-icon icon="mdi-plus" color="green-accent-2" size="large" />
        <p
          class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-grey-lighten-1 default-title-letter"
        >
          Oyun Ekle
        </p>
      </div>

      <v-divider color="white" class="w-100" />

      <v-text-field
        v-model="searchGameText"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        class="w-100 text-grey-lighten-1"
        color="grey-lighten-1"
        rounded="xl"
        label="Oyun Ara"
        placeholder="Oyun adı girin..."
        :density="display.lgAndUp.value ? 'comfortable' : 'compact'"
        clearable
        :loading="isSearchingGameLoading"
        @input="searchGames"
      />

      <div v-if="searchResults.length > 0" class="w-100">
        <div
          v-for="game in searchResults"
          :key="game.id"
          class="search-result-item d-flex align-center ga-3 pa-3 rounded-lg cursor-pointer mb-2"
          @click="selectGameAfterSearch(game)"
          :class="
            selectedGamesAfterResearch.some((g: any) => g.id === game.id)
              ? 'selected-game'
              : ''
          "
        >
          <v-img :src="game.background_image" width="64" height="64" class="rounded-lg" cover />
          <div class="d-flex flex-column flex-grow-1">
            <p class="text-subtitle-2 text-grey-lighten-1 default-title-letter">
              {{ game.name }}
            </p>
            <p class="text-caption text-grey-darken-1">
              {{ new Date(game.released).getFullYear() }}
            </p>
          </div>
          <v-icon
            :icon="
              selectedGamesAfterResearch.some((g: any) => g.id === game.id)
                ? 'mdi-check-circle'
                : 'mdi-circle-outline'
            "
            :color="
              selectedGamesAfterResearch.some((g: any) => g.id === game.id)
                ? 'green-accent-2'
                : 'grey-darken-1'
            "
          />
        </div>

        <v-row class="w-100 mx-auto d-flex align-center mt-3" dense>
          <v-col cols="12" sm="6">
            <v-btn
              @click="addGameToDb"
              :loading="isAddingToDb"
              :text="`Ekle (${selectedGamesAfterResearch?.length})`"
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
              text="Temizle"
              size="small"
              :ripple="false"
              class="text-capitalize"
              prepend-icon="mdi-broom"
              block
            />
          </v-col>
        </v-row>
      </div>
    </div>
  </v-dialog>
</template>

<script lang="ts" setup>
import axios from "axios";
import _ from "lodash";
import {
  doc,
  getDocs,
  collection,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import Admin_Game_Table from "../common/Admin_Game_Table.vue";
import Admin_Game_List from "../common/Admin_Game_List.vue";
import Game_Card from "../common/Game_Card.vue";
import Animated_Text from "../common/Animated_Text.vue";
import store from "~/store/store";

const { $firestore } = useNuxtApp();
const display = useDisplay();
const _store = store();

const smallScreen = computed(() => display.smAndDown.value);

const isLoading = ref(false);
const isAddGame = ref(false);
const isSearchingGameLoading = ref(false);
const isAddingToDb = ref(false);

const games = ref<any[]>([]);
const viewMode = ref<"card" | "list" | "table">("card");
const searchGameText = ref<string>("");
const searchResults = ref<any[]>([]);
const selectedGamesAfterResearch = ref<any[]>([]);

const getGames = async () => {
  if (!_store.user?.uid || !$firestore) return;

  try {
    isLoading.value = true;
    const gamesCol = collection(
      $firestore,
      "user_games",
      _store.user.uid,
      "target_2026_games"
    );
    const gamesSnapshot = await getDocs(gamesCol);

    const gamesList = gamesSnapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
    }));

    games.value = _.sortBy(gamesList, (g: any) => g.released).reverse();
  } catch (error) {
    console.error("Error getting games:", error);
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 250);
  }
};

const searchGames = _.debounce(async (value: string) => {
  if (!value || value.length < 3) {
    searchResults.value = [];
    return;
  }

  try {
    isSearchingGameLoading.value = true;
    const response = await axios.get(
      `https://api.rawg.io/api/games?key=${useRuntimeConfig().public.rawg_api_key}&search=${value}&page_size=10`
    );
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
    const gamesCol = collection(
      $firestore,
      "user_games",
      _store.user.uid,
      "target_2026_games"
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

const handleDeleteGame = async (game: any) => {
  if (!_store.user?.uid || !$firestore || !game.firestoreId) return;

  try {
    const gameDocRef = doc(
      $firestore,
      "user_games",
      _store.user.uid,
      "target_2026_games",
      game.firestoreId
    );
    await deleteDoc(gameDocRef);
    await getGames();
  } catch (error) {
    console.error("Error deleting game:", error);
  }
};

const sortBy = (type: "new" | "old") => {
  if (type === "new") {
    games.value = _.sortBy(games.value, (g: any) => g.released).reverse();
  } else {
    games.value = _.sortBy(games.value, (g: any) => g.released);
  }
};

onMounted(() => {
  getGames();
});
</script>

<style scoped>
@import "~/assets/css/main.css";

.search-result-item {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.search-result-item:hover {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.2);
}

.selected-game {
  background: rgba(76, 175, 80, 0.2) !important;
  border-color: rgba(76, 175, 80, 0.4) !important;
}

.add-game-dialog {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(0.5rem);
  -webkit-backdrop-filter: blur(0.5rem);
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}
</style>
