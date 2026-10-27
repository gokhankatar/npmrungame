<script setup lang="ts">
definePageMeta({
  layout: "panel",
  ssr: false,
  middleware: "auth",
});

await navigateTo({
  path: "/dashboard/platforms/steam",
  query: { tab: "achievements" },
  replace: true,
});
</script>

<template>
  <div />
</template>
