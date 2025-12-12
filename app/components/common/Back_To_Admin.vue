<template>
  <!-- ! Only Development Mode -->

  <v-btn
    v-if="!_store.isAdmin"
    :ripple="false"
    class="dev-btn d-flex align-center"
    variant="outlined"
    rounded="xl"
    @mouseover="hoverDev = true"
    @mouseleave="hoverDev = false"
    @click="router.replace('/admin')"
  >
    <v-icon class="dev-icon" icon="mdi-login" />

    <transition name="text-slide">
      <span
        v-if="hoverDev"
        class="ml-2 ml-lg-3 dev-text default-title-letter text-caption text-lg-subtitle-2"
      >
        Admin Paneline Git
      </span>
    </transition>
  </v-btn>

  <v-btn
    v-if="_store.isAdmin"
    :ripple="false"
    class="back-btn d-flex align-center"
    :variant="display.smAndDown.value ? 'elevated' : 'outlined'"
    rounded="xl"
    @mouseover="hover = true"
    @mouseleave="hover = false"
    @click="router.replace('/admin')"
  >
    <v-icon class="back-icon" icon="mdi-arrow-right" />

    <transition name="text-slide">
      <span
        v-if="hover"
        class="ml-2 ml-lg-3 back-text default-title-letter text-caption text-lg-subtitle-2"
        >Admin Paneline Dön</span
      >
    </transition>
  </v-btn>
</template>
<script lang="ts" setup>
import store from "~/store/store";

const _store = store();
const router = useRouter();
const display = useDisplay();

const hover = ref(false);
const hoverDev = ref(false);
</script>

<style scoped>
@import "~/assets/css/main.css";

/* COMMON TRANSITION */
.text-slide-enter-active,
.text-slide-leave-active {
  transition: all 0.22s ease;
}

.text-slide-enter-from,
.text-slide-leave-to {
  opacity: 0;
  transform: translateX(-6px);
}

/* DEVELOPMENT BUTTON */
.dev-btn {
  position: fixed;
  bottom: 2rem;
  left: 1rem;
  z-index: 999999;
  text-transform: none;
  transition: all 0.2s ease;
}

.dev-icon {
  transition: transform 0.2s ease;
}

.dev-btn:hover .dev-icon {
  transform: scale(1.1);
}

/* ADMIN BUTTON */
.back-btn {
  position: fixed;
  bottom: 2rem;
  right: 1rem;
  z-index: 9999999;
  text-transform: none;
  transition: all 0.2s ease;
}

.back-icon {
  transition: transform 0.2s ease;
}

.back-btn:hover .back-icon {
  transform: scale(1.1);
}
</style>
