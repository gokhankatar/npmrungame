<script setup lang="ts">

useHead({ title: 'npmrungame | Sayfa Bulunamadı' })
const router = useRouter()
</script>

<template>
    <div class="error-container">
        <v-empty-state class="error-content text-grey-lighten-1" color="grey-lighten-1" icon="mdi-magnify"
            title="Sayfa Bulunamadı" text="Kaybolmuş gibisin. Aradığın sayfa mevcut değil ya da bulunamadı."
            action-text="Anasayfaya Dön" @click:action="router.replace('/')" />
    </div>
</template>

<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/error.css");
</style>