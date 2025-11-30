<template>
    <v-responsive height="100" />
    <v-row class="w-100 mx-auto">
        <v-col cols="12" md="6">
            <v-img :src="game?.background_image" cover class="rounded-lg" />
        </v-col>
        <v-col cols="12" md="6">
            {{ game }}
        </v-col>
    </v-row>
</template>
<script lang="ts" setup>
import axios from 'axios';
import store from '~/store/store';

const _store = store();
const config = useRuntimeConfig();
const display = useDisplay();

const isSmallScreen = computed(() => display.smAndDown.value)

const isGettingGame = ref(false);
const game = ref<any | null>(null)

const getGamesById = async () => {
    try {
        isGettingGame.value = true;

        const res = await axios.get(`https://api.rawg.io/api/games/${_store.active_detailed_game?.id}`, {
            params: {
                key: config.public.apiKey,
            },
        });

        game.value = res.data
        return res.data;
    } catch (err: any) {
        console.error("Error fetching game:", err.message);
    } finally {
        isGettingGame.value = false;
    }
}

onMounted(() => {
    getGamesById();
})
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/game_detail.css";
</style>