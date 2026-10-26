<script lang="ts" setup>
import { useAppTheme } from "~/composables/useAppTheme";

const { theme } = useAppTheme();
const route = useRoute();

/** Admin + auth + dashboard: full-bleed (v-main sarmalayıcısı yok) */
const isBareLayout = computed(
  () =>
    route.meta.layout === "admin" ||
    route.meta.layout === "auth" ||
    route.meta.layout === "panel" ||
    route.meta.layout === "bare" ||
    route.meta.layout === false ||
    route.path.startsWith("/admin") ||
    route.path.startsWith("/auth") ||
    route.path.startsWith("/dashboard") ||
    route.path.startsWith("/top-10") ||
    route.path.startsWith("/game-detail")
);

useSiteSeo();
</script>

<template>
  <v-app :theme="theme || 'dark'">
    <NuxtLayout v-if="isBareLayout">
      <NuxtPage />
    </NuxtLayout>
    <v-main v-else class="root-main">
      <v-container fluid class="root-container pa-0">
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.root-main {
  padding: 0;
  overflow-x: hidden;
}

.root-container {
  max-width: 100%;
  margin: 0;
}
</style>
