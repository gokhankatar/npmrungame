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
          <span class="admin-bulk-bar-label">{{ entityLabel }} seçildi</span>
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
withDefaults(
  defineProps<{
    active: boolean;
    selectedCount: number;
    totalCount: number;
    entityLabel?: string;
  }>(),
  { entityLabel: "oyun" }
);

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

<!-- Panel sayfalarında admin.css yok; çubuk stilleri burada da tanımlı -->
<style>
.admin-bulk-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  margin-bottom: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(105, 240, 174, 0.28);
  background: linear-gradient(
    135deg,
    rgba(105, 240, 174, 0.08) 0%,
    rgba(0, 0, 0, 0.4) 55%,
    rgba(0, 0, 0, 0.45) 100%
  );
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
}

.admin-bulk-bar-info {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}

.admin-bulk-bar-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: #69f0ae;
  background: rgba(105, 240, 174, 0.12);
  border: 1px solid rgba(105, 240, 174, 0.25);
  flex-shrink: 0;
}

.admin-bulk-bar-text {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.35;
}

.admin-bulk-bar-text strong {
  color: #69f0ae;
  font-weight: 700;
}

.admin-bulk-bar-sep {
  margin: 0 0.15rem;
  color: rgba(255, 255, 255, 0.35);
}

.admin-bulk-bar-label {
  margin-left: 0.25rem;
  color: rgba(255, 255, 255, 0.5);
}

.admin-bulk-bar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.admin-bulk-bar-btn {
  letter-spacing: 0.02em !important;
}

@media (max-width: 599px) {
  .admin-bulk-bar-actions {
    width: 100%;
    margin-left: 0;
  }

  .admin-bulk-bar-actions .admin-bulk-bar-btn {
    flex: 1 1 calc(50% - 0.2rem);
    min-width: 0;
  }
}
</style>
