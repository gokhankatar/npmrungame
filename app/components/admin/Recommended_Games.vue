<template>
  <v-row class="d-flex justify-center align-center mx-auto mt-5 mt-lg-10">
    <v-col cols="12" lg="10" class="d-flex justify-space-between align-center">
      <div
        class="d-flex align-center justify-center justify-sm-start ga-2 ga-lg-5 mt-2 mt-lg-5"
      >
        <Animated_Text
          text="Önerilen Oyunlar"
          class="cursor-pointer"
          :msPerChar="50"
          :duration="550"
          :loop="true"
        />
      </div>

      <div class="d-flex align-center ga-1 ga-lg-2">
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
          :color="isGettingRecommendedGames ? 'green-accent-2' : 'grey-lighten-1'"
          @click="getRecommendedGames"
          :size="smallScreen ? 'x-small' : 'small'"
          :loading="isGettingRecommendedGames"
        />
      </div>
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

    <v-col cols="12" lg="10">
      <Admin_Game_Table
        :loading="isGettingRecommendedGames"
        :arr="recommendedGames"
        :onDeleteClick="handleDeleteGame"
        :onRowClick="handleRowClick"
      />
    </v-col>
  </v-row>

  <!-- Confirmation Pop Up -->
  <v-dialog
    v-model="isOpenConfirmationDialog"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.7rem);
      -webkit-backdrop-filter: blur(0.7rem);
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
import { doc, getDocs, collection, deleteDoc } from "firebase/firestore";
import _ from "lodash";
import { truncateText } from "~/composables/core/basicFunc";
import {
  getUniquePlatformIcons,
  useMetacriticStyle,
} from "~/composables/data/handleData";
import successfullyDoneImg from "~/assets/img/successfully_done_anim.gif";
import Admin_Game_Table from "../common/Admin_Game_Table.vue";
import Animated_Text from "../common/Animated_Text.vue";

const { $firestore } = useNuxtApp();

const display = useDisplay();
const smallScreen = computed(() => display.smAndDown.value);
const isExtraLargeScreen = computed(() => display.xlAndUp.value);

const isGettingRecommendedGames = ref(false);
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
const recommendedGames = ref<any[]>([]);
const activeGame = ref<any | null>(null);

const displayedDescription = computed(() => {
  if (showFullDescription.value) return activeGame.value?.description;
  return truncateText(activeGame.value?.description, 250);
});

const getRecommendedGames = async () => {
  try {
    isGettingRecommendedGames.value = true;

    const gamesCol = collection($firestore, "recommended_games");
    const gamesSnapshot = await getDocs(gamesCol);

    const gamesList = gamesSnapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
    }));

    recommendedGames.value = gamesList;
  } catch (error) {
    console.error("Error getting games :", error);
    return [];
  } finally {
    setTimeout(() => {
      isGettingRecommendedGames.value = false;
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

    await deleteDoc(doc($firestore, "recommended_games", firestoreId));

    console.log("The game deleted from DB :", firestoreId);
    sendNotification(`${activeGame.value?.name} adlı oyun veritabanından silindi!`);
  } catch (error) {
    console.error("Silme hatası:", error);
  } finally {
    isOpenConfirmationDialog.value = false;
    isDeletingGameFromDb.value = false;

    // Update List
    await getRecommendedGames();
  }
};

const sortGames = (games: any[], type: "new" | "old") => {
  if (!recommendedGames.value || recommendedGames.value?.length === 0) return [];

  const sorted = _.sortBy(recommendedGames.value, (game: any) => game?.released ?? 0);

  return type === "new" ? sorted.reverse() : sorted;
};

const sortBy = (mode: string) => {
  if (mode === "new") recommendedGames.value = sortGames(recommendedGames.value, "new");
  if (mode === "old") recommendedGames.value = sortGames(recommendedGames.value, "old");
};

onMounted(() => {
  getRecommendedGames();
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/admin.css";
@import "~/assets/css/completed_games.css";
</style>
