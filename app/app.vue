<script lang="ts" setup>
import store from "./store/store";

const _store = store();
const route = useRoute();

const isAdminLayout = computed(
  () => route.meta.layout === "admin" || route.path.startsWith("/admin")
);

useSiteSeo();
</script>

<template>
  <v-app :theme="_store.theme">
    <!-- Admin: drawer + v-main doğrudan v-app altında (Vuetify app prop) -->
    <NuxtLayout v-if="isAdminLayout" />
    <v-main v-else class="root-main">
      <v-container fluid class="root-container pa-0">
        <NuxtLayout />
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
