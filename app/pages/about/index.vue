<template>
  <v-responsive height="100" v-if="!isSmallScreen" />
  <v-responsive height="70" v-else />
  <div class="bg-grey">/about</div>
</template>
<script lang="ts" setup>
const display = useDisplay();
const isSmallScreen = computed(() => display.smAndDown.value);
</script>
<style scoped>
@import "~/assets/css/main.css";
</style>
