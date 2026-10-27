<script setup lang="ts">
withDefaults(
  defineProps<{
    count?: number;
  }>(),
  { count: 8 }
);
</script>

<template>
  <ul class="sgs" aria-busy="true" aria-label="Loading">
    <li v-for="i in count" :key="i" class="sgs__item">
      <div class="sgs__card">
        <div class="sgs__media">
          <span class="sgs__shine" />
          <span class="sgs__pill sgs__pill--l" />
          <span class="sgs__pill sgs__pill--r" />
        </div>
        <div class="sgs__body">
          <i class="sgs__line sgs__line--title" />
          <i class="sgs__line sgs__line--bar" />
          <i class="sgs__line sgs__line--meta" />
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.sgs {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.05rem;
}
.sgs__card {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(105, 240, 174, 0.12);
  background: linear-gradient(180deg, #0f1c17, #0a1210);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
}
.sgs__media {
  position: relative;
  aspect-ratio: 460 / 215;
  background: linear-gradient(145deg, #15241e 0%, #0d1612 100%);
  overflow: hidden;
}
.sgs__shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 22%,
    rgba(105, 240, 174, 0.08) 45%,
    transparent 68%
  );
  background-size: 220% 100%;
  animation: sgs-shine 1.4s ease-in-out infinite;
}
.sgs__pill {
  position: absolute;
  top: 0.55rem;
  z-index: 1;
  height: 1.35rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}
.sgs__pill--l {
  left: 0.55rem;
  width: 4.5rem;
}
.sgs__pill--r {
  right: 0.55rem;
  width: 2.6rem;
}
.sgs__body {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0.75rem 0.85rem 0.9rem;
}
.sgs__line {
  display: block;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  height: 0.72rem;
}
.sgs__line--title {
  width: 78%;
  height: 0.85rem;
}
.sgs__line--bar {
  width: 100%;
  height: 0.28rem;
  opacity: 0.7;
}
.sgs__line--meta {
  width: 42%;
  height: 0.55rem;
  opacity: 0.65;
}

@keyframes sgs-shine {
  0% {
    background-position: 120% 0;
  }
  100% {
    background-position: -80% 0;
  }
}

:global(.panel-shell[data-theme="light"]) .sgs__card {
  background: var(--panel-card, #ced5e0);
  border-color: var(--panel-card-border, rgb(15 23 42 / 0.16));
  box-shadow: var(--panel-card-shadow, 0 1px 2px rgb(15 23 42 / 0.06));
}
:global(.panel-shell[data-theme="light"]) .sgs__media {
  background: linear-gradient(145deg, #b4bcc9 0%, #a8b1c0 100%);
}
:global(.panel-shell[data-theme="light"]) .sgs__shine {
  background: linear-gradient(
    110deg,
    transparent 22%,
    rgb(255 255 255 / 0.2) 45%,
    transparent 68%
  );
  background-size: 220% 100%;
}
:global(.panel-shell[data-theme="light"]) .sgs__pill,
:global(.panel-shell[data-theme="light"]) .sgs__line {
  background: rgb(15 23 42 / 0.12);
}
</style>
