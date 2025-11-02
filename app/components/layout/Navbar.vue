<template>
  <div
    class="navbar d-flex justify-space-between align-center mx-auto rounded py-2 px-3 px-sm-6 px-md-9 px-lg-12 px-xl-15 w-100 w-lg-75"
    :class="isScrolledToBottom ? 'scrolled-navbar' : ''"
  >
    <img :src="logoImg" cover width="200" height="50" />
    <div class="d-flex justify-center align-center ga-2 ga-lg-5">
      <div
        v-for="(item, index) of navbarListItems"
        :key="item.path"
        @click="router.replace(item.path)"
        class="navbar-item transition d-flex align-center ga-1 pa-2 rounded cursor-pointer"
      >
        <p
          class="default-title-letter transition text-caption text-lg-subtitle-2 text-grey-lighten-1"
        >
          {{ item.title }}
        </p>
        <v-icon
          :icon="item.icon"
          color="grey-lighten-1"
          class="navbar-item-icon transition"
          size="small"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import logoImg from "@/assets/img/logoImg.jpg";

const router = useRouter();
const route = useRoute();

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
