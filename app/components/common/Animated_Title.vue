<template>
  <div id="animation" class="large grid centered square-grid">
    <p
      ref="titleRef"
      class="text-grey-lighten-1 text-h5 text-md-h4 text-xl-h3 default-title-letter"
    >
      Oyun Öner
    </p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { animate, stagger, splitText } from "animejs";

const titleRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!titleRef.value) return;

  const { chars } = splitText(titleRef.value, { words: false, chars: true });

  animate(chars, {
    y: [
      { to: "-2.75rem", ease: "outExpo", duration: 600 },
      { to: 0, ease: "outBounce", duration: 800, delay: 100 },
    ],
    rotate: {
      from: "-1turn",
      delay: 0,
    },
    delay: stagger(50),
    ease: "inOutCirc",
    loopDelay: 1000,
    loop: true,
  });
});
</script>

<style>
@import "~/assets/css/main.css";
</style>
