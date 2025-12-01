<template>
  <p
    :key="repaintKey"
    :class="[
      'animated-text text-caption text-lg-subtitle-2 text-xl-subtitle-1 default-title-letter text-blue-grey-lighten-1',
      { 'with-cursor': showCursor },
    ]"
    aria-live="polite"
    role="status"
  >
    <span
      v-for="(ch, i) in chars"
      :key="i"
      class="animated-char"
      :style="getStyle(i)"
      v-html="ch === ' ' ? '&nbsp;' : escapeHtml(ch)"
    />
  </p>
</template>

<script setup lang="ts">
const props = defineProps({
  text: { type: String, required: true },
  msPerChar: { type: Number, default: 60 },
  duration: { type: Number, default: 600 },
  staggerEase: { type: String, default: "cubic-bezier(.2,.9,.3,1)" },
  loop: { type: Boolean, default: false },
  loopPause: { type: Number, default: 900 },
  showCursor: { type: Boolean, default: true },
});

const repaintKey = ref(0);

const chars = computed(() => Array.from(props.text));

const getStyle = (i: number) => {
  const delay = `${i * props.msPerChar}ms`;
  return {
    animationDelay: delay,
    animationDuration: `${props.duration}ms`,
    animationTimingFunction: props.staggerEase,
  } as Record<string, string>;
};

const escapeHtml = (ch: string) => {
  return ch.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

onMounted(() => {
  if (!props.loop) return;

  const total = props.text.length * props.msPerChar + props.duration + props.loopPause;

  const tick = () => {
    repaintKey.value++;
    setTimeout(tick, total);
  };
  setTimeout(tick, total);
});
</script>

<style scoped>
.animated-text {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.15rem;
  line-height: 1;
}

.animated-char {
  display: inline-block;
  transform: translateY(10px);
  opacity: 0;
  will-change: transform, opacity;
  animation-name: floatIn;
  animation-fill-mode: forwards;
  animation-timing-function: cubic-bezier(0.2, 0.9, 0.3, 1);
}

.animated-char {
  backface-visibility: hidden;
}

.with-cursor::after {
  content: "";
  display: inline-block;
  width: 1px;
  height: 1.2em;
  margin-left: 0.35rem;
  background: currentColor;
  vertical-align: middle;
  animation: blink 1s steps(2, start) infinite;
  opacity: 0.9;
}

@keyframes floatIn {
  0% {
    transform: translateY(10px) scale(0.98);
    opacity: 0;
    filter: blur(3px);
  }
  60% {
    transform: translateY(-4px) scale(1.02);
    opacity: 1;
    filter: blur(0);
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}
</style>
