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
          <div class="sgs__foot">
            <i class="sgs__line sgs__line--title" />
            <i class="sgs__line sgs__line--bar" />
          </div>
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
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.95rem;
}
@media (max-width: 1100px) {
  .sgs {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (max-width: 720px) {
  .sgs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }
}
.sgs__card {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #0a0e14;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.28);
}
.sgs__media {
  position: relative;
  aspect-ratio: 2 / 3;
  background: linear-gradient(145deg, #1a222c 0%, #0e1319 100%);
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
.sgs__foot {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.65rem 0.7rem 0.75rem;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.75));
}
.sgs__line {
  display: block;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  height: 0.72rem;
}
.sgs__line--title {
  width: 78%;
  height: 0.75rem;
}
.sgs__line--bar {
  width: 100%;
  height: 0.28rem;
  opacity: 0.7;
}

@keyframes sgs-shine {
  0% {
    background-position: 120% 0;
  }
  100% {
    background-position: -80% 0;
  }
}
</style>
