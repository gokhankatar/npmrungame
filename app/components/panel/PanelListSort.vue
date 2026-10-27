<script setup lang="ts">
export type PanelSortMode = "added" | "release-new" | "release-old" | "meta";

const props = withDefaults(
  defineProps<{
    modelValue?: PanelSortMode;
    showMeta?: boolean;
  }>(),
  {
    modelValue: "added",
    showMeta: true,
  }
);

const emit = defineEmits<{
  "update:modelValue": [PanelSortMode];
}>();

const options: { value: PanelSortMode; title: string; icon: string }[] = [
  {
    value: "added",
    title: "En son eklenen",
    icon: "mdi-clock-outline",
  },
  {
    value: "release-new",
    title: "Çıkış (yeni → eski)",
    icon: "mdi-calendar",
  },
  {
    value: "release-old",
    title: "Çıkış (eski → yeni)",
    icon: "mdi-calendar-arrow-left",
  },
  {
    value: "meta",
    title: "Metacritic (yüksek)",
    icon: "mdi-star-outline",
  },
];

const visibleOptions = computed(() =>
  options.filter((o) => props.showMeta || o.value !== "meta")
);

const current = computed(
  () =>
    visibleOptions.value.find((o) => o.value === props.modelValue) ??
    visibleOptions.value[0]
);

function pick(mode: PanelSortMode) {
  emit("update:modelValue", mode);
}
</script>

<template>
  <v-menu location="bottom end">
    <template #activator="{ props: menuProps }">
      <button
        v-bind="menuProps"
        type="button"
        class="panel-sort"
        :title="current.title"
      >
        <v-icon :icon="current.icon" size="18" />
        <span>{{ current.title }}</span>
        <v-icon icon="mdi-chevron-down" size="18" />
      </button>
    </template>

    <v-list density="compact" class="panel-sort__menu" bg-color="#121820">
      <v-list-item
        v-for="opt in visibleOptions"
        :key="opt.value"
        :prepend-icon="opt.icon"
        :title="opt.title"
        :active="opt.value === modelValue"
        color="success"
        @click="pick(opt.value)"
      />
    </v-list>
  </v-menu>
</template>

<style scoped>
.panel-sort {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.35rem;
  padding: 0.4rem 0.8rem;
  border-radius: 0.75rem;
  border: 1px solid var(--panel-border, rgb(255 255 255 / 0.12));
  background: var(--panel-card, #0c1220);
  color: var(--panel-text, #e8eef7);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 650;
  cursor: pointer;
  white-space: nowrap;
}

.panel-sort:hover {
  border-color: rgb(105 240 174 / 0.35);
  color: var(--panel-accent, #69f0ae);
}

.panel-sort__menu {
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 0.75rem !important;
  min-width: 12.5rem;
}
</style>
