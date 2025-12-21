<script setup lang="ts">

useHead({ title: 'npmrungame | Sayfa Bulunamadı' })
const router = useRouter()
const route = useRoute();

const errorMsg = computed(() => `Kaybolmuş gibisin. Aradığın sayfa (${route.fullPath}) mevcut değil ya da bulunamadı.`)
</script>

<template>
    <div class="error-container">
        <v-empty-state class="error-content text-grey-lighten-1" color="grey-lighten-1" icon="mdi-magnify"
            title="Sayfa Bulunamadı" :text="errorMsg" action-text="Anasayfaya Dön"
            @click:action="router.push('/')" />
    </div>
</template>

<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/error.css");
</style>