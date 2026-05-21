<template>
  <v-sheet
    v-if="active"
    class="admin-bulk-delete-bar rounded-lg pa-2 pa-sm-3 mb-3"
    color="rgba(255, 255, 255, 0.06)"
    border
  >
    <div class="d-flex flex-wrap align-center justify-space-between ga-2">
      <p
        class="text-caption text-sm-subtitle-2 text-grey-lighten-1 default-title-letter mb-0"
      >
        {{ selectedCount }} / {{ totalCount }} oyun seçildi
      </p>

      <div class="d-flex flex-wrap align-center ga-1 ga-sm-2">
        <v-btn
          size="small"
          variant="tonal"
          color="grey-lighten-1"
          :ripple="false"
          text="Tümünü seç"
          @click="$emit('select-all')"
        />
        <v-btn
          size="small"
          variant="text"
          color="grey-lighten-1"
          :ripple="false"
          text="Temizle"
          @click="$emit('clear')"
        />
        <v-btn
          size="small"
          color="error"
          variant="elevated"
          :ripple="false"
          prepend-icon="mdi-delete"
          :disabled="selectedCount === 0"
          :text="`Seçilenleri sil (${selectedCount})`"
          @click="$emit('delete')"
        />
        <v-btn
          size="small"
          variant="text"
          color="grey-lighten-2"
          :ripple="false"
          prepend-icon="mdi-close"
          text="Vazgeç"
          @click="$emit('cancel')"
        />
      </div>
    </div>
  </v-sheet>
</template>

<script lang="ts" setup>
defineProps<{
  active: boolean;
  selectedCount: number;
  totalCount: number;
}>();

defineEmits<{
  "select-all": [];
  clear: [];
  delete: [];
  cancel: [];
}>();
</script>

<style scoped>
.admin-bulk-delete-bar {
  border-color: rgba(244, 67, 54, 0.35) !important;
}
</style>
