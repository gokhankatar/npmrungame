<script setup lang="ts">
/** Eski /insights URL → Steam hub Keşif tab’ı */
definePageMeta({
  layout: "panel",
  ssr: false,
  middleware: "auth",
});

await navigateTo("/dashboard/platforms/steam?tab=insights", {
  replace: true,
});
</script>

<template>
  <div />
</template>
