<template>
  <div class="admin-collection-page admin-collection-page--amber">
    <header class="admin-collection-hero">
      <div>
        <span class="admin-collection-hero-badge">
          <v-icon icon="mdi-radar" size="14" />
          Radar
        </span>
        <h1 class="admin-collection-hero-title default-title-letter">Radarımdaki Oyunlar</h1>
        <p class="admin-collection-hero-sub default-title-letter">
          RAWG API üzerinden oyun ara, çıkış tarihini belirle ve radar listesini güncelle.
        </p>
      </div>

      <div class="d-flex flex-wrap align-center ga-2">
        <v-btn
          class="admin-collection-add-btn text-capitalize"
          color="#ffb74d"
          variant="flat"
          rounded="lg"
          prepend-icon="mdi-plus"
          text="Oyun Ekle"
          :ripple="false"
          @click="openAddDialog"
        />
        <v-btn
          icon="mdi-refresh"
          variant="tonal"
          rounded="lg"
          :ripple="false"
          :loading="isLoading"
          color="grey-lighten-1"
          :size="smallScreen ? 'small' : 'default'"
          @click="fetchUpcomingGames"
        />
      </div>
    </header>

    <v-row class="admin-upcoming-summary mb-3" :dense="smallScreen">
      <v-col cols="12" sm="4" class="d-flex">
        <article class="admin-stat-card flex-grow-1 w-100">
          <div class="admin-stat-card__top">
            <div class="admin-stat-card__icon-wrap">
              <v-icon icon="mdi-gamepad-variant" size="22" />
            </div>
            <div class="admin-stat-card__text">
              <p class="admin-stat-card__value">{{ upcomingGames.length }}</p>
              <p class="admin-stat-card__label">Toplam kayıt</p>
            </div>
          </div>
        </article>
      </v-col>

      <v-col cols="12" sm="4" class="d-flex">
        <article class="admin-stat-card flex-grow-1 w-100">
          <div class="admin-stat-card__top">
            <div class="admin-stat-card__icon-wrap">
              <v-icon icon="mdi-timer-sand" size="22" />
            </div>
            <div class="admin-stat-card__text">
              <p class="admin-stat-card__value">{{ soonCount }}</p>
              <p class="admin-stat-card__label">30 gün içinde</p>
            </div>
          </div>
        </article>
      </v-col>

      <v-col cols="12" sm="4" class="d-flex">
        <article class="admin-stat-card flex-grow-1 w-100">
          <div class="admin-stat-card__top">
            <div class="admin-stat-card__icon-wrap">
              <v-icon icon="mdi-calendar-range" size="22" />
            </div>
            <div class="admin-stat-card__text">
              <p class="admin-stat-card__value">{{ thisYearCount }}</p>
              <p class="admin-stat-card__label">Bu yıl çıkış</p>
            </div>
          </div>
        </article>
      </v-col>

      <v-col cols="12">
        <article v-if="nextGame" class="upcoming-admin-spotlight">
        <div class="upcoming-admin-spotlight__media">
          <v-img
            v-if="nextGame.background_image"
            :src="nextGame.background_image"
            :alt="nextGame.name"
            cover
            class="upcoming-admin-spotlight__img"
          />
          <div v-else class="upcoming-admin-spotlight__img upcoming-admin-spotlight__img--empty">
            <v-icon icon="mdi-gamepad-variant-outline" size="36" color="rgba(255,255,255,0.35)" />
          </div>
        </div>

        <div class="upcoming-admin-spotlight__body">
          <span class="upcoming-admin-spotlight__badge default-title-letter">
            <v-icon icon="mdi-star-shooting" size="14" />
            En yakın radardaki oyun
          </span>
          <h2 class="upcoming-admin-spotlight__title default-title-letter">
            {{ nextGame.name }}
          </h2>
          <p class="upcoming-admin-spotlight__date default-title-letter">
            {{ formatReleaseDate(nextGame.releaseDate) }}
          </p>
          <v-chip
            size="small"
            variant="tonal"
            class="upcoming-countdown-chip default-title-letter mt-2"
            :color="getCountdownChip(nextGame.releaseDate).color"
            :prepend-icon="getCountdownChip(nextGame.releaseDate).icon"
            :text="getCountdownChip(nextGame.releaseDate).text"
          />
        </div>

        <div class="upcoming-admin-spotlight__actions">
          <v-btn
            variant="tonal"
            color="warning"
            rounded="lg"
            size="small"
            prepend-icon="mdi-pencil-outline"
            class="text-capitalize default-title-letter"
            text="Düzenle"
            :ripple="false"
            @click="startEdit(nextGame)"
          />
        </div>
      </article>

        <article v-else-if="!isLoading" class="upcoming-admin-spotlight upcoming-admin-spotlight--empty">
          <v-icon icon="mdi-calendar-blank-outline" size="32" color="rgba(255,183,77,0.45)" />
          <p class="upcoming-admin-spotlight__empty-title default-title-letter mb-1">
            Radarda en yakın çıkış yok
          </p>
          <p class="upcoming-admin-spotlight__empty-desc mb-0">
            Radara oyun eklediğinde burada öne çıkar.
          </p>
        </article>
      </v-col>
    </v-row>

    <p
      v-if="upcomingGames.length && !isLoading"
      class="text-subtitle-2 text-grey-lighten-1 default-title-letter mb-3"
    >
      Radardaki oyunlar ({{ upcomingGames.length }})
    </p>

    <v-row v-if="isLoading" :dense="smallScreen">
      <v-col v-for="i in 3" :key="i" cols="12">
        <v-skeleton-loader type="image, article" class="rounded-xl upcoming-game-card-skeleton" />
      </v-col>
    </v-row>

    <v-row v-else-if="upcomingGames.length" :dense="smallScreen">
      <v-col
        v-for="(game, index) in upcomingGames"
        :key="game.firestoreId"
        cols="12"
      >
        <article
          class="upcoming-game-card"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <div class="upcoming-game-card__media">
            <v-img
              v-if="game.background_image"
              :src="game.background_image"
              :alt="game.name"
              cover
              class="upcoming-game-card__img"
            />
            <div v-else class="upcoming-game-card__img upcoming-game-card__img--empty">
              <v-icon icon="mdi-gamepad-variant-outline" size="40" color="rgba(255,255,255,0.3)" />
            </div>
            <div class="upcoming-game-card__media-overlay" aria-hidden="true" />
          </div>

          <div class="upcoming-game-card__body">
            <div class="d-flex align-start justify-space-between ga-2 mb-2">
              <div class="upcoming-date-pill">
                <span class="upcoming-date-pill__day">{{ getDateParts(game.releaseDate).day }}</span>
                <span class="upcoming-date-pill__month">{{ getDateParts(game.releaseDate).month }}</span>
                <span class="upcoming-date-pill__year">{{ getDateParts(game.releaseDate).year }}</span>
              </div>

              <div class="d-flex align-center ga-1 flex-shrink-0">
                <v-btn
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="outlined"
                  color="grey-lighten-1"
                  :ripple="false"
                  @click="startEdit(game)"
                />
                <v-btn
                  icon="mdi-delete-outline"
                  size="small"
                  variant="outlined"
                  color="error"
                  :ripple="false"
                  @click="openDeleteDialog(game)"
                />
              </div>
            </div>

            <h3 class="upcoming-game-card__title default-title-letter">
              {{ game.name }}
            </h3>
            <p class="upcoming-game-card__date default-title-letter">
              {{ formatReleaseDate(game.releaseDate) }}
            </p>
            <v-chip
              size="small"
              variant="tonal"
              class="upcoming-countdown-chip default-title-letter mt-2"
              :color="getCountdownChip(game.releaseDate).color"
              :prepend-icon="getCountdownChip(game.releaseDate).icon"
              :text="getCountdownChip(game.releaseDate).text"
            />
          </div>
        </article>
      </v-col>
    </v-row>

    <div v-else class="admin-collection-empty">
      <v-icon icon="mdi-calendar-blank-outline" size="48" color="rgba(255,183,77,0.45)" />
      <p class="admin-collection-empty-title default-title-letter">
        Henüz radarda oyun yok
      </p>
      <p class="admin-collection-empty-desc">
        Oyun Ekle ile RAWG’den ara, çıkış tarihini seç ve radara ekle.
      </p>
      <v-btn
        color="#ffb74d"
        variant="tonal"
        rounded="lg"
        prepend-icon="mdi-plus"
        class="text-capitalize"
        text="Oyun ekle"
        @click="openAddDialog"
      />
    </div>
  </div>

  <!-- Ekle / düzenle popup -->
  <v-dialog
    v-model="isFormDialogOpen"
    :max-width="560"
    scrollable
    transition="dialog-bottom-transition"
    scrim="rgba(0,0,0,0.85)"
    @after-leave="onFormDialogClosed"
  >
    <div class="delete-game-pop-up upcoming-form-dialog d-flex flex-column ga-3 rounded-xl pa-4 pa-lg-5">
      <div class="d-flex align-center justify-space-between ga-2">
        <div class="d-flex align-center ga-2 min-w-0">
          <v-icon
            :icon="isEditing ? 'mdi-pencil-outline' : 'mdi-plus-circle-outline'"
            color="#ffb74d"
            size="22"
          />
          <p class="text-subtitle-1 text-grey-lighten-1 default-title-letter mb-0 text-truncate">
            {{ isEditing ? "Kaydı düzenle" : "Yeni oyun ekle" }}
          </p>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          color="grey-lighten-1"
          :ripple="false"
          @click="closeFormDialog"
        />
      </div>

      <v-divider color="rgba(255,255,255,0.12)" />

      <v-form ref="gameForm" @submit.prevent="handleSubmit">
        <v-text-field
          v-model="searchGameText"
          label="Oyun ara"
          placeholder="En az 3 karakter — örn. GTA 6"
          variant="solo-filled"
          flat
          rounded="xl"
          prepend-inner-icon="mdi-magnify"
          :density="smallScreen ? 'compact' : 'comfortable'"
          hide-details
          clearable
          class="default-title-letter"
          color="grey-lighten-1"
          :disabled="isEditing && !searchGameText"
          @update:model-value="onSearchInput"
        />

        <p class="text-caption text-grey-darken-1 default-title-letter mt-1 mb-2">
          <v-icon icon="mdi-information-outline" size="14" class="me-1" />
          Oyun adı RAWG veritabanından seçilir.
        </p>

        <div v-if="isSearchingGame" class="d-flex align-center ga-2 py-2">
          <v-progress-circular indeterminate size="18" width="2" color="#ffb74d" />
          <span class="text-caption text-grey-lighten-2">Aranıyor…</span>
        </div>

        <div
          v-else-if="searchGameText.length >= 3 && searchResults.length"
          class="upcoming-search-results"
        >
          <button
            v-for="game in searchResults"
            :key="game.id"
            type="button"
            class="upcoming-pick-btn"
            :class="{ 'upcoming-pick-btn--active': selectedGame?.id === game.id }"
            @click="selectGameFromApi(game)"
          >
            <v-avatar :size="40" rounded="lg">
              <v-img :src="game.background_image" :alt="game.name" cover />
            </v-avatar>
            <div class="min-w-0 flex-grow-1">
              <p class="text-caption text-subtitle-2 text-grey-lighten-1 mb-0 text-truncate">
                {{ game.name }}
                <span v-if="game.released" class="text-grey-darken-1">
                  ({{ formatYear(game.released) }})
                </span>
              </p>
            </div>
            <v-icon
              :icon="selectedGame?.id === game.id ? 'mdi-check-circle' : 'mdi-plus-circle-outline'"
              size="20"
              color="#ffb74d"
            />
          </button>
        </div>

        <p
          v-else-if="searchGameText.length >= 3 && !isSearchingGame"
          class="text-caption text-grey-darken-1 default-title-letter py-2"
        >
          Sonuç bulunamadı.
        </p>

        <div v-if="displaySelectedGame" class="upcoming-selected-game">
          <v-avatar :size="52" rounded="lg">
            <v-img
              v-if="displaySelectedGame.background_image"
              :src="displaySelectedGame.background_image"
              cover
            />
            <v-icon v-else icon="mdi-gamepad-variant" />
          </v-avatar>
          <div class="min-w-0 flex-grow-1">
            <p class="text-subtitle-2 text-grey-lighten-1 default-title-letter mb-0 text-truncate">
              {{ displaySelectedGame.name }}
            </p>
            <p v-if="displaySelectedGame.rawgId" class="text-caption text-grey-darken-1 mb-0">
              RAWG #{{ displaySelectedGame.rawgId }}
            </p>
          </div>
          <v-btn
            v-if="!isEditing || searchGameText"
            icon="mdi-close"
            size="x-small"
            variant="text"
            color="grey-lighten-1"
            :ripple="false"
            @click="clearSelectedGame"
          />
        </div>

        <v-menu
          v-model="dateMenuOpen"
          :close-on-content-click="false"
          location="bottom start"
          transition="scale-transition"
        >
          <template #activator="{ props: menuProps }">
            <v-text-field
              v-bind="menuProps"
              :model-value="releaseDateLabel"
              label="Çıkış tarihi"
              placeholder="Takvimden seç"
              variant="outlined"
              rounded="lg"
              prepend-inner-icon="mdi-calendar-month"
              append-inner-icon="mdi-chevron-down"
              :rules="rules.releaseDate"
              :density="smallScreen ? 'compact' : 'comfortable'"
              class="default-title-letter mt-2"
              color="grey-lighten-1"
              readonly
              clearable
              hint="Tahmini veya kesin çıkış tarihi"
              persistent-hint
              @click:clear.stop="clearReleaseDate"
            />
          </template>

          <v-card class="upcoming-date-picker-card pa-2" :elevation="8">
            <v-date-picker
              v-model="pickerDate"
              color="warning"
              show-adjacent-months
              :min="minReleaseDate"
              width="100%"
              @update:model-value="onDatePicked"
            />
            <div class="d-flex justify-end pa-2 pt-0">
              <v-btn
                size="small"
                variant="text"
                color="grey-lighten-1"
                text="Kapat"
                :ripple="false"
                @click="dateMenuOpen = false"
              />
              <v-btn
                size="small"
                variant="flat"
                color="warning"
                class="text-black ms-2"
                text="Tamam"
                :ripple="false"
                :disabled="!form.releaseDate"
                @click="dateMenuOpen = false"
              />
            </div>
          </v-card>
        </v-menu>

        <div class="d-flex flex-wrap ga-2 mt-4">
          <v-btn
            type="submit"
            :loading="isSaving"
            :disabled="!canSubmit"
            :ripple="false"
            color="#ffb74d"
            variant="flat"
            rounded="lg"
            class="text-black font-weight-bold default-title-letter text-capitalize flex-grow-1"
            :prepend-icon="isEditing ? 'mdi-content-save-outline' : 'mdi-plus'"
            :text="isEditing ? 'Kaydet' : 'Listeye ekle'"
          />

          <v-btn
            variant="text"
            color="grey-lighten-1"
            rounded="lg"
            class="default-title-letter text-capitalize"
            prepend-icon="mdi-close"
            text="İptal"
            :ripple="false"
            @click="closeFormDialog"
          />
        </div>
      </v-form>
    </div>
  </v-dialog>

  <v-dialog v-model="isDeleteDialogOpen" :max-width="480" scrim="rgba(0,0,0,0.85)">
    <div class="delete-game-pop-up d-flex flex-column ga-3 rounded pa-4 pa-lg-5">
      <p class="text-subtitle-2 text-grey-lighten-1 default-title-letter mb-0">
        <strong>{{ gameToDelete?.name }}</strong> kaydını silmek istediğinden emin misin?
      </p>
      <div class="d-flex justify-end ga-2">
        <v-btn
          text="İptal"
          variant="text"
          color="grey-lighten-2"
          rounded="lg"
          :ripple="false"
          @click="isDeleteDialogOpen = false"
        />
        <v-btn
          text="Sil"
          color="error"
          variant="tonal"
          prepend-icon="mdi-delete"
          :loading="isDeleting"
          rounded="lg"
          :ripple="false"
          @click="confirmDelete"
        />
      </div>
    </div>
  </v-dialog>

  <v-dialog v-model="toast.show" :max-width="440" scrim="rgba(0,0,0,0.85)">
    <div class="successfully-done-container d-flex flex-column align-center pa-4 pa-lg-5 rounded-xl">
      <v-btn
        icon="mdi-close"
        variant="text"
        color="grey-darken-1"
        size="small"
        class="align-self-end"
        :ripple="false"
        @click="toast.show = false"
      />
      <v-img :src="successfullyDoneImg" :width="smallScreen ? 48 : 64" />
      <p class="text-subtitle-2 text-grey-lighten-1 default-title-letter text-center mt-2">
        {{ toast.message }}
      </p>
    </div>
  </v-dialog>
</template>

<script lang="ts" setup>
import axios from "axios";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { VForm } from "vuetify/components";
import successfullyDoneImg from "~/assets/img/successfully_done_anim.gif";

const COLLECTION = "upcoming_games";

const { $firestore } = useNuxtApp();
const display = useDisplay();

const smallScreen = computed(() => display.smAndDown.value);

const gameForm = ref<InstanceType<typeof VForm> | null>(null);
const isLoading = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const isDeleteDialogOpen = ref(false);
const isFormDialogOpen = ref(false);
const gameToDelete = ref<UpcomingGame | null>(null);
const upcomingGames = ref<UpcomingGame[]>([]);

const searchGameText = ref("");
const searchResults = ref<any[]>([]);
const isSearchingGame = ref(false);
const selectedGame = ref<SelectedGamePreview | null>(null);
const dateMenuOpen = ref(false);
const pickerDate = ref<Date | null>(null);

const form = ref({
  name: "",
  releaseDate: "",
  background_image: "" as string | null,
  rawgId: null as number | null,
});

const toast = ref({ show: false, message: "" });

interface UpcomingGame {
  firestoreId: string;
  name: string;
  releaseDate: string;
  background_image?: string | null;
  rawgId?: number | null;
}

interface SelectedGamePreview {
  id: number;
  name: string;
  background_image?: string | null;
  rawgId: number;
}

const rules = {
  releaseDate: [() => !!form.value.releaseDate || "Çıkış tarihi seç"],
};

const minReleaseDate = computed(() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 2);
  return d;
});

const displaySelectedGame = computed(() => {
  if (selectedGame.value) return selectedGame.value;
  if (form.value.name) {
    return {
      id: form.value.rawgId ?? 0,
      name: form.value.name,
      background_image: form.value.background_image,
      rawgId: form.value.rawgId ?? 0,
    };
  }
  return null;
});

const canSubmit = computed(
  () => !!form.value.name.trim() && !!form.value.releaseDate
);

const releaseDateLabel = computed(() => {
  if (!form.value.releaseDate) return "";
  return parseReleaseDate(form.value.releaseDate).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

let searchDebounce: ReturnType<typeof setTimeout> | null = null;

const rawgDateToIso = (released?: string | null) => {
  if (!released || released === "TBA") return null;
  const parsed = new Date(released);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
};

const formatYear = (released: string) => {
  const d = new Date(released);
  return Number.isNaN(d.getTime()) ? "" : d.getFullYear();
};

const parseReleaseDate = (value: string) => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const syncPickerFromForm = () => {
  if (!form.value.releaseDate) {
    pickerDate.value = null;
    return;
  }
  pickerDate.value = parseReleaseDate(form.value.releaseDate);
};

const formatReleaseDate = (value: string) =>
  parseReleaseDate(value).toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const getDateParts = (value: string) => {
  const date = parseReleaseDate(value);
  return {
    day: date.getDate().toString().padStart(2, "0"),
    month: date.toLocaleDateString("tr-TR", { month: "short" }).toUpperCase(),
    year: date.getFullYear().toString(),
  };
};

const getCountdownChip = (value: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const release = parseReleaseDate(value);
  release.setHours(0, 0, 0, 0);
  const diffDays = Math.round((release.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) {
    return { text: `${Math.abs(diffDays)} gün önce`, color: "grey", icon: "mdi-check" };
  }
  if (diffDays === 0) {
    return { text: "Bugün çıkıyor", color: "warning", icon: "mdi-star" };
  }
  if (diffDays <= 30) {
    return { text: `${diffDays} gün kaldı`, color: "warning", icon: "mdi-timer-sand" };
  }
  return { text: `${diffDays} gün kaldı`, color: "grey-darken-1", icon: "mdi-calendar-clock" };
};

const sortByReleaseDate = (games: UpcomingGame[]) =>
  [...games].sort(
    (a, b) => parseReleaseDate(a.releaseDate).getTime() - parseReleaseDate(b.releaseDate).getTime()
  );

const soonCount = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limit = today.getTime() + 30 * 86400000;
  return upcomingGames.value.filter((g) => {
    const t = parseReleaseDate(g.releaseDate).getTime();
    return t >= today.getTime() && t <= limit;
  }).length;
});

const thisYearCount = computed(() => {
  const year = new Date().getFullYear();
  return upcomingGames.value.filter(
    (g) => parseReleaseDate(g.releaseDate).getFullYear() === year
  ).length;
});

const nextGame = computed(() => {
  if (!upcomingGames.value.length) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sorted = sortByReleaseDate(upcomingGames.value);
  return (
    sorted.find((g) => parseReleaseDate(g.releaseDate).getTime() >= today.getTime()) ?? sorted[0]
  );
});

const showToast = (message: string) => {
  toast.value = { show: true, message };
  setTimeout(() => {
    toast.value.show = false;
  }, 3200);
};

const searchGame = async () => {
  if (searchGameText.value.length < 3) {
    searchResults.value = [];
    return;
  }

  try {
    isSearchingGame.value = true;
    const { data } = await axios.get("/api/search-games", {
      params: { search: searchGameText.value },
    });
    searchResults.value = data?.results ?? [];
  } catch (error: any) {
    console.error(error.message);
    searchResults.value = [];
  } finally {
    isSearchingGame.value = false;
  }
};

const onSearchInput = () => {
  if (searchDebounce) clearTimeout(searchDebounce);
  if (searchGameText.value.length < 3) {
    searchResults.value = [];
    isSearchingGame.value = false;
    return;
  }
  searchDebounce = setTimeout(searchGame, 400);
};

const selectGameFromApi = (game: any) => {
  selectedGame.value = {
    id: game.id,
    name: game.name,
    background_image: game.background_image ?? null,
    rawgId: game.id,
  };
  form.value.name = game.name;
  form.value.background_image = game.background_image ?? null;
  form.value.rawgId = game.id;

  const apiDate = rawgDateToIso(game.released);
  if (apiDate && !form.value.releaseDate) {
    form.value.releaseDate = apiDate;
    syncPickerFromForm();
  }

  searchResults.value = [];
  searchGameText.value = "";
};

const clearSelectedGame = () => {
  selectedGame.value = null;
  form.value.name = "";
  form.value.background_image = null;
  form.value.rawgId = null;
};

const clearReleaseDate = () => {
  form.value.releaseDate = "";
  pickerDate.value = null;
};

const onDatePicked = (value: Date | string | null) => {
  if (!value) {
    clearReleaseDate();
    return;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  form.value.releaseDate = `${y}-${m}-${d}`;
  pickerDate.value = date;
};

const fetchUpcomingGames = async () => {
  try {
    isLoading.value = true;
    const snap = await getDocs(collection($firestore, COLLECTION));
    upcomingGames.value = sortByReleaseDate(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          firestoreId: d.id,
          name: data.name as string,
          releaseDate: data.releaseDate as string,
          background_image: data.background_image ?? null,
          rawgId: data.rawgId ?? null,
        };
      })
    );
  } catch (error) {
    console.error("Radarımdaki oyunlar yüklenemedi:", error);
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  form.value = { name: "", releaseDate: "", background_image: null, rawgId: null };
  selectedGame.value = null;
  searchGameText.value = "";
  searchResults.value = [];
  pickerDate.value = null;
  dateMenuOpen.value = false;
  isEditing.value = false;
  editingId.value = null;
  gameForm.value?.resetValidation();
};

const openAddDialog = () => {
  resetForm();
  isFormDialogOpen.value = true;
};

const closeFormDialog = () => {
  isFormDialogOpen.value = false;
};

const onFormDialogClosed = () => {
  resetForm();
};

const buildPayload = () => ({
  name: form.value.name.trim(),
  releaseDate: form.value.releaseDate,
  background_image: form.value.background_image || null,
  rawgId: form.value.rawgId,
  updatedAt: serverTimestamp(),
});

const handleSubmit = async () => {
  const { valid } = (await gameForm.value?.validate()) ?? { valid: false };
  if (!valid || !canSubmit.value) return;

  try {
    isSaving.value = true;
    const payload = buildPayload();

    if (isEditing.value && editingId.value) {
      await updateDoc(doc($firestore, COLLECTION, editingId.value), payload);
      showToast(`${payload.name} güncellendi`);
    } else {
      await addDoc(collection($firestore, COLLECTION), {
        ...payload,
        createdAt: serverTimestamp(),
      });
      showToast(`${payload.name} eklendi`);
    }

    resetForm();
    isFormDialogOpen.value = false;
    await fetchUpcomingGames();
  } catch (error) {
    console.error("Kayıt hatası:", error);
  } finally {
    isSaving.value = false;
  }
};

const startEdit = (game: UpcomingGame) => {
  isEditing.value = true;
  editingId.value = game.firestoreId;
  form.value = {
    name: game.name,
    releaseDate: game.releaseDate,
    background_image: game.background_image ?? null,
    rawgId: game.rawgId ?? null,
  };
  if (game.rawgId) {
    selectedGame.value = {
      id: game.rawgId,
      name: game.name,
      background_image: game.background_image,
      rawgId: game.rawgId,
    };
  } else {
    selectedGame.value = null;
  }
  syncPickerFromForm();
  searchGameText.value = "";
  searchResults.value = [];
  isFormDialogOpen.value = true;
};

const openDeleteDialog = (game: UpcomingGame) => {
  gameToDelete.value = game;
  isDeleteDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!gameToDelete.value) return;

  try {
    isDeleting.value = true;
    await deleteDoc(doc($firestore, COLLECTION, gameToDelete.value.firestoreId));
    showToast(`${gameToDelete.value.name} silindi`);
    if (editingId.value === gameToDelete.value.firestoreId) resetForm();
    isDeleteDialogOpen.value = false;
    gameToDelete.value = null;
    await fetchUpcomingGames();
  } catch (error) {
    console.error("Silme hatası:", error);
  } finally {
    isDeleting.value = false;
  }
};

onMounted(fetchUpcomingGames);
</script>

<style scoped>
@import "~/assets/css/admin.css";
@import "~/assets/css/admin_collection_page.css";

.upcoming-form-dialog {
  max-height: min(85vh, 720px);
  overflow-y: auto;
}
</style>
