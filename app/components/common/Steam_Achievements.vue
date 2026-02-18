<template>
  <div class="w-100">
    <!-- Loading -->
    <div v-if="loading" class="d-flex flex-column ga-2">
      <v-skeleton-loader type="card" v-for="i in 3" :key="i" class="rounded-lg" />
    </div>

    <!-- Achievements -->
    <div v-else-if="achievements && achievements.length > 0" class="d-flex flex-column ga-3">
      <div
        v-for="(achievement, index) in achievements"
        :key="index"
        class="achievement-card d-flex align-center ga-3 pa-3 pa-lg-4 rounded-lg"
        :class="{ 'achievement-unlocked': achievement.achieved === 1 }"
      >
        <div class="achievement-icon d-flex align-center justify-center">
          <v-img
            v-if="achievement.achieved === 1 && achievement.icon"
            :src="achievement.icon"
            width="64"
            height="64"
            class="rounded-lg"
            cover
          />
          <v-icon
            v-else
            icon="mdi-lock"
            size="64"
            color="grey-darken-2"
          />
        </div>

        <div class="d-flex flex-column flex-grow-1 ga-1">
          <p class="text-subtitle-2 text-lg-subtitle-1 text-grey-lighten-1 default-title-letter">
            {{ achievement.apiname }}
          </p>
          <p class="text-caption text-grey-darken-1">
            {{ achievement.description || "Açıklama yok" }}
          </p>
          <div class="d-flex align-center ga-2">
            <v-chip
              v-if="achievement.achieved === 1"
              size="small"
              color="success"
              variant="tonal"
              prepend-icon="mdi-check-circle"
              text="Kazanıldı"
              :ripple="false"
            />
            <v-chip
              v-else
              size="small"
              color="grey-darken-1"
              variant="tonal"
              prepend-icon="mdi-lock"
              text="Kilitli"
              :ripple="false"
            />
            <span v-if="achievement.unlocktime" class="text-caption text-grey-darken-1">
              {{ formatDate(achievement.unlocktime) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- No Achievements -->
    <div v-else class="d-flex flex-column align-center justify-center pa-5">
      <v-icon icon="mdi-trophy-outline" size="64" color="grey-darken-1" />
      <p class="text-subtitle-2 text-grey-lighten-1 mt-3">
        Bu oyun için başarı bulunamadı
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  achievements: any[];
  loading: boolean;
}>();

const formatDate = (timestamp: number) => {
  if (!timestamp || timestamp === 0) return "";
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>

<style scoped>
@import "~/assets/css/main.css";

.achievement-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(0.5rem);
  -webkit-backdrop-filter: blur(0.5rem);
  transition: all 0.3s ease;
}

.achievement-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.achievement-unlocked {
  border-color: rgba(76, 175, 80, 0.3);
  background: rgba(76, 175, 80, 0.05);
}

.achievement-icon {
  min-width: 64px;
  min-height: 64px;
}
</style>
