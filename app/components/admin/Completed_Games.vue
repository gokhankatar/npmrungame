<template>
  <v-row class="d-flex justify-center align-center mx-auto mt-5 mt-lg-10">
    <v-col cols="12" lg="10">
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
    </v-col>

    <v-col cols="12" lg="10">
      <v-data-table
        :items="completedGames"
        :headers="header_completed_games"
        :loading="isGettingCompletedGames"
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
                  width="100"
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
              <div class="d-flex align-center ga-1 flex-wrap">
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
              <v-chip :ripple="false" size="small" :text="item.metacritic" />
            </td>

            <td>
              <v-btn
                variant="tonal"
                prepend-icon="mdi-delete"
                text="Delete"
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
              completedGames.length > 10
                ? 'table-row@10'
                : `table-row@${completedGames.length}`
            "
          />
        </template>
      </v-data-table>
    </v-col>

    <v-col cols="12" lg="10">
      <v-btn
        :ripple="false"
        color="green-accent-2"
        text="Oyun Ekle"
        prepend-icon="mdi-plus"
        class="float-right"
        :block="smallScreen ? true : false"
      />
    </v-col>
  </v-row>
</template>
<script lang="ts" setup>
import { doc, getDocs, collection } from "firebase/firestore";
import { getUniquePlatformIcons } from "~/composables/data/handleData";
import { header_completed_games } from "~/composables/data/headerTables";

const { $firestore } = useNuxtApp();
const display = useDisplay();
const smallScreen = computed(() => display.smAndDown.value);

const completedGames = ref<any[]>([]);
const isGettingCompletedGames = ref(false);

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

const handleRowClick = (item: any) => {
  console.log(item);
};

onMounted(() => {
  getCompletedGames();
});
</script>
<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/completed_games.css";
</style>
