<template>
  <transition name="scroll-fade">
    <button
      v-if="showScrollBtn"
      type="button"
      class="scroll-top-btn fixed z-[999] bottom-[7.5rem] right-5 max-[600px]:bottom-[6.5rem] max-[600px]:right-4 inline-flex items-center gap-2 min-h-11 min-w-11 px-3 rounded-full border border-border bg-surface-glass text-white/90 shadow-panel backdrop-blur-[14px] transition-[background,border-color,box-shadow,transform] duration-200 hover:bg-[rgb(24_30_44/0.88)] hover:border-primary-muted hover:shadow-panel-hover cursor-pointer"
      aria-label="Yukarı çık"
      @click="scrollToTop"
      @mouseover="hover = true"
      @mouseleave="hover = false"
    >
      <svg
        class="scroll-icon size-5 shrink-0 transition-transform duration-200"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M8 11h3v10h2V11h3l-4-4-4 4zM4 3v2h16V3H4z"
        />
      </svg>

      <transition name="text-slide">
        <span
          v-if="hover"
          class="default-title-letter whitespace-nowrap text-xs font-semibold tracking-wide text-white/80 lg:text-sm"
        >
          Yukarı Çık
        </span>
      </transition>
    </button>
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
.scroll-top-btn:hover .scroll-icon {
  transform: translateY(-2px) scale(1.08);
  color: var(--color-primary);
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
</style>
