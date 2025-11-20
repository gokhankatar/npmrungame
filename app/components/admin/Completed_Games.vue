<template>
  <v-row class="d-flex justify-center align-center mx-auto mt-5 mt-lg-10">
    <v-col cols="12" lg="10" class="d-flex justify-space-between align-center">
      <div class="d-flex align-center justify-center justify-sm-start ga-2 ga-lg-5 mt-2 mt-lg-5">
        <v-icon icon="mdi-trophy-outline" :size="smallScreen ? 'small' : 'x-large'" />
        <p class="shadowed-text text-subtitle-2 text-sm-subtitle-1 text-lg-h5 text-xl-h4 default-title-letter">
          Bitirdiğim Oyunlar <strong class="font-weight-bold default-title-letter">({{ completedGames?.length
          }})</strong>
        </p>
      </div>

      <v-btn icon="mdi-refresh" class="rounded text-caption text-lg-subtitle-2" :ripple="false" variant="tonal"
        @click="getCompletedGames" :size="smallScreen ? 'x-small' : 'small'" :loading="isGettingCompletedGames" />
    </v-col>

    <v-col cols="12" lg="10">
      <v-data-table :items="completedGames" :headers="header_completed_games" :loading="isGettingCompletedGames"
        class="admin-data-table rounded-lg w-100" items-per-page-text="Sayfa Başı Oyun Sayısı" hover>
        <template #item="{ item, index }">
          <tr class="table-row cursor-pointer" @click="handleRowClick(item)">
            <td>
              <div class="d-flex align-center ga-1 ga-lg-2 py-2">
                <img :src="item.background_image" width="100" class="rounded-lg h-100" cover />
                <p class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter">
                  {{ item.name }}
                </p>
              </div>
            </td>

            <td>
              <p class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter">
                {{ new Date(item.released).getFullYear() }}
              </p>
            </td>

            <td>
              <div class="d-flex align-center ga-1 flex-wrap py-1">
                <v-chip v-for="(genre, index) in item.genres" :key="index" :size="smallScreen ? 'x-small' : 'small'"
                  color="green-accent-2" variant="tonal" :ripple="false" :text="genre.name" />
              </div>
            </td>

            <td>
              <div class="d-flex align-center flex-wrap ga-1">
                <template v-for="icon in getUniquePlatformIcons(item.platforms)" :key="icon">
                  <v-icon v-if="icon" size="small" color="grey-lighten-1" :icon="icon" />
                </template>
              </div>
            </td>

            <td>
              <v-chip :ripple="false" size="small" :text="item.metacritic ?? '?'" />
            </td>

            <td>
              <v-btn @click="handleDeleteGame(item)" variant="tonal" prepend-icon="mdi-delete" text="Delete"
                color="error" block />
            </td>
          </tr>
        </template>

        <template #loading>
          <v-skeleton-loader class="bg-transparent" :type="completedGames.length > 10
            ? 'table-row@10'
            : `table-row@${completedGames.length}`
            " />
        </template>
      </v-data-table>
    </v-col>

    <v-col cols="12" lg="10">
      <v-btn :ripple="false" color="green-accent-2" text="Oyun Ekle" prepend-icon="mdi-plus" class="float-right"
        :block="smallScreen ? true : false" />
    </v-col>
  </v-row>

  <!-- Confirmation Pop Up -->
  <v-dialog v-model="isOpenConfirmationDialog" :max-width="450"
    style="background-color: rgba(0,0,0,.85); backdrop-filter: blur(.7rem); -webkit-backdrop-filter: blur(.7rem);">
    <div class="delete-game-pop-up d-flex flex-column align-start ga-2 ga-lg-4 rounded pa-2 pa-lg-5">
      <p class="text-subtitle-2 text-md-subtitle-1 text-xl-h5 default-title-letter text-grey-lighten-1">Bu oyunu
        veri
        tabanından
        silmek
        istediğinden emin misin ?</p>

      <v-divider color="white" class="w-100" />

      <div class="d-flex flex-column align-start ga-1">
        <v-img :src="activeGame?.background_image" width="75" />
        <p class="text-caption text-lg-subtitle-2 text-grey-lighten-1">{{ `${activeGame?.name}
          (${new Date(activeGame?.released).getFullYear()})`
        }}</p>
        <p v-html="truncateText(activeGame?.description, 150)" class="text-caption text-grey-lighten-3">
        </p>
      </div>

      <div class="w-100 d-flex align-center justify-end ga-1 mt-2">
        <v-btn @click="isOpenConfirmationDialog = false" :ripple="false" class="rounded"
          :size="isExtraLargeScreen ? 'md' : 'small'" color="grey-lighten-2" variant="text" prepend-icon="mdi-close"
          text="Iptal" />

        <v-btn @click="deleteThisGameFromDb(activeGame?.firestoreId)" :loading="isDeletingGameFromDb" :ripple="false"
          class="rounded" color="error" :size="isExtraLargeScreen ? 'md' : 'small'" variant="tonal"
          prepend-icon="mdi-delete" text="Evet" />
      </div>
    </div>
  </v-dialog>

  <v-snackbar v-model="isSuccessfullyDeleted" variant="elevated" color="error">
    <p class="text-caption text-lg-subtitle-2">{{ `${activeGame?.name} adlı oyun başarıyla silindi 👌` }}</p>
  </v-snackbar>
</template>
<script lang="ts" setup>
import { doc, getDocs, collection, deleteDoc } from "firebase/firestore";
import { truncateText } from "~/composables/core/basicFunc";
import { getUniquePlatformIcons } from "~/composables/data/handleData";
import { header_completed_games } from "~/composables/data/headerTables";

const { $firestore } = useNuxtApp();
const display = useDisplay();
const smallScreen = computed(() => display.smAndDown.value);
const isExtraLargeScreen = computed(() => display.xlAndUp.value)

const isGettingCompletedGames = ref(false);
const isOpenConfirmationDialog = ref(false);
const isDeletingGameFromDb = ref(false);
const isSuccessfullyDeleted = ref(false)

const completedGames = ref<any[]>([]);
const activeGame = ref<any | null>(null)

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

const handleRowClick = (item: any) => {
  console.log(item);
};

const handleDeleteGame = (game: any) => {
  activeGame.value = game;
  isOpenConfirmationDialog.value = true;
}

const deleteThisGameFromDb = async (firestoreId: string) => {
  try {
    isDeletingGameFromDb.value = true;

    await deleteDoc(doc($firestore, "completed_games", firestoreId));

    console.log("The game deleted from DB :", firestoreId);
    isSuccessfullyDeleted.value = true;

  } catch (error) {
    console.error("Silme hatası:", error);
  } finally {
    isOpenConfirmationDialog.value = false;
    isDeletingGameFromDb.value = false;

    // Update List
    await getCompletedGames();
  }
};

onMounted(() => {
  getCompletedGames();
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/completed_games.css";
</style>
