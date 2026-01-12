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
        class="admin-blog-list-item rounded-lg mb-2 cursor-pointer"
        @click="onRowClick(item)"
      >
        <template #prepend>
          <v-avatar :size="display.smAndDown.value ? 48 : 64" rounded="lg">
            <v-img :src="item.imageUrl" cover />
          </v-avatar>
        </template>

        <v-list-item-title class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter">
          {{ truncateText(item.title, 50) }}
        </v-list-item-title>

        <v-list-item-subtitle class="text-caption text-grey-lighten-2">
          {{ formatDateTR(item.createdAt) }}
        </v-list-item-subtitle>

        <template #append>
          <div class="d-flex align-center ga-2 flex-wrap">
            <!-- Keywords -->
            <div class="d-flex align-center ga-1 flex-wrap">
              <v-chip
                v-for="(keyword, idx) in item.keywords?.slice(0, 2)"
                :key="idx"
                :size="display.smAndDown.value ? 'x-small' : 'small'"
                color="green-accent-2"
                variant="tonal"
                :ripple="false"
                :text="truncateText(keyword, 15)"
                class="rounded-xl"
              />
              <v-chip
                v-if="item.keywords?.length > 2"
                :size="display.smAndDown.value ? 'x-small' : 'small'"
                color="grey-darken-1"
                variant="tonal"
                :ripple="false"
                :text="`+${item.keywords.length - 2}`"
                class="rounded-xl"
              />
            </div>

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
          Blog bulunamadı
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts" setup>
import { truncateText } from "~/composables/core/basicFunc";
import { useFirestoreDateFormatted } from "~/composables/data/handleData";

const { formatDateTR } = useFirestoreDateFormatted();
const display = useDisplay();

defineProps<{
  arr: any[];
  loading: boolean;
  onRowClick: (item: any) => void;
  onDeleteClick?: (item: any) => void;
}>();
</script>

<style scoped>
@import "~/assets/css/main.css";
</style>
