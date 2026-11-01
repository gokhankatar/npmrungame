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

      <div class="admin-bulk-bar-actions">
        <v-btn
          class="admin-bulk-bar-btn text-capitalize"
          size="small"
          variant="tonal"
          color="#69f0ae"
          :ripple="false"
          :prepend-icon="allSelected ? 'mdi-select-off' : 'mdi-select-all'"
          :text="allSelected ? 'Seçimi kaldır' : 'Tümünü seç'"
          @click="$emit('select-all')"
        />

        <v-tooltip text="Temizle" location="top">
          <template #activator="{ props: tip }">
            <button
              v-bind="tip"
              type="button"
              class="admin-bulk-icon-btn admin-bulk-icon-btn--clear"
              aria-label="Temizle"
              @click="$emit('clear')"
            >
              <v-icon icon="mdi-selection-off" size="16" />
            </button>
          </template>
        </v-tooltip>

        <v-tooltip
          :text="
            selectedCount > 0
              ? `Seçilenleri sil (${selectedCount})`
              : 'Seçilenleri sil'
          "
          location="top"
        >
          <template #activator="{ props: tip }">
            <button
              v-bind="tip"
              type="button"
              class="admin-bulk-icon-btn admin-bulk-icon-btn--delete"
              aria-label="Seçilenleri sil"
              :disabled="selectedCount === 0"
              @click="$emit('delete')"
            >
              <v-icon icon="mdi-trash-can-outline" size="16" />
            </button>
          </template>
        </v-tooltip>

        <v-tooltip text="Vazgeç" location="top">
          <template #activator="{ props: tip }">
            <button
              v-bind="tip"
              type="button"
              class="admin-bulk-icon-btn admin-bulk-icon-btn--cancel"
              aria-label="Vazgeç"
              @click="$emit('cancel')"
            >
              <v-icon icon="mdi-close" size="16" />
            </button>
          </template>
        </v-tooltip>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    active: boolean;
    selectedCount: number;
    totalCount: number;
    entityLabel?: string;
  }>(),
  { entityLabel: "oyun" }
);

const allSelected = computed(
  () => props.totalCount > 0 && props.selectedCount === props.totalCount
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
  gap: 0.45rem;
  margin-left: auto;
}

.admin-bulk-bar-btn {
  letter-spacing: 0.02em !important;
}

.admin-bulk-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease;
}

.admin-bulk-icon-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.admin-bulk-icon-btn--clear {
  color: rgba(255, 255, 255, 0.55);
  border-color: rgba(255, 255, 255, 0.22);
}

.admin-bulk-icon-btn--clear:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.06);
}

.admin-bulk-icon-btn--delete {
  color: #ef9a9a;
  border-color: rgba(239, 83, 80, 0.55);
}

.admin-bulk-icon-btn--delete:hover:not(:disabled) {
  color: #ffcdd2;
  border-color: #ef5350;
  background: rgba(239, 83, 80, 0.14);
}

.admin-bulk-icon-btn--cancel {
  color: rgba(255, 255, 255, 0.5);
  border-color: rgba(255, 255, 255, 0.18);
}

.admin-bulk-icon-btn--cancel:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.05);
}

@media (max-width: 599px) {
  .admin-bulk-bar-actions {
    width: 100%;
    margin-left: 0;
  }

  .admin-bulk-bar-actions .admin-bulk-bar-btn {
    flex: 1 1 auto;
    min-width: 0;
  }
}
</style>
