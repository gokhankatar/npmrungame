<script setup lang="ts">
definePageMeta({
  layout: "panel",
  ssr: false,
  middleware: "auth",
});

useSeoMeta({
  title: "Bir ara oynayacaklarım | npmrungame",
  robots: "noindex, nofollow",
});
</script>

<template>
  <User_To_Play_Games />
</template>
