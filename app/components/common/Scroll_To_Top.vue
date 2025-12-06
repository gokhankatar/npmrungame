<template>
  <transition name="scroll-fade">
    <v-btn
      v-if="showScrollBtn"
      :ripple="false"
      class="scroll-top-btn d-flex align-center"
      variant="outlined"
      rounded="xl"
      @click="scrollToTop"
      @mouseover="hover = true"
      @mouseleave="hover = false"
    >
      <v-icon class="scroll-icon" icon="mdi-format-vertical-align-top" />

      <transition name="text-slide">
        <span
          v-if="hover"
          class="ml-2 scroll-text default-title-letter text-caption text-lg-subtitle-2"
        >
          Yukarı Çık
        </span>
      </transition>
    </v-btn>
  </transition>
</template>

<script setup lang="ts">
import { scrollToTop } from "~/composables/core/basicFunc";

const hover = ref(false);
const showScrollBtn = ref(false);

onMounted(() => {
  window.addEventListener("scroll", () => {
    showScrollBtn.value = window.scrollY > 300;
  });
});
</script>

<style scoped>
.scroll-top-btn {
  position: fixed;
  bottom: 5rem;
  right: 1rem;
  z-index: 999;
  text-transform: none;
  transition: all 0.2s ease;
  padding-left: 12px;
  padding-right: 14px;
}

/* Icon hover */
.scroll-icon {
  transition: transform 0.2s ease;
}

.scroll-top-btn:hover .scroll-icon {
  transform: scale(1.1);
}

/* Button fade & slide */
.scroll-fade-enter-active,
.scroll-fade-leave-active {
  transition: all 0.25s ease;
}

.scroll-fade-enter-from,
.scroll-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Text slide animation */
.text-slide-enter-active,
.text-slide-leave-active {
  transition: all 0.22s ease;
}

.text-slide-enter-from,
.text-slide-leave-to {
  opacity: 0;
  transform: translateX(-6px);
}

.scroll-text {
  white-space: nowrap;
  font-weight: 600;
  color: #9e9e9e;
}
</style>
