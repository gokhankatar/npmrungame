<template>
  <div
    v-if="totalCount > 0"
    class="admin-collection-pagination d-flex flex-column flex-sm-row align-center justify-space-between ga-3 mt-4"
  >
    <div class="admin-collection-pagination__left d-flex flex-wrap align-center ga-3">
      <p class="admin-collection-pagination__meta text-caption text-grey-lighten-1 default-title-letter mb-0">
        {{ rangeLabel }}
        <span class="text-grey">· {{ totalCount }} oyun</span>
      </p>

      <div class="admin-collection-pagination__size d-flex align-center ga-2">
        <span class="text-caption text-grey">Sayfa başı</span>
        <v-select
          :model-value="pageSize"
          :items="[...pageSizeOptions]"
          density="compact"
          variant="outlined"
          hide-details
          rounded="lg"
          class="admin-collection-pagination__select"
          @update:model-value="$emit('update:pageSize', Number($event))"
        />
      </div>
    </div>

    <v-pagination
      v-if="pageCount > 1"
      :model-value="modelValue"
      :length="pageCount"
      :total-visible="display.smAndDown.value ? 5 : 7"
      density="comfortable"
      active-color="primary"
      rounded="circle"
      class="admin-collection-pagination__nav"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import { ADMIN_PAGE_SIZE_OPTIONS } from "~/composables/admin/useAdminCollectionPagination";

const props = withDefaults(
  defineProps<{
    modelValue: number;
    pageCount: number;
    pageSize: number;
    totalCount?: number;
    pageSizeOptions?: readonly number[];
  }>(),
  {
    totalCount: 0,
    pageSizeOptions: () => ADMIN_PAGE_SIZE_OPTIONS,
  }
);

defineEmits<{
  "update:modelValue": [value: number];
  "update:pageSize": [value: number];
}>();

const display = useDisplay();

const rangeLabel = computed(() => {
  const total = props.totalCount || 0;
  if (total === 0) return `Sayfa ${props.modelValue} / ${props.pageCount}`;
  const start = (props.modelValue - 1) * props.pageSize + 1;
  const end = Math.min(props.modelValue * props.pageSize, total);
  return `${start}–${end}`;
});
</script>

<style scoped>
.admin-collection-pagination {
  width: 100%;
  padding: 0.75rem 0.25rem 0.25rem;
}

.admin-collection-pagination__meta {
  letter-spacing: 0.02em;
}

.admin-collection-pagination__select {
  width: 5.5rem;
  flex: 0 0 auto;
}

.admin-collection-pagination__select :deep(.v-field) {
  font-size: 0.85rem;
}
</style>
