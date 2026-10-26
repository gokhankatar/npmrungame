<template>
  <Game_Detail />
</template>

<script lang="ts" setup>
import Game_Detail from "~/components/common/Game_Detail.vue";
import store from "~/store/store";

definePageMeta({
  layout: "bare",
  ssr: false,
});

const _store = store();

useHead({
  title: `npmrungame | ${_store.active_detailed_game?.name || "Oyun"}`,
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/game_detail.css";
</style>
