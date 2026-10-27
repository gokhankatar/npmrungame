<template>
  <div v-if="totalCount > 0" class="panel-pager">
    <div class="panel-pager__bar">
      <div class="panel-pager__meta">
        <span class="panel-pager__range">{{ rangeLabel }}</span>
        <span class="panel-pager__dot" aria-hidden="true" />
        <span class="panel-pager__total">{{ totalCount }} oyun</span>
      </div>

      <div class="panel-pager__size" role="group" aria-label="Sayfa başı oyun sayısı">
        <span class="panel-pager__size-label">Sayfa başı</span>
        <div class="panel-pager__chips">
          <button
            v-for="size in pageSizeOptions"
            :key="size"
            type="button"
            class="panel-pager__chip"
            :class="{ 'panel-pager__chip--on': pageSize === size }"
            :aria-pressed="pageSize === size"
            @click="$emit('update:pageSize', size)"
          >
            {{ size }}
          </button>
        </div>
      </div>
    </div>

    <v-pagination
      v-if="pageCount > 1"
      :model-value="modelValue"
      :length="pageCount"
      :total-visible="display.smAndDown.value ? 5 : 7"
      density="comfortable"
      active-color="success"
      rounded="circle"
      class="panel-pager__nav"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import { PANEL_PAGE_SIZE_OPTIONS } from "~/composables/usePanelListPagination";

const props = withDefaults(
  defineProps<{
    modelValue: number;
    pageCount: number;
    pageSize: number;
    totalCount: number;
    pageSizeOptions?: readonly number[];
  }>(),
  {
    pageSizeOptions: () => PANEL_PAGE_SIZE_OPTIONS,
  }
);

defineEmits<{
  "update:modelValue": [value: number];
  "update:pageSize": [value: number];
}>();

const display = useDisplay();

const rangeLabel = computed(() => {
  if (props.totalCount === 0) return "0";
  const start = (props.modelValue - 1) * props.pageSize + 1;
  const end = Math.min(props.modelValue * props.pageSize, props.totalCount);
  return `${start}–${end}`;
});
</script>

<style scoped>
.panel-pager {
  width: 100%;
  margin-top: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.panel-pager__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem 1.25rem;
  padding: 0.7rem 0.9rem;
  border-radius: 1rem;
  border: 1px solid var(--panel-card-border, rgb(255 255 255 / 0.1));
  background: var(--panel-card, #0c1220);
  box-shadow: var(--panel-card-shadow, 0 6px 18px rgb(0 0 0 / 0.18));
}

.panel-pager__meta {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--panel-muted, #94a3b8);
}

.panel-pager__range {
  color: var(--panel-text, #e8eef7);
  font-weight: 800;
}

.panel-pager__dot {
  width: 0.28rem;
  height: 0.28rem;
  border-radius: 999px;
  background: var(--panel-accent, #69f0ae);
  opacity: 0.7;
}

.panel-pager__size {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.panel-pager__size-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--panel-muted, #94a3b8);
}

.panel-pager__chips {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  padding: 0.22rem;
  border-radius: 999px;
  background: var(--panel-soft, rgb(0 0 0 / 0.28));
  border: 1px solid var(--panel-border, rgb(255 255 255 / 0.08));
}

.panel-pager__chip {
  min-width: 2.35rem;
  height: 1.85rem;
  padding: 0 0.65rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--panel-muted, #94a3b8);
  font: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}

.panel-pager__chip:hover {
  color: var(--panel-text, #e8eef7);
  background: rgb(255 255 255 / 0.06);
}

.panel-pager__chip--on {
  background: var(--panel-accent, #69f0ae);
  color: var(--panel-accent-ink, #07140f);
  box-shadow: 0 4px 12px rgb(105 240 174 / 0.28);
}

.panel-pager__chip--on:hover {
  background: var(--panel-accent, #69f0ae);
  color: var(--panel-accent-ink, #07140f);
  filter: brightness(1.05);
}

.panel-pager__nav {
  align-self: center;
}

@media (max-width: 600px) {
  .panel-pager__bar {
    flex-direction: column;
    align-items: stretch;
  }

  .panel-pager__size {
    justify-content: space-between;
  }

  .panel-pager__chips {
    margin-left: auto;
  }
}
</style>
