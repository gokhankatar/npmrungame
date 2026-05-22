<script lang="ts" setup>
import store from "./store/store";

const _store = store();
const route = useRoute();

const isAdminLayout = computed(
  () => route.meta.layout === "admin" || route.path.startsWith("/admin")
);

useHead({
  title: "npmrungame – 800,000'den fazla oyunları keşfet ve favori oyunlarını öner",
  meta: [
    {
      name: "description",
      content:
        "npmrungame.com üzerinde oyunları keşfet, favori oyunlarını öner ve özel önerilerimizi gör.",
    },
    { name: "robots", content: "index, follow" },

    // Open Graph (Facebook / LinkedIn)
    { property: "og:title", content: "npmrungame – Oyun Keşfet" },
    {
      property: "og:description",
      content: "Oyunları keşfet, favori oyunlarını öner ve özel önerilerimizi gör.",
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.npmrungame.com" },
    { property: "og:image", content: "https://www.npmrungame.com/og-image.png" },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "npmrungame – Oyun Keşfet" },
    {
      name: "twitter:description",
      content: "Oyunları keşfet, favori oyunlarını öner ve özel önerilerimizi gör.",
    },
    { name: "twitter:image", content: "https://www.npmrungame.com/og-image.png" },
  ],
  link: [{ rel: "canonical", href: "https://www.npmrungame.com" }],
});
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
