<script setup lang="ts">
export type Crumb = {
  label: string;
  to?: string;
};

defineProps<{
  items: Crumb[];
}>();
</script>

<template>
  <nav class="pbc" aria-label="Breadcrumb">
    <ol class="pbc__list">
      <li v-for="(item, i) in items" :key="`${item.label}-${i}`" class="pbc__item">
        <NuxtLink v-if="item.to" :to="item.to" class="pbc__link">
          {{ item.label }}
        </NuxtLink>
        <span v-else class="pbc__current" aria-current="page">{{ item.label }}</span>
        <span v-if="i < items.length - 1" class="pbc__sep" aria-hidden="true">&gt;</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.pbc {
  margin: 0 0 0.45rem;
}
.pbc__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.pbc__item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.88rem;
  font-weight: 700;
}
.pbc__link {
  color: var(--panel-accent, #69f0ae);
  text-decoration: none;
}
.pbc__link:hover {
  text-decoration: underline;
  filter: brightness(1.08);
}
.pbc__current {
  color: var(--panel-text, #e8eef7);
  font-weight: 800;
}
.pbc__sep {
  color: var(--panel-muted, #94a3b8);
  font-weight: 800;
  font-size: 0.95rem;
  line-height: 1;
  user-select: none;
}

:global(.panel-shell[data-theme="light"]) .pbc__link {
  color: #047857;
}
:global(.panel-shell[data-theme="light"]) .pbc__current {
  color: #0f172a;
}
:global(.panel-shell[data-theme="light"]) .pbc__sep {
  color: #64748b;
}
</style>
