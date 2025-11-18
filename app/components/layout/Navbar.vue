<template>
  <div
    class="navbar d-flex justify-space-between align-center mx-auto rounded px-1 px-lg-5 px-xl-8"
    :class="isScrolledToBottom ? 'scrolled-navbar' : ''"
  >
    <img
      :src="otherLogoImg"
      width="90"
      class="cursor-pointer"
      @click="router.replace('/')"
    />

    <div class="d-none d-lg-flex justify-center align-center ga-2 ga-lg-5">
      <div
        v-for="(item, index) of navbarListItems"
        :key="item.path"
        @click="router.replace(item.path)"
        class="navbar-item transition d-flex align-center ga-1 pa-2 rounded cursor-pointer"
        :class="route.fullPath.includes(item.path) ? 'active-navbar-item-link' : ''"
      >
        <p
          class="default-title-letter transition text-caption text-lg-subtitle-2"
          :class="route.fullPath.includes(item.path) ? 'active-navbar-item-title' : ''"
        >
          {{ item.title }}
        </p>
        <v-icon
          :icon="item.icon"
          :color="route.fullPath.includes(item.path) ? 'black' : 'grey-lighten-1'"
          class="navbar-item-icon transition"
          size="small"
        />
      </div>
    </div>

    <v-btn
      class="rounded d-flex d-lg-none"
      icon="mdi-menu"
      variant="tonal"
      :ripple="false"
      size="small"
    />
  </div>

  <v-btn
    v-if="_store.isAdmin"
    @click="router.replace('/admin')"
    class="back-to-admin-panel-btn text-caption text-lg-subtitle-2 default-title-letter"
    :ripple="false"
    text="Admin Paneline Dön"
    append-icon="mdi-arrow-right"
  />
</template>
<script lang="ts" setup>
import otherLogoImg from "@/assets/img/logo.jpeg";
import store from "~/store/store";

const router = useRouter();
const route = useRoute();
const _store = store();

const isScrolledToBottom = ref(false);

const handleScroll = () => {
  //@ts-ignore
  if (process.client) {
    if (window.scrollY > 0) {
      isScrolledToBottom.value = true;
    } else {
      isScrolledToBottom.value = false;
    }
  }
};

// 🖱️ DOM Events: Scroll
onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/navbar.css";
</style>
