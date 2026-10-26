<script setup lang="ts">
defineProps<{
  text: string;
}>();
</script>

<template>
  <h1 class="ppt">{{ text }}</h1>
</template>

<style scoped>
.ppt {
  margin: 0;
  font-family: "Montserrat", ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(1.55rem, 3.6vw, 2.35rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: linear-gradient(120deg, #ffffff 0%, #69f0ae 52%, #b9f6ca 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

:global(html:not(.dark)) .ppt {
  background: linear-gradient(120deg, #0f172a 0%, #047857 50%, #10b981 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
