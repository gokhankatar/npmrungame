<template>
  <div
    class="navbar d-flex justify-space-between align-center mx-auto rounded py-1 py-lg-3 px-3 px-md-5 px-lg-7 px-xl-12"
    :class="isScrolledToBottom ? 'scrolled-navbar' : ''">
    <div class="d-flex align-center ga-1 ga-lg-2">
      <img :src="logo" :width="display.smAndDown.value ? 70:90" class="cursor-pointer" @click="router.replace('/')" />
      <v-chip :size="display.smAndDown.value ? 'x-small' : 'small'" variant="tonal" class="rounded" text="v1.1"
        color="green-accent-2" />
    </div>

    <div class="d-none d-lg-flex justify-center align-center ga-2 ga-lg-5">
      <div v-for="(item, index) of navbarListItems" :key="item.path" @click="goTo(item)"
        class="navbar-item transition d-flex align-center ga-1 pa-2 rounded-xl cursor-pointer"
        :class="route.fullPath.includes(item.path) ? 'active-navbar-item-link' : ''">
        <p class="default-title-letter transition text-caption text-lg-subtitle-2"
          :class="route.fullPath.includes(item.path) ? 'active-navbar-item-title' : ''">
          {{ item.title }}
        </p>
        <template v-if="loadingItem === item.path">
          <v-progress-circular indeterminate size="14" width="1"
            :color="route.fullPath.includes(item.path) ? 'black' : 'grey-lighten-1'" />
        </template>
        <v-icon v-else :icon="item.icon" :color="route.fullPath.includes(item.path) ? 'black' : 'grey-lighten-1'"
          class="navbar-item-icon transition" size="small" />
      </div>
    </div>

    <v-btn :size="isSmallScreen ? 'small' : 'default'" :ripple="false" prepend-icon="mdi-dots-grid" text="Menu"
      variant="outlined" class="d-flex d-lg-none text-capitalize default-title-letter" color="white"
      @click="isOpenResponsiveBar = !isOpenResponsiveBar" />
  </div>

  <Back_To_Admin />
  <Scroll_To_Top />

  <!-- ! Responsive Bar -->
  <transition name="slide-down">
    <div class="responsive-bar" v-if="isOpenResponsiveBar">
      <v-btn variant="text" icon="mdi-close" class="close-icon-in-responsive-bar ma-2" size="large"
        @click="isOpenResponsiveBar = false" />

      <div class="d-flex flex-column align-start ga-2 pa-5 mt-12">
        <div class="responsive-text cursor-pointer transition d-flex align-center ga-5 pa-1 rounded-lg"
          @click="handleRouteForResponsive('/')">
          <template v-if="loadingItem === '/'">
            <v-progress-circular indeterminate size="20" width="2" color="grey-darken-1" />
          </template>
          <v-icon v-else icon="mdi-home" size="large" color="grey-darken-1" />
          <p class="text-h5 text-sm-h4 default-title-letter text-grey-darken-1">
            Anasayfa
          </p>
        </div>

        <div class="responsive-text cursor-pointer transition d-flex align-center ga-5 pa-1 rounded-lg"
          v-for="(item, index) of navbarListItems" :key="item.title" @click="handleRouteForResponsive(item.path)">
          <template v-if="loadingItem === item.path">
            <v-progress-circular indeterminate size="20" color="grey-darken-1" />
          </template>
          <v-icon v-else :icon="item.icon" size="large" color="grey-darken-1" />
          <p class="text-h5 text-sm-h4 default-title-letter text-grey-darken-1">
            {{ item.title }}
          </p>
        </div>
      </div>

      <v-row class="action-buttons-in-responsive-bar w-100 mx-auto" dense>
        <v-col :cols="_store.isAdmin ? 6 : 12">
          <v-btn @click="handleRouteForResponsive('/contact')" variant="tonal" text="İletişim" class="text-capitalize"
            :size="isSmallScreen ? 'small' : 'default'" :ripple="false" prepend-icon="mdi-email" block />
        </v-col>
        <v-col cols="6" v-if="_store.isAdmin">
          <v-btn @click="handleRouteForResponsive('/admin')" variant="tonal" text="Admin Paneli" class="text-capitalize"
            :size="isSmallScreen ? 'small' : 'default'" :ripple="false" prepend-icon="mdi-security" block />
        </v-col>
      </v-row>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import logo from "@/assets/img/logo_fixed.webp";
import store from "~/store/store";
import Back_To_Admin from "../common/Back_To_Admin.vue";
import Scroll_To_Top from "../common/Scroll_To_Top.vue";

const router = useRouter();
const route = useRoute();
const _store = store();
const display = useDisplay();

const isSmallScreen = computed(() => display.smAndDown.value);

const isScrolledToBottom = ref(false);
const isOpenResponsiveBar = ref(false);

const loadingItem = ref<string | null>(null)

const goTo = async (item: { path: string; title: string }) => {
  loadingItem.value = item.path;
  await router.replace(item.path);
  loadingItem.value = null;
};

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

const handleRouteForResponsive = async (path: string) => {
  loadingItem.value = path;
  await router.replace(path);
  loadingItem.value = null;
  isOpenResponsiveBar.value = false;
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
