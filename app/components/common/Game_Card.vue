<template>
  <v-col v-for="(item, index) of arr" :key="index" cols="12" sm="6" md="4" lg="3">
    <v-skeleton-loader v-if="loading" type="card" class="rounded-lg h-100" />

    <v-card
      v-if="!loading"
      class="game-card bg-transparent rounded-lg cursor-pointer transition"
      :height="smallScreen ? 250 : 375"
      :ripple="false"
      @click="onRowClick(item)"
    >
      <v-img :src="item.background_image" class="game-card-img h-100 rounded-lg" cover />

      <!-- Playtime -->
      <v-tooltip text="Toplam oynama süresi (Ana Hikaye)" location="top">
        <template #activator="{ props }">
          <v-chip
            v-if="item.playtime"
            v-bind="props"
            class="playtime-icon rounded-xl ma-1 ma-lg-2"
            :ripple="false"
            size="small"
            variant="elevated"
            prepend-icon="mdi-timer-outline"
            color="black"
            :text="`${item.playtime} saat`"
          />
        </template>
      </v-tooltip>

      <!-- Metacritic -->
      <v-tooltip text="Metacritic puanı" location="top">
        <template #activator="{ props }">
          <v-chip
            v-if="item.metacritic"
            v-bind="props"
            class="metacritic-point rounded-xl ma-1 ma-lg-2"
            :ripple="false"
            size="small"
            :prepend-icon="item.metacritic < 90 ? 'mdi-star-outline' : ''"
            :prepend-avatar="item.metacritic >= 90 ? fireAnimation : ''"
            variant="elevated"
            :color="useMetacriticStyle(item.metacritic).color"
            :text="item.metacritic"
          />
        </template>
      </v-tooltip>

      <div
        class="game-card-info d-flex flex-column align-start ga-1 ga-lg-2 pa-1 pa-lg-2"
      >
        <!-- Name & Date -->
        <div class="d-flex flex-column align-start">
          <p class="default-title-letter text-caption text-lg-subtitle-2 text-white">
            {{ item.name }}
          </p>
          <p class="text-white text-caption">
            {{ new Date(item.released).getFullYear() }}
          </p>

          <!-- Platforms -->
          <div class="d-flex align-center flex-wrap ga-1">
            <template v-for="icon in getUniquePlatformIcons(item.platforms)" :key="icon">
              <v-icon v-if="icon" size="x-small" color="grey-lighten-1" :icon="icon" />
            </template>
          </div>
        </div>

        <!-- Genres -->
        <div class="d-flex flex-wrap ga-1">
          <v-chip
            v-for="(genre, index) in item.genres"
            :key="index"
            :size="smallScreen ? 'x-small' : 'small'"
            variant="outlined"
            :ripple="false"
            :text="genre.name"
          />
        </div>

        <!-- Tags -->
        <div class="d-none d-md-flex flex-wrap ga-1">
          <v-chip
            v-for="(tag, index) in useLimitedTags(item.tags, 3).visibleTags"
            :key="index"
            color="grey-darken-1"
            size="x-small"
            class="rounded text-black"
            variant="elevated"
            :ripple="false"
            :text="truncateText(tag.name, 15)"
          />
          <v-chip
            v-if="useLimitedTags(item.tags, 3).hiddenCount > 0"
            color="grey-darken-2"
            size="x-small"
            variant="elevated"
            class="rounded text-white"
            :ripple="false"
            :text="useLimitedTags(item.tags, 3).hiddenText"
          />
        </div>
      </div>
    </v-card>
  </v-col>
</template>
<script lang="ts" setup>
import fireAnimation from "~/assets/img/fire_anim.gif";
import { truncateText } from "~/composables/core/basicFunc";
import {
  getUniquePlatformIcons,
  useLimitedTags,
  useMetacriticStyle,
} from "~/composables/data/handleData";

defineProps<{
  arr: any[];
  loading: boolean;
  onRowClick: (item: any) => void;
}>();

const display = useDisplay();
const smallScreen = computed(() => display.smAndDown.value);
</script>

<style scoped>
@import "~/assets/css/main.css";
</style>
