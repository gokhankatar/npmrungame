<script setup lang="ts">
definePageMeta({
  layout: "panel",
  ssr: false,
  middleware: "auth",
});

useSeoMeta({
  title: "2026 hedeflerim | npmrungame",
  robots: "noindex, nofollow",
});
</script>

<template>
  <User_Target_2026_Games />
</template>
