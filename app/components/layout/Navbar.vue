<template>
  <header class="navbar" :class="{ 'navbar--scrolled': isScrolledToBottom }">
    <div
      class="navbar-inner d-flex justify-space-between align-center w-100"
    >
      <div class="navbar-brand d-flex align-center ga-1 ga-lg-2">
        <img
          :src="logo"
          :width="display.smAndDown.value ? 70 : 90"
          class="cursor-pointer navbar-logo"
          alt="npmrungame"
          @click="router.push('/')"
        />
        <span class="navbar-version default-title-letter">v1.2</span>
      </div>

      <nav
        class="navbar-nav d-none d-lg-flex justify-end align-center ga-1 ms-auto"
        aria-label="Ana menü"
      >
        <button
          v-for="item in navbarListItems"
          :key="item.path"
          type="button"
          class="navbar-item d-flex align-center ga-2 cursor-pointer"
          :class="navItemClasses(item)"
          @click="goTo(item)"
        >
          <span class="navbar-item-icon-wrap" aria-hidden="true">
            <v-progress-circular
              v-if="loadingItem === item.path"
              indeterminate
              size="16"
              width="2"
              :color="navLoadingColor(item.path)"
            />
            <v-icon v-else :icon="item.icon" class="navbar-item-icon" size="18" />
          </span>
          <span class="navbar-item-label default-title-letter">
            {{ navLabel(item) }}
          </span>
        </button>
      </nav>

      <v-btn
        v-if="isSmallScreen"
        :icon="isOpenResponsiveBar ? 'mdi-close' : 'mdi-menu'"
        size="small"
        :ripple="false"
        variant="outlined"
        rounded="pill"
        class="d-lg-none menu-toggle-btn navbar-menu-btn"
        :class="{ 'menu-toggle-btn-open': isOpenResponsiveBar }"
        @click="isOpenResponsiveBar = !isOpenResponsiveBar"
      />
      <v-btn
        v-else
        :prepend-icon="isOpenResponsiveBar ? 'mdi-close' : 'mdi-menu'"
        text="Menü"
        :ripple="false"
        variant="outlined"
        rounded="pill"
        class="d-none d-sm-flex d-lg-none text-capitalize default-title-letter menu-toggle-btn navbar-menu-btn"
        :class="{ 'menu-toggle-btn-open': isOpenResponsiveBar }"
        @click="isOpenResponsiveBar = !isOpenResponsiveBar"
      />
    </div>
  </header>

  <transition name="slide-down">
    <div v-if="isOpenResponsiveBar" class="responsive-bar">
      <div class="responsive-bar-header d-flex justify-space-between align-center pa-3">
        <img
          :src="logo"
          :width="display.smAndDown.value ? 70 : 90"
          class="cursor-pointer logo-in-responsive-bar"
          alt="npmrungame"
          @click="handleRouteForResponsive('/')"
        />
        <v-btn
          variant="text"
          icon="mdi-close"
          class="close-icon-in-responsive-bar"
          size="large"
          :ripple="false"
          @click="isOpenResponsiveBar = false"
        />
      </div>

      <nav class="responsive-bar-nav d-flex flex-column align-start ga-2 pa-4 mt-2">
        <button
          type="button"
          class="responsive-nav-item d-flex align-center ga-4"
          :class="{ 'responsive-nav-item--active': route.path === '/' }"
          @click="handleRouteForResponsive('/')"
        >
          <v-progress-circular
            v-if="loadingItem === '/'"
            indeterminate
            size="20"
            width="2"
            color="#69f0ae"
          />
          <v-icon v-else icon="mdi-home" size="large" />
          <p class="responsive-nav-label text-h6 text-sm-h5 default-title-letter">Anasayfa</p>
        </button>

        <button
          v-for="item in navbarListItems"
          :key="item.path"
          type="button"
          class="responsive-nav-item d-flex align-center ga-4"
          :class="responsiveNavClasses(item.path)"
          @click="handleRouteForResponsive(item.path)"
        >
          <v-progress-circular
            v-if="loadingItem === item.path"
            indeterminate
            size="20"
            width="2"
            :color="navLoadingColor(item.path)"
          />
          <v-icon v-else :icon="item.icon" size="large" />
          <p class="responsive-nav-label text-h6 text-sm-h5 default-title-letter">
            {{ item.title }}
          </p>
        </button>
      </nav>

      <v-row class="action-buttons-in-responsive-bar w-100 mx-auto" dense>
        <v-col :cols="_store.isAdmin ? 6 : 12">
          <v-btn
            variant="tonal"
            color="grey-lighten-1"
            text="İletişim"
            class="text-capitalize"
            :size="display.xs.value ? 'small' : 'default'"
            :ripple="false"
            prepend-icon="mdi-email-outline"
            block
            rounded="lg"
            @click="handleRouteForResponsive('/contact')"
          />
        </v-col>
        <v-col v-if="_store.isAdmin" cols="6">
          <v-btn
            variant="tonal"
            color="warning"
            text="Admin"
            class="text-capitalize"
            :size="display.xs.value ? 'small' : 'default'"
            :ripple="false"
            prepend-icon="mdi-shield-outline"
            block
            rounded="lg"
            @click="handleRouteForResponsive('/admin')"
          />
        </v-col>
      </v-row>
    </div>
  </transition>

  <Auth_Dialog v-model="isAuthDialogOpen" @success="handleAuthSuccess" />
</template>

<script lang="ts" setup>
import logo from "@/assets/img/logo_fixed.webp";
import { navbarListItems } from "~/utils/Navbar_List";
import store from "~/store/store";
import Auth_Dialog from "../common/Auth_Dialog.vue";
import { signOut } from "firebase/auth";

const router = useRouter();
const route = useRoute();
const _store = store();
const display = useDisplay();
const { $auth } = useNuxtApp();

const isSmallScreen = computed(() => display.smAndDown.value);
const isScrolledToBottom = ref(false);
const isOpenResponsiveBar = ref(false);
const isAuthDialogOpen = ref(false);
const loadingItem = ref<string | null>(null);

const isRadarPath = (path: string) => path.includes("radarimdaki-oyunlar");
const isRecommendPath = (path: string) => path.includes("recommend-games");

const isNavActive = (path: string) => {
  if (path === "/") return route.path === "/";
  return route.path === path || route.path.startsWith(`${path}/`);
};

const navLabel = (item: (typeof navbarListItems)[number]) =>
  display.xlAndUp.value ? item.title : (item.shortTitle ?? item.title);

const navItemTone = (path: string) => {
  if (isRadarPath(path)) return "navbar-item--tone-radar";
  if (isRecommendPath(path)) return "navbar-item--tone-recommend";
  return "navbar-item--tone-default";
};

const navItemClasses = (item: (typeof navbarListItems)[number]) => {
  const classes = [navItemTone(item.path)];
  if (!isNavActive(item.path)) return classes;
  if (isRadarPath(item.path)) classes.push("navbar-item--active-radar");
  else if (isRecommendPath(item.path)) classes.push("navbar-item--active-recommend");
  else classes.push("navbar-item--active");
  return classes;
};

const navLoadingColor = (path: string) => {
  if (isRadarPath(path)) return "#ffb74d";
  if (isRecommendPath(path)) return "#ce93d8";
  return "#69f0ae";
};

const responsiveNavClasses = (path: string) => {
  const classes: string[] = [];
  if (isRadarPath(path)) classes.push("responsive-nav-item--tone-radar");
  else if (isRecommendPath(path)) classes.push("responsive-nav-item--tone-recommend");
  if (!isNavActive(path)) return classes;
  if (isRadarPath(path)) classes.push("responsive-nav-item--active-radar");
  else if (isRecommendPath(path)) classes.push("responsive-nav-item--active-recommend");
  else classes.push("responsive-nav-item--active");
  return classes;
};

const goTo = async (item: { path: string; title: string }) => {
  loadingItem.value = item.path;
  await router.push(item.path);
  loadingItem.value = null;
};

const handleScroll = () => {
  if (import.meta.client) {
    isScrolledToBottom.value = window.scrollY > 8;
  }
};

const handleRouteForResponsive = async (path: string) => {
  loadingItem.value = path;
  await router.push(path);
  loadingItem.value = null;
  isOpenResponsiveBar.value = false;
};

const handleAuthSuccess = () => {
  isOpenResponsiveBar.value = false;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/navbar.css");
</style>
