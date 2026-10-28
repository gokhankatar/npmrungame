<template>
  <transition name="scroll-fade">
    <button
      v-if="showScrollBtn"
      type="button"
      class="scroll-top-btn"
      aria-label="Yukarı çık"
      @click="scrollToTop"
      @mouseover="hover = true"
      @mouseleave="hover = false"
    >
      <svg
        class="scroll-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M8 11h3v10h2V11h3l-4-4-4 4zM4 3v2h16V3H4z" />
      </svg>

      <transition name="text-slide">
        <span v-if="hover" class="scroll-top-btn__label default-title-letter">
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
.scroll-top-btn {
  position: fixed;
  z-index: 999;
  right: 1.25rem;
  bottom: 7.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 2.85rem;
  min-width: 2.85rem;
  padding: 0 0.85rem;
  border-radius: 999px;
  cursor: pointer;
  /* Dark / default: soft mint pill */
  color: #07140f;
  background: #69f0ae;
  border: 1px solid rgb(105 240 174 / 0.95);
  box-shadow:
    0 10px 28px rgb(105 240 174 / 0.28),
    0 4px 14px rgb(0 0 0 / 0.35);
  backdrop-filter: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease,
    color 0.2s ease;
}
.scroll-top-btn:hover {
  transform: translateY(-2px);
  background: #8ff7c2;
  box-shadow:
    0 14px 32px rgb(105 240 174 / 0.38),
    0 6px 16px rgb(0 0 0 / 0.3);
}
.scroll-top-btn:hover .scroll-icon {
  transform: translateY(-2px) scale(1.08);
}

/* Light panel: koyu yeşil — gri zeminde net okunur */
:global(.panel-shell[data-theme="light"]) .scroll-top-btn {
  color: #ffffff;
  background: #047857;
  border-color: #065f46;
  box-shadow:
    0 12px 28px rgb(4 120 87 / 0.38),
    0 3px 10px rgb(15 23 42 / 0.18);
}
:global(.panel-shell[data-theme="light"]) .scroll-top-btn:hover {
  background: #059669;
  border-color: #047857;
  box-shadow:
    0 16px 34px rgb(4 120 87 / 0.45),
    0 4px 12px rgb(15 23 42 / 0.2);
}

.scroll-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}
.scroll-top-btn__label {
  white-space: nowrap;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  opacity: 0.95;
}

@media (max-width: 600px) {
  .scroll-top-btn {
    right: 1rem;
    bottom: 6.5rem;
  }
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
