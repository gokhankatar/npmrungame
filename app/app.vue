<script lang="ts" setup>
import store from "./store/store";

const _store = store();

useHead({
  title: "npmrungame – Oyun Keşfet ve Favori Oyunlarını Öner",
  meta: [
    {
      name: "description",
      content:
        "npmrungame.com üzerinde oyunları keşfet, favori oyunlarını öner ve özel önerilerimizi gör.",
    },
    { name: "robots", content: "index, follow" },

    { property: "og:title", content: "npmrungame – Oyun Keşfet" },
    {
      property: "og:description",
      content: "Oyunları keşfet, favori oyunlarını öner ve özel önerilerimizi gör.",
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.npmrungame.com" },
    {
      property: "og:image",
      content:
        "https://gbfhkvefbnlgkqaqqwxp.supabase.co/storage/v1/object/public/gokhan_katar_profile/Macbook-Air-www.npmrungame.com.png",
    },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "npmrungame – Oyun Keşfet" },
    {
      name: "twitter:description",
      content: "Oyunları keşfet, favori oyunlarını öner ve özel önerilerimizi gör.",
    },
    {
      name: "twitter:image",
      content:
        "https://gbfhkvefbnlgkqaqqwxp.supabase.co/storage/v1/object/public/gokhan_katar_profile/Macbook-Air-www.npmrungame.com.png",
    },
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
