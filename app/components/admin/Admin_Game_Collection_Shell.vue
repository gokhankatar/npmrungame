<template>
  <div
    class="admin-collection-page"
    :class="{
      'admin-collection-page--cyan': theme === 'cyan',
      'admin-collection-page--red': theme === 'red',
      'admin-completed-page': theme === 'green',
    }"
  >
    <header class="admin-collection-hero admin-completed-hero">
      <div class="admin-collection-hero-main">
        <span class="admin-collection-hero-badge admin-completed-hero-badge default-title-letter">
          <v-icon :icon="badgeIcon" size="14" />
          {{ badge }}
        </span>
        <h1 class="admin-collection-hero-title admin-completed-hero-title default-title-letter">
          {{ title }}
        </h1>
        <p class="admin-collection-hero-sub admin-completed-hero-sub">{{ subtitle }}</p>
      </div>
      <div class="admin-collection-hero-actions admin-completed-hero-actions">
        <v-btn
          class="admin-collection-add-btn admin-completed-add-btn text-capitalize"
          :color="accentColor"
          variant="flat"
          rounded="lg"
          prepend-icon="mdi-plus"
          :text="addButtonText"
          :ripple="false"
          @click="$emit('add')"
        />
      </div>
    </header>

    <div class="admin-collection-stats admin-completed-stats">
      <article
        v-for="card in statCards"
        :key="card.id"
        class="admin-stat-card default-title-letter"
      >
        <div class="admin-stat-card__top">
          <div class="admin-stat-card__icon-wrap">
            <v-icon :icon="card.icon" size="22" />
          </div>
          <div class="admin-stat-card__text">
            <p class="admin-stat-card__value">{{ card.value }}</p>
            <p class="admin-stat-card__label">{{ card.label }}</p>
          </div>
        </div>
        <v-progress-linear
          :model-value="card.progress"
          :color="accentColor"
          bg-color="rgba(255,255,255,0.08)"
          rounded
          height="6"
          class="admin-stat-card__bar mt-2"
        />
        <p class="admin-stat-card__hint">{{ card.hint }}</p>
      </article>
    </div>

    <div class="admin-collection-toolbar admin-completed-toolbar">
      <v-text-field
        :model-value="listSearchQuery"
        class="admin-collection-search admin-completed-search"
        placeholder="Oyun ara..."
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        flat
        hide-details
        clearable
        density="compact"
        bg-color="rgba(255,255,255,0.06)"
        :color="accentColor"
        rounded="lg"
        @update:model-value="onSearchUpdate"
        @click:clear="$emit('clear-search')"
      />
      <div class="admin-collection-toolbar-actions admin-completed-toolbar-actions">
        <v-btn-toggle
          :model-value="viewMode"
          mandatory
          density="compact"
          class="admin-collection-view-toggle admin-completed-view-toggle"
          :color="accentColor"
          @update:model-value="$emit('update:viewMode', $event)"
        >
          <v-btn value="card" icon="mdi-view-grid" size="small" :ripple="false" />
          <v-btn value="list" icon="mdi-view-list" size="small" :ripple="false" />
          <v-btn value="table" icon="mdi-table" size="small" :ripple="false" />
        </v-btn-toggle>

        <v-menu location="bottom end">
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              class="admin-collection-sort-btn text-capitalize"
              variant="tonal"
              size="small"
              rounded="lg"
              :prepend-icon="sortMenuIcon"
              :text="sortLabel"
              :ripple="false"
            />
          </template>
          <v-list density="compact" class="bg-grey-darken-4 admin-collection-sort-menu">
            <v-list-item
              v-if="showAddedSort"
              title="En son eklenen"
              prepend-icon="mdi-clock-outline"
              class="text-capitalize"
              @click="$emit('sort', 'added')"
            />
            <v-list-item
              title="Çıkış (yeni → eski)"
              prepend-icon="mdi-calendar"
              class="text-capitalize"
              @click="$emit('sort', 'new')"
            />
            <v-list-item
              title="Çıkış (eski → yeni)"
              prepend-icon="mdi-calendar-arrow-left"
              class="text-capitalize"
              @click="$emit('sort', 'old')"
            />
            <v-list-item
              v-if="showMetaSort"
              title="Metacritic (yüksek)"
              prepend-icon="mdi-star"
              class="text-capitalize"
              @click="$emit('sort', 'meta')"
            />
          </v-list>
        </v-menu>

        <v-btn
          icon="mdi-refresh"
          variant="text"
          size="small"
          rounded="lg"
          :loading="loading"
          :ripple="false"
          @click="$emit('refresh')"
        />
        <v-btn
          :icon="bulkDeleteMode ? 'mdi-close' : 'mdi-checkbox-multiple-marked-outline'"
          variant="text"
          size="small"
          rounded="lg"
          :color="bulkDeleteMode ? 'error' : undefined"
          :ripple="false"
          @click="$emit('bulk-toggle')"
        />
      </div>
    </div>

    <div class="admin-collection-body admin-completed-body">
      <slot name="bulk-bar" />
      <p
        v-if="listSearchQuery && !loading"
        class="admin-collection-result-hint admin-completed-result-hint"
      >
        {{ filteredGamesCount }} / {{ totalGamesCount }} oyun gösteriliyor
      </p>
      <slot />
    </div>

    <div v-if="$slots.extra" class="admin-collection-extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { AdminCollectionSortMode } from "~/composables/admin/useAdminCollectionList";

const listSearchQuery = defineModel<string>("listSearchQuery", { default: "" });
const viewMode = defineModel<"card" | "list" | "table">("viewMode", { default: "card" });

const props = withDefaults(
  defineProps<{
    theme?: "green" | "cyan" | "red";
    title: string;
    subtitle: string;
    badge: string;
    badgeIcon: string;
    accentColor: string;
    addButtonText?: string;
    totalGamesCount: number;
    filteredGamesCount: number;
    avgPlaytime: string;
    avgMetacritic: string;
    sortLabel: string;
    sortMenuIcon: string;
    loading: boolean;
    bulkDeleteMode: boolean;
    showAddedSort?: boolean;
    showMetaSort?: boolean;
  }>(),
  {
    theme: "green",
    addButtonText: "Oyun Ekle",
    showAddedSort: true,
    showMetaSort: true,
  }
);

const collectionGoal = computed(() => {
  if (props.theme === "cyan") return 50;
  if (props.theme === "red") return 20;
  return 100;
});

const totalLabel = computed(() => {
  if (props.theme === "cyan") return "Kuyruktaki oyun";
  if (props.theme === "red") return "Aktif oyun";
  return "Bitirilen oyun";
});

const statCards = computed(() => {
  const total = props.totalGamesCount;
  const filtered = props.filteredGamesCount;
  const goal = collectionGoal.value;
  const metaNum =
    props.avgMetacritic === "—" ? null : Number.parseInt(props.avgMetacritic, 10);
  const playNum =
    props.avgPlaytime === "—" ? null : Number.parseFloat(props.avgPlaytime);

  const goalProgress = goal > 0 ? Math.min(100, Math.round((total / goal) * 100)) : 0;
  const visibleProgress =
    total > 0 ? Math.min(100, Math.round((filtered / total) * 100)) : 0;
  const metaProgress =
    metaNum != null && !Number.isNaN(metaNum) ? Math.min(100, metaNum) : 0;
  const playProgress =
    playNum != null && !Number.isNaN(playNum)
      ? Math.min(100, Math.round((playNum / 50) * 100))
      : 0;

  return [
    {
      id: "total",
      icon: props.theme === "cyan" ? "mdi-playlist-play" : "mdi-trophy-outline",
      label: totalLabel.value,
      value: String(total),
      progress: goalProgress,
      hint: `${total} / ${goal} hedef · %${goalProgress}`,
    },
    {
      id: "playtime",
      icon: "mdi-timer-outline",
      label: "Ort. süre (saat)",
      value: props.avgPlaytime,
      progress: playProgress,
      hint:
        playNum != null
          ? `Ana hikâye ortalaması · ${playNum} saat`
          : "Henüz süre verisi yok",
    },
    {
      id: "meta",
      icon: "mdi-star-outline",
      label: "Ort. Metacritic",
      value: props.avgMetacritic,
      progress: metaProgress,
      hint:
        metaNum != null ? `Puan gücü · ${metaNum}/100` : "Metacritic verisi yok",
    },
    {
      id: "visible",
      icon: listSearchQuery.value?.trim()
        ? "mdi-filter-check-outline"
        : "mdi-eye-outline",
      label: "Listede görünen",
      value: String(filtered),
      progress: visibleProgress,
      hint: listSearchQuery.value?.trim()
        ? `${filtered} / ${total} eşleşme`
        : total > 0
          ? "Tüm koleksiyon görünür"
          : "Liste boş",
    },
  ];
});

const emit = defineEmits<{
  add: [];
  refresh: [];
  "bulk-toggle": [];
  "search-input": [];
  "clear-search": [];
  sort: [mode: AdminCollectionSortMode];
}>();

const onSearchUpdate = (value: string | null) => {
  listSearchQuery.value = value ?? "";
  emit("search-input");
};
</script>

<style scoped>
@import "~/assets/css/admin_collection_page.css";
</style>
