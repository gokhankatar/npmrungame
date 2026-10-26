<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src?: string | null;
    name?: string;
    size?: number;
  }>(),
  {
    src: "",
    name: "",
    size: 36,
  }
);

const boxStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}));
</script>

<template>
  <span class="panel-avatar" :style="boxStyle" :title="name || undefined">
    <img
      v-if="src"
      :src="src"
      :alt="name || 'Profil'"
      class="panel-avatar__img"
    />
    <span v-else class="panel-avatar__empty" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" stroke-width="1.6" />
        <path
          d="M5.5 19.2c.9-3.1 3.4-4.7 6.5-4.7s5.6 1.6 6.5 4.7"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </svg>
    </span>
  </span>
</template>

<style scoped>
.panel-avatar {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 9999px;
  border: 1px solid rgb(255 255 255 / 0.14);
  background: rgb(255 255 255 / 0.06);
}

:global(html:not(.dark)) .panel-avatar {
  border-color: rgb(15 23 42 / 0.12);
  background: rgb(15 23 42 / 0.05);
}

.panel-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.panel-avatar__empty {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  background: linear-gradient(160deg, rgb(105 240 174 / 0.12), transparent 70%);
}

.panel-avatar__empty svg {
  width: 58%;
  height: 58%;
}

:global(html:not(.dark)) .panel-avatar__empty {
  color: #64748b;
}
</style>
