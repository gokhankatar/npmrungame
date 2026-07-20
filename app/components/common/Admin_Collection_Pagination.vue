<template>
  <div
    v-if="pageCount > 1"
    class="admin-collection-pagination d-flex flex-column flex-sm-row align-center justify-space-between ga-3 mt-4"
  >
    <p class="admin-collection-pagination__meta text-caption text-grey-lighten-1 default-title-letter mb-0">
      Sayfa {{ modelValue }} / {{ pageCount }}
      <span class="text-grey">· sayfa başı {{ pageSize }} oyun</span>
    </p>
    <v-pagination
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
defineProps<{
  modelValue: number;
  pageCount: number;
  pageSize: number;
}>();

defineEmits<{
  "update:modelValue": [value: number];
}>();

const display = useDisplay();
</script>

<style scoped>
.admin-collection-pagination {
  width: 100%;
  padding: 0.75rem 0.25rem 0.25rem;
}

.admin-collection-pagination__meta {
  letter-spacing: 0.02em;
}
</style>
