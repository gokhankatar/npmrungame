<template>
  <div class="w-100">
    <v-skeleton-loader
      v-if="loading"
      v-for="i in 5"
      :key="i"
      type="list-item-avatar-two-line"
      class="mb-2 rounded-lg"
    />

    <v-list
      v-else
      class="bg-transparent"
      :density="display.smAndDown.value ? 'compact' : 'default'"
    >
      <v-list-item
        v-for="(item, index) in arr"
        :key="index"
        class="admin-game-list-item rounded-lg mb-2 cursor-pointer"
        @click="onRowClick(item)"
      >
        <template #prepend>
          <v-avatar :size="display.smAndDown.value ? 48 : 64" rounded="lg">
            <v-img :src="item.background_image" cover />
          </v-avatar>
        </template>

        <v-list-item-title class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter">
          {{ item.name }}
        </v-list-item-title>

        <v-list-item-subtitle class="text-caption text-grey-lighten-2">
          {{ new Date(item.released).getFullYear() }}
        </v-list-item-subtitle>

        <template #append>
          <div class="d-flex align-center ga-2 flex-wrap">
            <!-- Genres -->
            <div class="d-flex align-center ga-1 flex-wrap">
              <v-chip
                v-for="(genre, idx) in item.genres?.slice(0, 2)"
                :key="idx"
                :size="display.smAndDown.value ? 'x-small' : 'small'"
                color="green-accent-2"
                variant="tonal"
                :ripple="false"
                :text="genre.name"
                class="rounded-xl"
              />
              <v-chip
                v-if="item.genres?.length > 2"
                :size="display.smAndDown.value ? 'x-small' : 'small'"
                color="grey-darken-1"
                variant="tonal"
                :ripple="false"
                :text="`+${item.genres.length - 2}`"
                class="rounded-xl"
              />
            </div>

            <!-- Platforms -->
            <div class="d-flex align-center ga-1">
              <template v-for="icon in getUniquePlatformIcons(item.platforms)?.slice(0, 3)" :key="icon">
                <v-icon v-if="icon" :size="display.smAndDown.value ? 'x-small' : 'small'" color="grey-lighten-1" :icon="icon" />
              </template>
            </div>

            <!-- Metacritic -->
            <v-chip
              v-if="item.metacritic"
              :size="display.smAndDown.value ? 'x-small' : 'small'"
              :color="useMetacriticStyle(item.metacritic).color"
              variant="tonal"
              :ripple="false"
              :text="item.metacritic.toString()"
              class="rounded-xl"
            />

            <!-- Delete Button -->
            <v-btn
              v-if="onDeleteClick"
              @click.stop="onDeleteClick(item)"
              icon="mdi-delete"
              size="small"
              color="error"
              variant="text"
              :ripple="false"
            />
          </div>
        </template>
      </v-list-item>

      <v-list-item v-if="arr.length === 0" class="text-center">
        <v-list-item-title class="text-grey-lighten-1">
          Oyun bulunamadı
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts" setup>
import { getUniquePlatformIcons, useMetacriticStyle } from "~/composables/data/handleData";

defineProps<{
  arr: any[];
  loading: boolean;
  onDeleteClick?: (item: any) => void;
  onRowClick: (item: any) => void;
}>();

const display = useDisplay();
</script>

<style scoped>
.admin-game-list-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.admin-game-list-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(4px);
}
</style>
