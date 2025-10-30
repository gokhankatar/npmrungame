<template>
    <v-row>
        <v-col cols="12" lg="4">
            <v-btn @click="_store.changeTheme"
                :prepend-icon="_store.theme == 'light' ? 'mdi-moon-waning-crescent' : 'mdi-weather-sunny'"
                :text="_store.theme == 'dark' ? 'light' : 'dark'" variant="tonal" :ripple="false" />
        </v-col>
    </v-row>
</template>
<script lang="ts" setup>
import store from '~/store/store';

const _store = store()
</script>
<style scoped></style>