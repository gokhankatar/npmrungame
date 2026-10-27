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
  color: var(--panel-accent, #69f0ae);
  text-shadow: 0 0 28px color-mix(in srgb, var(--panel-accent, #69f0ae) 28%, transparent);
}

/* Light: açık neon yeşil beyazda kayboluyor → koyu emerald */
:global(.panel-shell[data-theme="light"]) .ppt {
  color: #047857;
  text-shadow: none;
}
</style>
