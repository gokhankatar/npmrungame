<template>
  <div class="banner-container">
    <div
      class="banner-content d-flex flex-column align-center align-md-start ga-1 ga-md-3 ga-lg-5"
    >
      <p class="banner-content-title text-subtitle-1 text-md-h5 text-lg-h4 text-xl-h3">
        Sende Günden Güne Büyüyen Ekosistemin Bir Parçası Ol!
      </p>
      <div class="d-flex align center ga-2 ga-xl-5">
        <div
          class="discover-btn pa-1 pa-xl-3 d-flex align-center ga-2 ga-xl-5 cursor-pointer"
        >
          <v-icon
            class="discover-icon"
            icon="mdi-earth"
            :size="extraLgScreen ? 'medium' : 'x-small'"
          />
          <p
            class="text-subtitle-2 text-md-subtitle-1 text-xl-h5"
            style="letter-spacing: 1px !important; font-weight: 500"
          >
            Keşfet
          </p>
        </div>

        <div
          class="subscribe-btn pa-1 pa-xl-3 d-flex align-center ga-2 ga-xl-5 cursor-pointer"
        >
          <v-icon
            class="bell-icon"
            icon="mdi-bell"
            :size="extraLgScreen ? 'medium' : 'x-small'"
          />
          <p
            class="text-subtitle-2 text-md-subtitle-1 text-xlz-h5"
            style="letter-spacing: 1px !important; font-weight: 500"
          >
            Abone Ol
          </p>
        </div>
      </div>
    </div>
  </div>

  <v-responsive height="100vh" />

  <v-container class="pa-0 pa-lg-10 pa-xl-15"> </v-container>
</template>
<script lang="ts" setup>
import store from "~/store/store";

const _store = store();

useHead({
  title: "npmrungame",
});

const config = useRuntimeConfig();

// screen breakout
const display = useDisplay();
const smallScreen = computed(() => display.smAndDown.value);
const extraLgScreen = computed(() => display.xlAndUp.value);
</script>

<style scoped>
@import url("~/assets/css/main.css");
</style>
