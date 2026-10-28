<script setup lang="ts">
import PanelExportMenu from "~/components/panel/PanelExportMenu.vue";
import { useAppLocale } from "~/composables/useAppLocale";
import {
  exportGamesExcel,
  exportGamesPdf,
  type GameExportRow,
} from "~/utils/exportGames";

const props = withDefaults(
  defineProps<{
    games: GameExportRow[];
    title: string;
    fileName: string;
    /** Çoklu seçim / düzenleme modu açık mı */
    editing?: boolean;
    /** Düzenle butonu (liste boşken) */
    editDisabled?: boolean;
  }>(),
  {
    editing: false,
    editDisabled: false,
  }
);

const emit = defineEmits<{
  add: [];
  edit: [];
}>();

const { tx } = useAppLocale();
const exporting = ref(false);

async function onExcel() {
  if (!props.games.length) return;
  exporting.value = true;
  try {
    exportGamesExcel(props.games, props.fileName);
  } finally {
    exporting.value = false;
  }
}

async function onPdf() {
  if (!props.games.length) return;
  exporting.value = true;
  try {
    exportGamesPdf(props.games, {
      title: props.title,
      fileName: props.fileName,
    });
  } finally {
    exporting.value = false;
  }
}
</script>

<template>
  <div class="pla">
    <PanelExportMenu
      :busy="exporting"
      :disabled="!games.length"
      @excel="onExcel"
      @pdf="onPdf"
    />
    <button
      type="button"
      class="pla__edit"
      :class="{ 'pla__edit--active': editing }"
      :disabled="editDisabled && !editing"
      @click="emit('edit')"
    >
      <v-icon
        :icon="editing ? 'mdi-close' : 'mdi-checkbox-multiple-marked-outline'"
        size="18"
      />
      {{ editing ? tx("panel.list.editDone") : tx("panel.list.edit") }}
    </button>
    <button type="button" class="pla__add" @click="emit('add')">
      <v-icon icon="mdi-plus" size="18" />
      {{ tx("panel.empty.addGame") }}
    </button>
  </div>
</template>

<style scoped>
.pla {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.pla__edit {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 2.35rem;
  padding: 0.45rem 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 0.7rem;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.88);
  font: inherit;
  font-size: 0.82rem;
  font-weight: 650;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}

.pla__edit:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(105, 240, 174, 0.45);
  color: #69f0ae;
  transform: translateY(-1px);
}

.pla__edit--active {
  border-color: rgba(239, 83, 80, 0.55);
  background: rgba(239, 83, 80, 0.12);
  color: #ef9a9a;
}

.pla__edit--active:hover:not(:disabled) {
  border-color: rgba(239, 83, 80, 0.75);
  background: rgba(239, 83, 80, 0.18);
  color: #ffcdd2;
}

.pla__edit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Light: beyaz yazı kayboluyordu — dışa aktar ile aynı kontrast */
:global(.panel-shell[data-theme="light"]) .pla__edit {
  border-color: rgb(15 23 42 / 0.18);
  background: color-mix(in srgb, var(--panel-card, #ced5e0) 88%, #fff);
  color: var(--panel-text, #0f172a);
}
:global(.panel-shell[data-theme="light"]) .pla__edit:hover:not(:disabled) {
  background: #fff;
  border-color: color-mix(in srgb, var(--panel-accent, #047857) 45%, transparent);
  color: var(--panel-accent, #047857);
}
:global(.panel-shell[data-theme="light"]) .pla__edit--active {
  border-color: rgb(185 28 28 / 0.45);
  background: rgb(254 226 226 / 0.85);
  color: #b91c1c;
}
:global(.panel-shell[data-theme="light"]) .pla__edit--active:hover:not(:disabled) {
  border-color: rgb(185 28 28 / 0.65);
  background: rgb(254 202 202 / 0.95);
  color: #991b1b;
}

.pla__add {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 2.35rem;
  padding: 0.45rem 0.95rem;
  border: none;
  border-radius: 0.7rem;
  background: #69f0ae;
  color: #07140f;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 750;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.15s ease;
}

.pla__add:hover {
  background: #7ff5bb;
  transform: translateY(-1px);
}
</style>
