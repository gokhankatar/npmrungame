<script setup lang="ts">
definePageMeta({
  layout: "panel",
  ssr: false,
  middleware: "auth",
});

useSeoMeta({
  title: "Bitirdiğim oyunlar | npmrungame",
  robots: "noindex, nofollow",
});
</script>

<template>
  <User_Completed_Games />
</template>
