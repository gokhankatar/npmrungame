<template>
    <v-row class="d-flex justify-center align-center mx-auto mt-5 mt-lg-10">
        <v-col cols="12" lg="10" class="d-flex justify-space-between align-center">
            <div class="d-flex align-center justify-center justify-sm-start ga-2 ga-lg-5 mt-2 mt-lg-5">
                <Animated_Text text="Ayarlar" class="cursor-pointer" :msPerChar="50" :duration="550" :loop="true" />
            </div>
        </v-col>

        <v-col cols="12" lg="10">
            <p class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter">Yakında...</p>
        </v-col>
    </v-row>
</template>
<script lang="ts" setup>
import store from '~/store/store';
import Animated_Text from '../common/Animated_Text.vue';


const _store = store()
</script>

<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/admin.css");
</style>