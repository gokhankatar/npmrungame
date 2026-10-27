<script setup lang="ts">
const props = defineProps<{
  text: string;
}>();

const label = computed(() => props.text.toLocaleUpperCase("tr-TR"));
</script>

<template>
  <h1 class="ppt">{{ label }}</h1>
</template>

<style scoped>
.ppt {
  margin: 0;
  font-family: "Montserrat", "Segoe UI", ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(1.55rem, 3.6vw, 2.35rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: 0.04em;
  /* No background-clip:text — Chromium paints � for TR glyphs (Ş/İ/ı) with transparent fill */
  color: #9ff5c0;
  text-shadow: 0 0 28px rgba(105, 240, 174, 0.28);
}
</style>
