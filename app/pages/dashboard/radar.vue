<script setup lang="ts">
definePageMeta({
  layout: "panel",
  ssr: false,
  middleware: "auth",
});

useSeoMeta({
  title: "Radarımdaki oyunlar | npmrungame",
  robots: "noindex, nofollow",
});
</script>

<template>
  <User_Radar_Games />
</template>
