<script setup lang="ts">
import { useAppTheme } from "~/composables/useAppTheme";

/** Navbar/Footer yok — Top 9 payla??m, oyun detay? vb. */
const { theme } = useAppTheme();
</script>

<template>
  <div class="bare-layout" :data-theme="theme">
    <slot />
  </div>
</template>

<style scoped>
.bare-layout {
  min-height: 100vh;
  min-height: 100dvh;
  background: #070b14;
  color: #e8eef7;
}

.bare-layout[data-theme="light"] {
  background: #f1f5f9;
  color: #0f172a;
}
</style>
