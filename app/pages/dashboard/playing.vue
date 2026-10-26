<script setup lang="ts">
definePageMeta({
  layout: "panel",
  ssr: false,
  middleware: "auth",
});

useSeoMeta({
  title: "Şu an oynadıklarım | npmrungame",
  robots: "noindex, nofollow",
});
</script>

<template>
  <User_Current_Games />
</template>
