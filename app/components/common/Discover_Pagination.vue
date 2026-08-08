<template>
  <nav
    v-if="totalPages > 1"
    class="discover-pager"
    aria-label="Sayfalama"
  >
    <button
      type="button"
      class="discover-pager__nav"
      :disabled="!canPrev || loading"
      aria-label="Önceki sayfa"
      @click="emit('prev')"
    >
      <v-icon icon="mdi-chevron-left" size="20" />
      <span class="discover-pager__nav-label">Geri</span>
    </button>

    <div class="discover-pager__pages" role="list">
      <template v-for="(item, index) in pageItems" :key="`${item}-${index}`">
        <span v-if="item === 'ellipsis'" class="discover-pager__ellipsis" aria-hidden="true">
          …
        </span>
        <button
          v-else
          type="button"
          class="discover-pager__page"
          :class="{ 'discover-pager__page--active': item === currentPage }"
          :disabled="loading"
          :aria-current="item === currentPage ? 'page' : undefined"
          :aria-label="`Sayfa ${item}`"
          role="listitem"
          @click="emit('go', item)"
        >
          {{ item }}
        </button>
      </template>
    </div>

    <button
      type="button"
      class="discover-pager__nav"
      :disabled="!canNext || loading"
      aria-label="Sonraki sayfa"
      @click="emit('next')"
    >
      <span class="discover-pager__nav-label">İleri</span>
      <v-icon icon="mdi-chevron-right" size="20" />
    </button>

    <p class="discover-pager__meta default-title-letter mb-0">
      <v-progress-circular
        v-if="loading"
        color="green-accent-2"
        size="14"
        width="2"
        indeterminate
        class="mr-2"
      />
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <span v-if="totalCount != null" class="discover-pager__count">
        · {{ formatCount(totalCount) }} oyun
      </span>
    </p>
  </nav>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    currentPage: number;
    totalPages: number;
    totalCount?: number | null;
    canPrev?: boolean;
    canNext?: boolean;
    loading?: boolean;
  }>(),
  {
    totalCount: null,
    canPrev: false,
    canNext: false,
    loading: false,
  }
);

const emit = defineEmits<{
  prev: [];
  next: [];
  go: [page: number];
}>();

const formatCount = (n: number) => n.toLocaleString("tr-TR");

/** current etrafında pencere + uçlar; örn. 1 … 4 5 [6] 7 8 … 120 */
const pageItems = computed(() => {
  const total = Math.max(1, props.totalPages);
  const current = Math.min(Math.max(1, props.currentPage), total);
  const windowSize = 1;

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  for (let p = current - windowSize; p <= current + windowSize; p++) {
    if (p >= 1 && p <= total) pages.add(p);
  }
  // Komşu boşluğu doldurmak için biraz daha geniş tut
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) items.push("ellipsis");
    items.push(p);
    prev = p;
  }
  return items;
});
</script>

<style scoped>
.discover-pager {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.65rem 0.85rem;
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 16px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.04) 0%,
    rgba(255, 255, 255, 0.02) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.25);
}

.discover-pager__nav {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  min-height: 2.25rem;
  padding: 0 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.28);
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.discover-pager__nav:hover:not(:disabled) {
  border-color: rgba(105, 240, 174, 0.45);
  background: rgba(105, 240, 174, 0.1);
  color: #fff;
  transform: translateY(-1px);
}

.discover-pager__nav:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.discover-pager__pages {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
  justify-content: center;
}

.discover-pager__page {
  min-width: 2.25rem;
  height: 2.25rem;
  padding: 0 0.45rem;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.discover-pager__page:hover:not(:disabled):not(.discover-pager__page--active) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.discover-pager__page--active {
  background: rgba(105, 240, 174, 0.18);
  border-color: rgba(105, 240, 174, 0.55);
  color: #69f0ae;
  box-shadow: 0 0 0 1px rgba(105, 240, 174, 0.15), 0 6px 16px rgba(105, 240, 174, 0.12);
  cursor: default;
}

.discover-pager__ellipsis {
  min-width: 1.25rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.35);
  font-weight: 600;
  user-select: none;
}

.discover-pager__meta {
  flex-basis: 100%;
  text-align: center;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.42);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.discover-pager__count {
  margin-left: 0.25rem;
  color: rgba(255, 255, 255, 0.32);
}

@media (max-width: 599px) {
  .discover-pager {
    padding: 0.75rem 0.65rem;
    gap: 0.5rem;
  }

  .discover-pager__nav-label {
    display: none;
  }

  .discover-pager__nav {
    min-width: 2.25rem;
    justify-content: center;
    padding: 0 0.55rem;
  }

  .discover-pager__page {
    min-width: 2rem;
    height: 2rem;
    font-size: 0.8rem;
  }
}

@media (min-width: 960px) {
  .discover-pager__meta {
    flex-basis: auto;
    margin-left: 0.35rem;
  }
}
</style>
