<script lang="ts" setup>
import store from "./store/store";

const _store = store();

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
    { property: "og:image", content: "https://www.npmrungame.com/og-image.png" }, // public klasörden

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "npmrungame – Oyun Keşfet" },
    {
      name: "twitter:description",
      content: "Oyunları keşfet, favori oyunlarını öner ve özel önerilerimizi gör.",
    },
    { name: "twitter:image", content: "https://www.npmrungame.com/og-image.png" }, // public klasörden
  ],
  link: [{ rel: "canonical", href: "https://www.npmrungame.com" }],
});

</script>

<template>
  <v-app :theme="_store.theme">
    <v-main>
      <v-container>
        <NuxtLayout />
      </v-container>
    </v-main>
  </v-app>
</template>
