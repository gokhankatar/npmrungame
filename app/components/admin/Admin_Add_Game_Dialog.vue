<template>
  <v-dialog
    :model-value="modelValue"
    max-width="560"
    scrollable
    transition="dialog-bottom-transition"
    content-class="admin-add-game-overlay"
    @update:model-value="onDialogUpdate"
  >
    <v-card
      class="admin-add-game-dialog default-title-letter"
      :class="`admin-add-game-dialog--${theme}`"
      rounded="xl"
      :elevation="0"
    >
      <div class="admin-add-game-dialog__glow" aria-hidden="true" />

      <header class="admin-add-game-dialog__header">
        <div class="admin-add-game-dialog__title-wrap">
          <div class="admin-add-game-dialog__icon-ring">
            <v-icon icon="mdi-gamepad-variant-outline" size="22" />
          </div>
          <div>
            <h2 class="admin-add-game-dialog__title">{{ title }}</h2>
            <p v-if="subtitle" class="admin-add-game-dialog__subtitle">{{ subtitle }}</p>
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          class="admin-add-game-dialog__close"
          :ripple="false"
          aria-label="Kapat"
          @click="close"
        />
      </header>

      <v-divider class="admin-add-game-dialog__divider" />

      <section class="admin-add-game-dialog__search">
        <v-text-field
          :model-value="search"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          rounded="xl"
          label="Oyun ara"
          placeholder="Örn. Black Myth: Wukong, Elden Ring..."
          :density="isExtraLargeScreen ? 'comfortable' : 'compact'"
          clearable
          hide-details
          class="admin-add-game-dialog__field"
          @update:model-value="onSearchInput"
        />
        <p class="admin-add-game-dialog__hint">
          <v-icon icon="mdi-information-outline" size="14" class="me-1" />
          En az 3 karakter yaz; birden fazla oyun seçebilirsin.
        </p>
      </section>

      <section class="admin-add-game-dialog__results">
        <div v-if="loading" class="admin-add-game-dialog__loading">
          <v-skeleton-loader
            v-for="n in 4"
            :key="n"
            type="list-item-avatar-two-line"
            class="admin-add-game-dialog__skeleton rounded-lg mb-2"
          />
        </div>

        <div
          v-else-if="!search || search.length < 3"
          class="admin-add-game-dialog__empty"
        >
          <v-icon icon="mdi-magnify" size="40" class="admin-add-game-dialog__empty-icon" />
          <p class="admin-add-game-dialog__empty-title">Aramaya başla</p>
          <p class="admin-add-game-dialog__empty-text">
            Favori oyununun adını yaz, sonuçlardan seç.
          </p>
        </div>

        <div
          v-else-if="searchResults.length === 0"
          class="admin-add-game-dialog__empty"
        >
          <v-icon icon="mdi-emoticon-sad-outline" size="40" class="admin-add-game-dialog__empty-icon" />
          <p class="admin-add-game-dialog__empty-title">Sonuç bulunamadı</p>
          <p class="admin-add-game-dialog__empty-text">
            Farklı bir yazım veya İngilizce ad deneyebilirsin.
          </p>
        </div>

        <template v-else>
          <div class="admin-add-game-dialog__results-head">
            <span class="admin-add-game-dialog__results-count">
              {{ searchResults.length }} oyun bulundu
            </span>
            <span v-if="selected.length" class="admin-add-game-dialog__selected-pill">
              {{ selected.length }} seçili
            </span>
          </div>

          <button
            v-for="game in searchResults"
            :key="game.id"
            type="button"
            class="admin-add-game-dialog__item"
            :class="{ 'admin-add-game-dialog__item--selected': isSelected(game) }"
            @click="emit('toggle-select', game)"
          >
            <v-avatar :size="smallScreen ? 40 : 52" rounded="lg" class="admin-add-game-dialog__avatar">
              <v-img :src="game.background_image" :alt="game.name" cover />
            </v-avatar>
            <div class="admin-add-game-dialog__item-body">
              <p class="admin-add-game-dialog__item-name">
                {{ game.name }}
                <span v-if="game.released" class="admin-add-game-dialog__item-year">
                  ({{ new Date(game.released).getFullYear() }})
                </span>
              </p>
              <div class="admin-add-game-dialog__item-meta">
                <v-chip
                  v-if="game.metacritic"
                  size="x-small"
                  variant="tonal"
                  :color="useMetacriticStyle(game.metacritic).color"
                  :ripple="false"
                  prepend-icon="mdi-star"
                  :text="String(game.metacritic)"
                />
                <span v-else class="admin-add-game-dialog__item-na">Metacritic yok</span>
              </div>
            </div>
            <v-icon
              :icon="isSelected(game) ? 'mdi-check-circle' : 'mdi-plus-circle-outline'"
              size="22"
              class="admin-add-game-dialog__item-action"
            />
          </button>
        </template>
      </section>

      <footer v-if="selected.length > 0" class="admin-add-game-dialog__footer">
        <v-btn
          :loading="adding"
          :text="`${submitText} (${selected.length})`"
          prepend-icon="mdi-plus"
          variant="flat"
          rounded="xl"
          class="text-capitalize admin-add-game-dialog__submit"
          :ripple="false"
          block
          @click="emit('submit')"
        />
        <v-btn
          text="Seçimleri temizle"
          prepend-icon="mdi-broom"
          variant="tonal"
          rounded="xl"
          class="text-capitalize mt-2"
          :ripple="false"
          block
          @click="emit('clear-selection')"
        />
      </footer>

      <v-expand-transition>
        <div v-if="added" class="admin-add-game-dialog__success">
          <v-alert
            density="compact"
            variant="tonal"
            color="success"
            :icon="false"
            class="rounded-xl"
          >
            <div class="d-flex align-center ga-2">
              <v-icon icon="mdi-check-circle" size="20" />
              <span>{{ addedCount }} oyun başarıyla eklendi</span>
            </div>
          </v-alert>
        </div>
      </v-expand-transition>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { useMetacriticStyle } from "~/composables/data/handleData";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    search: string;
    searchResults: any[];
    selected: any[];
    loading?: boolean;
    adding?: boolean;
    added?: boolean;
    addedCount?: number;
    title?: string;
    subtitle?: string;
    submitText: string;
    theme?: "green" | "cyan" | "red" | "lime" | "default";
  }>(),
  {
    loading: false,
    adding: false,
    added: false,
    addedCount: 0,
    title: "Oyun Ekle",
    subtitle: "Oyun adı yaz, sonuçlardan seç ve koleksiyona ekle",
    theme: "green",
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "update:search": [value: string];
  search: [];
  "toggle-select": [game: any];
  submit: [];
  "clear-selection": [];
}>();

const display = useDisplay();
const smallScreen = computed(() => display.smAndDown.value);
const isExtraLargeScreen = computed(() => display.lgAndUp.value);

const isSelected = (game: any) =>
  props.selected.some((item: any) => item.id === game.id);

const close = () => emit("update:modelValue", false);

const onDialogUpdate = (value: boolean) => {
  emit("update:modelValue", value);
  if (!value) {
    emit("update:search", "");
  }
};

const onSearchInput = (value: string) => {
  emit("update:search", value ?? "");
  emit("search");
};
</script>

<style scoped>
@import "~/assets/css/admin_add_game_dialog.css";
</style>
