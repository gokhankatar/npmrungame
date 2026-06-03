<script lang="ts" setup>
import Navbar from "~/components/layout/Navbar.vue";
import Loading from "~/components/common/Loading.vue";
import Footer from "~/components/layout/Footer.vue";
import Scroll_To_Top from "~/components/common/Scroll_To_Top.vue";
import Site_JsonLd from "~/components/seo/Site_JsonLd.vue";

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
    <Site_JsonLd />
    <Navbar />
    <NuxtPage />
    <Footer />
    <Scroll_To_Top />
  </template>
</template>

