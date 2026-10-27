<script setup lang="ts">
import { useAppLocale } from "~/composables/useAppLocale";

defineProps<{
  busy?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  excel: [];
  pdf: [];
}>();

const { tx } = useAppLocale();
const open = ref(false);
const root = ref<HTMLElement | null>(null);

function onDocumentClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false;
}

onMounted(() => document.addEventListener("click", onDocumentClick));
onBeforeUnmount(() => document.removeEventListener("click", onDocumentClick));

function pick(kind: "excel" | "pdf") {
  open.value = false;
  emit(kind);
}
</script>

<template>
  <div ref="root" class="pem">
    <button
      type="button"
      class="pem__trigger"
      :disabled="busy || disabled"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="open = !open"
    >
      <v-icon icon="mdi-download-outline" size="18" />
      <span>{{ tx("panel.export.label") }}</span>
      <v-icon
        icon="mdi-chevron-down"
        size="16"
        class="pem__chevron"
        :class="{ 'pem__chevron--open': open }"
      />
    </button>

    <div v-if="open" class="pem__menu" role="menu">
      <button type="button" role="menuitem" class="pem__item" @click="pick('pdf')">
        <span class="pem__icon pem__icon--pdf" aria-hidden="true">
          <v-icon icon="mdi-file-pdf-box" size="20" />
        </span>
        <span class="pem__item-text">
          <strong>{{ tx("panel.export.pdf") }}</strong>
          <small>PDF</small>
        </span>
      </button>
      <button type="button" role="menuitem" class="pem__item" @click="pick('excel')">
        <span class="pem__icon pem__icon--excel" aria-hidden="true">
          <v-icon icon="mdi-file-excel-box" size="20" />
        </span>
        <span class="pem__item-text">
          <strong>{{ tx("panel.export.excel") }}</strong>
          <small>Excel (.csv)</small>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.pem {
  position: relative;
}

.pem__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.35rem;
  padding: 0.45rem 0.9rem;
  border-radius: 0.7rem;
  border: 1px solid var(--panel-border, rgb(255 255 255 / 0.14));
  background: transparent;
  color: var(--panel-text, #e8eef7);
  font: inherit;
  font-size: 0.82rem;
  font-weight: 650;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    color 0.15s ease;
}

.pem__trigger:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--panel-accent, #69f0ae) 45%, transparent);
  color: var(--panel-accent, #69f0ae);
  background: var(--panel-icon-bg, rgb(105 240 174 / 0.06));
}

.pem__trigger:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.pem__chevron {
  opacity: 0.7;
  transition: transform 0.15s ease;
}

.pem__chevron--open {
  transform: rotate(180deg);
}

.pem__menu {
  position: absolute;
  top: calc(100% + 0.4rem);
  right: 0;
  z-index: 40;
  width: 15.5rem;
  padding: 0.4rem;
  border-radius: 1rem;
  border: 1px solid var(--panel-card-border, rgb(255 255 255 / 0.1));
  background: var(--panel-card, #0c1220);
  box-shadow: var(--panel-card-shadow, 0 16px 40px rgb(0 0 0 / 0.4));
  color: var(--panel-text, #e8eef7);
}

.pem__item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.7rem;
  padding: 0.55rem 0.65rem;
  border: none;
  border-radius: 0.75rem;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.pem__item:hover {
  background: var(--panel-soft, rgb(255 255 255 / 0.05));
}

.pem__icon {
  display: inline-flex;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.65rem;
}

.pem__icon--pdf {
  background: rgb(244 63 94 / 0.12);
  color: #fb7185;
}

.pem__icon--excel {
  background: var(--panel-icon-bg, rgb(105 240 174 / 0.12));
  color: var(--panel-accent, #69f0ae);
}

.pem__item-text {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  min-width: 0;
}

.pem__item-text strong {
  font-size: 0.84rem;
  font-weight: 700;
}

.pem__item-text small {
  font-size: 0.7rem;
  color: #94a3b8;
}
</style>
