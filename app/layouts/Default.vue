<script lang="ts" setup>
import Navbar from "~/components/layout/Navbar.vue";
import Loading from "~/components/common/Loading.vue";

const isLoading = ref(true);

onMounted(async () => {
  await nextTick();

  setTimeout(() => {
    isLoading.value = false;
  }, 500);
});
</script>

<template>
  <Loading v-if="isLoading" />
  <template v-else>
    <Navbar />
    <NuxtPage />
  </template>
</template>
