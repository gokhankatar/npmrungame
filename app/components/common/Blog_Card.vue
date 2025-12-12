<template>
  <!-- All Blogs Skeleton -->
  <v-row class="mt-5 mt-lg-10 w-100 mx-auto" v-if="loading">
    <v-col cols="12" sm="6" lg="3" v-for="i in 8" :key="i">
      <v-card class="rounded-lg d-flex flex-column" :elevation="0">
        <!-- Skeleton Image -->
        <div class="w-100" style="aspect-ratio: 16/9">
          <v-skeleton-loader type="image" class="w-100 h-100" />
        </div>

        <!-- Skeleton Content -->
        <v-card-actions class="d-flex flex-column ga-2 pa-2 pa-lg-5 mb-4">
          <v-skeleton-loader type="text" width="70%" />
          <v-skeleton-loader type="text" width="90%" />
          <v-skeleton-loader type="chip" width="60%" />
        </v-card-actions>

        <!-- Skeleton Date -->
        <div class="px-2 mb-2">
          <v-skeleton-loader type="text" width="40%" />
        </div>
      </v-card>
    </v-col>
  </v-row>

  <!-- All Blogs -->
  <v-row class="mt-5 mt-lg-10" :density="isSmallScreen ? 'compact' : 'comfortable'">
    <v-col cols="12" sm="6" lg="3" v-for="(item, index) of arr" :key="index">
      <v-card
        class="blog-card cursor-pointer"
        :ripple="false"
        :elevation="0"
        @click="onRowClick(item)"
      >
        <div class="vote-icon ma-1 ma-lg-2" style="z-index: 10">
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-chip
                v-if="item?.average_votes > 0"
                v-bind="props"
                class="rounded-xl text-grey-darken-4"
                variant="elevated"
                prepend-icon="mdi-thumb-up"
                :color="getRatingColor(item?.average_votes ?? 0)"
                size="small"
                :ripple="false"
                :text="`${item?.average_votes?.toFixed(1) ?? 0} / 5`"
              />
            </template>
            <span>{{ item?.total_voters ?? 0 }} kişi oy verdi</span>
          </v-tooltip>
        </div>
        <v-img :src="item.imageUrl" class="blog-card-img rounded-lg w-100 h-50" cover />

        <v-card-actions class="d-flex flex-column align-start ga-1 ga-lg-2">
          <p
            class="text-subtitle-2 text-lg-subtitle-1 default-title-letter text-grey-lighten-1"
          >
            {{ item.title }}
          </p>

          <p class="d-flex d-md-none text-caption text-lg-subtitle-2 text-grey-darken-1">
            {{ truncateText(item.content_raw, 200) }}
          </p>

          <p class="d-none d-md-flex text-caption text-lg-subtitle-2 text-grey-darken-1">
            {{ truncateText(item.content_raw, 125) }}
          </p>

          <div class="d-flex d-sm-none d-flex flex-wrap align-center ga-1">
            <p class="text-caption text-grey-darken-1">Tarih :</p>
            <span class="text-caption text-grey-lighten-1">{{
              formatDateTR(item.createdAt)
            }}</span>
          </div>

          <div class="d-none d-sm-flex flex-wrap align-center ga-1">
            <v-chip
              class="rounded"
              variant="tonal"
              color="white"
              prepend-icon="mdi-tag"
              size="x-small"
              :ripple="false"
              v-for="(tag, tagIndex) of item.keywords"
              :text="tag"
            />
          </div>

          <div class="d-flex d-sm-none flex-wrap align-center ga-1">
            <p class="text-caption text-grey-darken-1">Etiketler :</p>
            <v-chip
              class="rounded"
              variant="tonal"
              color="green-accent-2"
              prepend-icon="mdi-tag"
              size="x-small"
              :ripple="false"
              v-for="(tag, tagIndex) of item.keywords"
              :text="tag"
            />
          </div>
        </v-card-actions>

        <span class="d-none d-sm-flex text-caption text-grey-lighten-1 ma-1 ma-lg-2">{{
          formatDateTR(item.createdAt)
        }}</span>
      </v-card>
    </v-col>
  </v-row>
</template>
<script lang="ts" setup>
import { truncateText } from "~/composables/core/basicFunc";
import { getRatingColor, useFirestoreDateFormatted } from "~/composables/data/handleData";

const { formatDateTR } = useFirestoreDateFormatted();

defineProps<{
  arr: any[];
  loading: boolean;
  onRowClick: (item: any) => void;
}>();

const display = useDisplay();
const isSmallScreen = computed(() => display.smAndDown.value);
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/blogs.css";
</style>
