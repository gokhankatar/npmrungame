<script setup lang="ts">
/** Navbar/Footer yok — Top 9 paylaşım, oyun detayı vb. */
</script>

<template>
  <div class="bare-layout">
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

:global(html:not(.dark)) .bare-layout {
  background: #f1f5f9;
  color: #0f172a;
}
</style>
