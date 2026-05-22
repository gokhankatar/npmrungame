<template>
  <transition name="admin-bulk-bar-transition">
    <div v-if="active" class="admin-bulk-bar">
      <div class="admin-bulk-bar-info">
        <span class="admin-bulk-bar-icon-wrap">
          <v-icon icon="mdi-checkbox-multiple-marked-outline" size="18" />
        </span>
        <p class="admin-bulk-bar-text default-title-letter mb-0">
          <strong>{{ selectedCount }}</strong>
          <span class="admin-bulk-bar-sep">/</span>
          {{ totalCount }}
          <span class="admin-bulk-bar-label">oyun seçildi</span>
        </p>
      </div>

      <div class="admin-bulk-bar-actions d-flex ga-2">
        <v-btn
          class="admin-bulk-bar-btn text-capitalize"
          size="small"
          variant="tonal"
          color="#69f0ae"
          :ripple="false"
          prepend-icon="mdi-select-all"
          text="Tümünü seç"
          @click="$emit('select-all')"
        />
        <v-btn
          class="admin-bulk-bar-btn text-capitalize"
          size="small"
          variant="text"
          color="grey-lighten-1"
          :ripple="false"
          prepend-icon="mdi-backspace-outline"
          text="Temizle"
          @click="$emit('clear')"
        />
        <v-btn
          class="admin-bulk-bar-btn text-capitalize"
          size="small"
          color="error"
          variant="flat"
          :ripple="false"
          prepend-icon="mdi-delete-outline"
          :disabled="selectedCount === 0"
          :text="selectedCount > 0 ? `Seçilenleri sil (${selectedCount})` : 'Seçilenleri sil'"
          @click="$emit('delete')"
        />
        <v-btn
          class="admin-bulk-bar-btn text-capitalize"
          size="small"
          variant="outlined"
          color="grey-lighten-1"
          :ripple="false"
          prepend-icon="mdi-close-circle-outline"
          text="Vazgeç"
          @click="$emit('cancel')"
        />
      </div>
    </div>
  </transition>
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
.admin-bulk-bar-transition-enter-active,
.admin-bulk-bar-transition-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.admin-bulk-bar-transition-enter-from,
.admin-bulk-bar-transition-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
