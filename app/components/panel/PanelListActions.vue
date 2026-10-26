<script setup lang="ts">
import PanelExportMenu from "~/components/panel/PanelExportMenu.vue";
import { useAppLocale } from "~/composables/useAppLocale";
import {
  exportGamesExcel,
  exportGamesPdf,
  type GameExportRow,
} from "~/utils/exportGames";

const props = defineProps<{
  games: GameExportRow[];
  title: string;
  fileName: string;
}>();

const emit = defineEmits<{
  add: [];
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
