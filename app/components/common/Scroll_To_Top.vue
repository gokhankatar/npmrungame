<template>
  <transition name="scroll-fade">
    <v-btn
      v-if="showScrollBtn"
      :ripple="false"
      class="scroll-top-btn d-flex align-center"
      variant="flat"
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
    showScrollBtn.value = window.scrollY > 450;
  });
});
</script>

<style scoped>
.scroll-top-btn {
  position: fixed;
  bottom: 7.5rem;
  right: 1.25rem;
  z-index: 999;
  min-width: 2.75rem !important;
  min-height: 2.75rem !important;
  padding-left: 12px !important;
  padding-right: 14px !important;
  text-transform: none;
  color: rgba(255, 255, 255, 0.92) !important;
  background: rgba(18, 22, 32, 0.72) !important;
  border: 1px solid rgba(255, 255, 255, 0.14) !important;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.scroll-top-btn:hover {
  background: rgba(24, 30, 44, 0.88) !important;
  border-color: rgba(105, 240, 174, 0.45) !important;
  box-shadow:
    0 10px 28px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(105, 240, 174, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.scroll-icon {
  transition: transform 0.2s ease;
  color: rgba(255, 255, 255, 0.9);
}

.scroll-top-btn:hover .scroll-icon {
  transform: translateY(-2px) scale(1.08);
  color: #69f0ae;
}

.scroll-fade-enter-active,
.scroll-fade-leave-active {
  transition: all 0.25s ease;
}

.scroll-fade-enter-from,
.scroll-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

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
  color: rgba(255, 255, 255, 0.82);
}

@media (max-width: 600px) {
  .scroll-top-btn {
    bottom: 6.5rem;
    right: 1rem;
  }
}
</style>
