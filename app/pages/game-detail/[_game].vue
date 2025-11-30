<template>
    <Game_Detail />
</template>
<script lang="ts" setup>
import Game_Detail from '~/components/common/Game_Detail.vue';
import store from '~/store/store';

const _store = store();
const router = useRouter();

useHead({
    title: `npmrungame | ${_store.active_detailed_game?.name}`
})
</script>
<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/game_detail.css";
</style>