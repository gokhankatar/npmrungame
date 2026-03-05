<template>
  <v-row :dense="display.smAndDown.value">
    <v-col v-for="(item, index) of arr" :key="index" cols="6" md="4" lg="3" xl="2">
      <v-skeleton-loader
        v-if="loading"
        type="image"
        class="rounded-lg game-card-skeleton"
      />

      <v-card
        v-if="!loading"
        class="game-card bg-transparent rounded-lg cursor-pointer transition"
        :style="{ animationDelay: `${index * 0.1}s` }"
        :ripple="false"
        @click="onRowClick(item)"
      >
        <!-- Resim alanı - üstte sadece saat ve metacritic -->
        <div class="game-card-image-wrapper">
          <v-img
            :src="item.background_image ?? 'https://f4.bcbits.com/img/0016409163_71.jpg'"
            class="game-card-img rounded-t-lg"
            cover
            position="center center"
          />
          <div class="game-card-overlay"></div>

          <!-- Playtime & Metacritic - sadece sm+ ekranda resmin üzerinde -->
          <template v-if="!display.xs.value">
            <v-tooltip text="Toplam oynama süresi (Ana Hikaye)" location="top">
              <template #activator="{ props }">
                <v-chip
                  v-if="item.playtime"
                  v-bind="props"
                  class="playtime-icon rounded-xl ma-1"
                  :ripple="false"
                  size="x-small"
                  variant="elevated"
                  prepend-icon="mdi-timer-outline"
                  color="black"
                  :text="`${item.playtime} saat`"
                />
              </template>
            </v-tooltip>
            <div class="metacritic-point d-flex align-center ga-1 ma-1">
              <v-tooltip text="Metacritic puanı" location="top">
                <template #activator="{ props }">
                  <v-chip
                    v-if="item.metacritic"
                    v-bind="props"
                    class="rounded-xl"
                    :ripple="false"
                    size="x-small"
                    :prepend-icon="item.metacritic < 90 ? 'mdi-star-outline' : ''"
                    :prepend-avatar="item.metacritic >= 90 ? fireAnimation : ''"
                    variant="elevated"
                    :color="useMetacriticStyle(item.metacritic).color"
                    :text="item.metacritic"
                  />
                </template>
              </v-tooltip>
              <v-tooltip
                v-if="item.recommender_name"
                :text="`${item.recommender_name} önerdi`"
                location="top"
              >
                <template #activator="{ props }">
                  <v-icon
                    v-bind="props"
                    class="recommende-icon"
                    size="x-small"
                    color="deep-purple"
                    icon="mdi-thumb-up"
                  />
                </template>
              </v-tooltip>
            </div>
          </template>
        </div>

        <!-- Oyun bilgisi - resmin altında -->
        <div class="game-card-info">
          <p
            class="default-title-letter font-weight-medium"
            :class="display.xs.value ? 'extra-small-text' : 'text-caption'"
          >
            {{ truncateText(item.name, 30) }}
          </p>
          <div class="d-flex align-center ga-2 flex-wrap">
            <p class="text-caption text-grey-darken-1">
              {{ new Date(item.released).getFullYear() }}
            </p>
            <!-- xs ekranda sadece metacritic altta -->
            <template v-if="display.xs.value">
              <v-chip
                v-if="item.metacritic"
                size="x-small"
                variant="tonal"
                :ripple="false"
                :color="useMetacriticStyle(item.metacritic).color"
                :text="String(item.metacritic)"
              />
            </template>
          </div>

          <!-- Hover: Platform, tür, etiketler -->
          <div class="game-card-hover-details d-flex flex-wrap align-center ga-1 mt-1">
            <template v-for="icon in getUniquePlatformIcons(item.platforms)" :key="icon">
              <v-icon v-if="icon" size="x-small" color="grey-darken-1" :icon="icon" />
            </template>
            <v-chip
              v-for="(genre, index) in item.genres?.slice(0, 2)"
              :key="index"
              size="x-small"
              variant="tonal"
              :ripple="false"
              :text="truncateText(genre.name, 10)"
            />
          </div>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>
<script lang="ts" setup>
import fireAnimationSrc from "~/assets/img/fire_anim.gif";
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

const fireAnimation = fireAnimationSrc;
</script>

<style scoped>
@import "~/assets/css/main.css";

.game-card {
  position: relative;
  overflow: hidden;
  width: 100%;
}

/* Gradient overlay sadece resim alanında */
.game-card::before {
  display: none;
}

.game-card-image-wrapper {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.game-card-image-wrapper::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
  z-index: 1;
  pointer-events: none;
}

.game-card .game-card-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.game-card-skeleton {
  aspect-ratio: 16 / 9;
  width: 100%;
}

/* Oyun bilgisi - resmin dışında, cardın altında */
.game-card-info {
  position: relative;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 0 0 8px 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.game-card-hover-details {
  opacity: 0;
  max-height: 0;
  transition: opacity 0.3s ease, max-height 0.3s ease;
  overflow: hidden;
}

.game-card:hover .game-card-hover-details {
  opacity: 1;
  max-height: 60px;
}

/* xs ekranda hover efektleri yok */
@media (max-width: 599px) {
  .game-card:hover .game-card-hover-details {
    opacity: 0;
    max-height: 0;
  }

  .game-card:hover {
    transform: none !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
  }

  .game-card:hover .game-card-img {
    transform: none !important;
  }

  .game-card:hover .game-card-overlay {
    opacity: 0 !important;
  }

  .game-card:hover .metacritic-point,
  .game-card:hover .playtime-icon {
    transform: none !important;
  }
}
</style>
