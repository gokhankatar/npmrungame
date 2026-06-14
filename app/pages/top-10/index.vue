<template>
  <div class="top10-page">
    <div class="top10-page-glow top10-page-glow--left" aria-hidden="true" />
    <div class="top10-page-glow top10-page-glow--right" aria-hidden="true" />

    <v-responsive :height="smallScreen ? 70 : 100" />

    <v-container class="top10-container pa-3 pa-md-6 pa-lg-10">
      <header class="top10-hero">
        <div class="top10-hero-top">
          <div class="top10-hero-copy">
            <div class="top10-hero-badge default-title-letter">
              <v-icon icon="mdi-numeric-10-box-multiple-outline" size="16" color="#69f0ae" />
              Top 10
            </div>
            <h1 class="top10-hero-title default-title-letter">En sevdiğin 10 oyunu seç</h1>
            <p class="top10-hero-sub default-title-letter">
              Listeni oluştur, görünümünü seç, paylaş — ekran görüntüsü alıp sosyal medyada yayınla.
            </p>
          </div>

          <div class="top10-hero-progress" aria-label="Liste ilerlemesi">
            <v-progress-circular
              :model-value="progressPercent"
              :size="smallScreen ? 72 : 88"
              :width="5"
              color="#69f0ae"
              bg-color="rgba(255,255,255,0.08)"
            >
              <span class="top10-hero-progress__value">{{ selectedGames.length }}/{{ TOP10_MAX_GAMES }}</span>
            </v-progress-circular>
            <p class="top10-hero-progress__label default-title-letter">oyun seçildi</p>
          </div>
        </div>
      </header>

      <v-alert
        v-if="!currentUser"
        type="info"
        variant="tonal"
        color="green-accent-2"
        class="top10-auth-alert mb-4 default-title-letter"
        icon="mdi-account-lock-outline"
      >
        Listeni kaydetmek için giriş yapman gerekiyor.
        <template #append>
          <v-btn
            size="small"
            color="green-accent-2"
            variant="flat"
            class="text-black text-capitalize"
            text="Giriş yap"
            :ripple="false"
            @click="isAuthOpen = true"
          />
        </template>
      </v-alert>

      <div class="top10-layout">
        <!-- Sol: arama + slotlar -->
        <div class="top10-panel top10-panel--editor">
          <section class="top10-editor-block">
            <div class="top10-panel__head">
              <h2 class="top10-panel__title default-title-letter">
                <span class="top10-panel__icon-ring">
                  <v-icon icon="mdi-magnify" size="18" color="#69f0ae" />
                </span>
                Oyun ara
              </h2>
            </div>

            <v-text-field
              v-model="searchQuery"
              rounded="xl"
              variant="outlined"
              label="Oyun adı yaz..."
              prepend-inner-icon="mdi-gamepad-variant-outline"
              color="green-accent-2"
              class="top10-search-field default-title-letter"
              hide-details
              clearable
              :loading="isSearching"
              :density="smallScreen ? 'compact' : 'comfortable'"
            />

            <div v-if="isSearching" class="top10-search-state">
              <v-progress-circular indeterminate color="green-accent-2" size="28" width="2" />
            </div>

            <p
              v-else-if="searchQuery.length >= 2 && !searchResults.length"
              class="top10-search-hint default-title-letter"
            >
              Sonuç bulunamadı.
            </p>

            <div v-else-if="searchResults.length" class="top10-search-results">
              <button
                v-for="game in searchResults"
                :key="game.id"
                type="button"
                class="top10-search-pick"
                :class="{ 'top10-search-pick--disabled': isGameInList(game.id) || isListFull }"
                @click="addGame(game)"
              >
                <div class="top10-search-pick__thumb">
                  <v-img
                    v-if="game.background_image"
                    :src="game.background_image"
                    cover
                    position="center center"
                    class="top10-search-pick__img"
                  />
                  <v-icon v-else icon="mdi-gamepad-variant-outline" color="grey" />
                </div>
                <div class="top10-search-pick__info text-left">
                  <p class="top10-search-pick__name default-title-letter">{{ game.name }}</p>
                  <p class="top10-search-pick__meta default-title-letter">
                    {{ game.released?.slice(0, 4) || "—" }}
                    <span v-if="game.metacritic" class="top10-search-pick__mc">
                      Metacritic puanı {{ game.metacritic }}
                    </span>
                  </p>
                </div>
                <v-icon
                  :icon="isGameInList(game.id) ? 'mdi-check-circle' : 'mdi-plus-circle'"
                  :color="isGameInList(game.id) ? '#69f0ae' : 'grey-lighten-1'"
                  size="24"
                />
              </button>
            </div>

            <p v-else class="top10-search-hint default-title-letter">
              En az 2 karakter yaz — RAWG üzerinden ara.
            </p>
          </section>

          <v-divider class="top10-divider my-4" />

          <section class="top10-editor-block">
            <div class="top10-panel__head">
              <h2 class="top10-panel__title default-title-letter">
                <span class="top10-panel__icon-ring">
                  <v-icon icon="mdi-format-list-numbered" size="18" color="#69f0ae" />
                </span>
                Sıralaman
              </h2>
              <v-chip size="x-small" variant="tonal" color="green-accent-2" class="default-title-letter">
                {{ selectedGames.length }}/{{ TOP10_MAX_GAMES }}
              </v-chip>
            </div>

            <div class="top10-slots">
              <div
                v-for="slot in slotRows"
                :key="slot.rank"
                class="top10-slot"
                :class="{
                  'top10-slot--filled': !!slot.game,
                  [`top10-slot--rank${slot.rank}`]: !!slot.game && slot.rank <= 3,
                }"
              >
                <span class="top10-slot__rank">{{ slot.rank }}</span>

                <div
                  class="top10-slot__thumb"
                  :class="{ 'top10-slot__thumb--empty': !slot.game }"
                >
                  <v-img
                    v-if="slot.game?.background_image"
                    :src="slot.game.background_image"
                    cover
                    position="center center"
                    class="top10-slot__img"
                  />
                  <v-icon v-else icon="mdi-plus" size="18" color="rgba(255,255,255,0.2)" />
                </div>

                <div class="top10-slot__body">
                  <p
                    class="top10-slot__name default-title-letter"
                    :class="{ 'top10-slot__name--empty': !slot.game }"
                  >
                    {{ slot.game?.name || "Oyun seç" }}
                  </p>
                  <p v-if="slot.game?.released" class="top10-slot__meta default-title-letter">
                    {{ slot.game.released.slice(0, 4) }}
                  </p>
                </div>

                <div v-if="slot.game" class="top10-slot__actions">
                  <v-btn
                    icon="mdi-chevron-up"
                    variant="text"
                    size="x-small"
                    color="grey-lighten-1"
                    :disabled="slot.rank === 1"
                    :ripple="false"
                    @click="moveGame(slot.rank - 1, -1)"
                  />
                  <v-btn
                    icon="mdi-chevron-down"
                    variant="text"
                    size="x-small"
                    color="grey-lighten-1"
                    :disabled="slot.rank === selectedGames.length"
                    :ripple="false"
                    @click="moveGame(slot.rank - 1, 1)"
                  />
                  <v-btn
                    icon="mdi-close"
                    variant="text"
                    size="x-small"
                    color="error"
                    :ripple="false"
                    @click="removeGame(slot.rank - 1)"
                  />
                </div>
              </div>
            </div>
          </section>

          <v-divider class="top10-divider my-4" />

          <section class="top10-editor-block">
            <v-text-field
              v-model="listTitle"
              rounded="xl"
              variant="outlined"
              label="Liste başlığı"
              prepend-inner-icon="mdi-format-title"
              color="green-accent-2"
              class="default-title-letter"
              hide-details
              :density="smallScreen ? 'compact' : 'comfortable'"
            />

            <div class="top10-actions-bar">
              <v-btn
                color="green-accent-2"
                variant="flat"
                rounded="pill"
                class="text-black text-capitalize default-title-letter"
                prepend-icon="mdi-content-save"
                :loading="isSaving"
                :disabled="!canSave"
                text="Kaydet"
                :ripple="false"
                @click="handleSave"
              />
              <v-btn
                v-if="savedSlug"
                variant="tonal"
                color="green-accent-2"
                rounded="pill"
                class="text-capitalize default-title-letter"
                prepend-icon="mdi-link-variant"
                text="Linki kopyala"
                :ripple="false"
                @click="copyShareLink"
              />
              <v-btn
                v-if="savedSlug && canShare"
                variant="outlined"
                color="grey-lighten-1"
                rounded="pill"
                class="text-capitalize default-title-letter"
                prepend-icon="mdi-open-in-new"
                text="Paylaş"
                :ripple="false"
                :to="`/top-10/${savedSlug}`"
              />
            </div>

            <p
              v-if="saveMessage"
              class="top10-status default-title-letter"
              :class="saveMessageOk ? 'top10-status--ok' : 'top10-status--warn'"
            >
              {{ saveMessage }}
            </p>
            <p
              v-else-if="!canShare"
              class="top10-status top10-status--warn default-title-letter"
            >
              Paylaşım için {{ TOP10_MAX_GAMES }} oyun seç ({{ selectedGames.length }}/{{ TOP10_MAX_GAMES }}).
            </p>
          </section>
        </div>

        <!-- Sağ: önizleme -->
        <div class="top10-panel top10-panel--preview top10-preview-panel">
          <div class="top10-panel__head top10-panel__head--preview">
            <h2 class="top10-panel__title default-title-letter">
              <span class="top10-panel__icon-ring">
                <v-icon icon="mdi-share-variant" size="18" color="#69f0ae" />
              </span>
              Paylaşım önizlemesi
            </h2>
          </div>

          <div class="top10-view-picker">
            <p class="top10-view-picker__label default-title-letter">Görünüm tercihi</p>
            <div class="top10-view-picker__options">
              <button
                type="button"
                class="top10-view-option"
                :class="{ 'top10-view-option--active': displayMode === 'grid' }"
                @click="displayMode = 'grid'"
              >
                <v-icon icon="mdi-view-grid" size="22" :color="displayMode === 'grid' ? '#69f0ae' : 'grey'" />
                <span class="top10-view-option__title default-title-letter">Kart</span>
                <span class="top10-view-option__sub default-title-letter">Poster grid — Instagram</span>
                <div class="top10-view-option__mini top10-view-option__mini--grid" aria-hidden="true">
                  <span v-for="n in 6" :key="n" />
                </div>
              </button>

              <button
                type="button"
                class="top10-view-option"
                :class="{ 'top10-view-option--active': displayMode === 'list' }"
                @click="displayMode = 'list'"
              >
                <v-icon icon="mdi-format-list-bulleted" size="22" :color="displayMode === 'list' ? '#69f0ae' : 'grey'" />
                <span class="top10-view-option__title default-title-letter">Liste</span>
                <span class="top10-view-option__sub default-title-letter">Sıralı liste — Twitter / story</span>
                <div class="top10-view-option__mini top10-view-option__mini--list" aria-hidden="true">
                  <span v-for="n in 4" :key="n" />
                </div>
              </button>
            </div>
          </div>

          <div class="top10-preview-frame">
            <Top10_Share_Card
              :title="previewTitle"
              :username="displayUsername"
              :games="previewGames"
              :display-mode="displayMode"
              :show-empty-slots="selectedGames.length < TOP10_MAX_GAMES"
            />
          </div>

          <p class="top10-preview-tip default-title-letter">
            <v-icon icon="mdi-camera-outline" size="14" class="mr-1" />
            Ekran görüntüsü alıp paylaşabilirsin — veya kaydettikten sonra link gönder.
          </p>
        </div>
      </div>
    </v-container>

    <Auth_Dialog v-model="isAuthOpen" @success="onAuthSuccess" />
  </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import Auth_Dialog from "~/components/common/Auth_Dialog.vue";
import Top10_Share_Card from "~/components/top10/Top10_Share_Card.vue";
import {
  snapshotTop10Game,
  TOP10_MAX_GAMES,
  TOP10_MIN_SHARE,
  type Top10DisplayMode,
  type Top10GameEntry,
} from "~/composables/core/top10";
import {
  fetchUserTop10List,
  getTop10ShareUrl,
  saveUserTop10List,
} from "~/composables/useTop10";
import store from "~/store/store";

useHead({
  title: "npmrungame | Top 10 Listeni Oluştur",
});

const { $firestore } = useNuxtApp();
const _store = store();
const display = useDisplay();

const smallScreen = computed(() => display.smAndDown.value);
const currentUser = computed(() => _store.user);

const searchQuery = ref("");
const searchResults = ref<any[]>([]);
const isSearching = ref(false);
const selectedGames = ref<Top10GameEntry[]>([]);
const listTitle = ref("");
const displayMode = ref<Top10DisplayMode>("grid");
const savedSlug = ref<string | null>(null);
const isSaving = ref(false);
const isAuthOpen = ref(false);
const saveMessage = ref("");
const saveMessageOk = ref(true);

let searchTimer: ReturnType<typeof setTimeout> | null = null;

const displayUsername = computed(
  () =>
    currentUser.value?.username ||
    currentUser.value?.displayName ||
    currentUser.value?.email?.split("@")[0] ||
    "Oyuncu"
);

const previewTitle = computed(
  () => listTitle.value.trim() || `${displayUsername.value} · Top 10`
);

const previewGames = computed(() =>
  selectedGames.value.map((g, i) => ({ ...g, rank: i + 1 }))
);

const progressPercent = computed(() =>
  Math.round((selectedGames.value.length / TOP10_MAX_GAMES) * 100)
);

const isListFull = computed(() => selectedGames.value.length >= TOP10_MAX_GAMES);
const canShare = computed(() => selectedGames.value.length >= TOP10_MIN_SHARE);
const canSave = computed(() => currentUser.value && selectedGames.value.length > 0 && !isSaving.value);

const slotRows = computed(() =>
  Array.from({ length: TOP10_MAX_GAMES }, (_, i) => ({
    rank: i + 1,
    game: selectedGames.value[i] ?? null,
  }))
);

const isGameInList = (id: number) => selectedGames.value.some((g) => g.id === id);

const addGame = (game: any) => {
  if (isGameInList(game.id) || isListFull.value) return;
  selectedGames.value.push(snapshotTop10Game(game, selectedGames.value.length + 1));
};

const removeGame = (index: number) => {
  selectedGames.value.splice(index, 1);
  selectedGames.value = selectedGames.value.map((g, i) => ({ ...g, rank: i + 1 }));
};

const moveGame = (index: number, direction: -1 | 1) => {
  const next = index + direction;
  if (next < 0 || next >= selectedGames.value.length) return;
  const arr = [...selectedGames.value];
  [arr[index], arr[next]] = [arr[next], arr[index]];
  selectedGames.value = arr.map((g, i) => ({ ...g, rank: i + 1 }));
};

const loadExistingList = async () => {
  if (!currentUser.value?.uid) return;
  try {
    const existing = await fetchUserTop10List($firestore, currentUser.value.uid);
    if (!existing) return;
    selectedGames.value = [...existing.games].sort((a, b) => a.rank - b.rank);
    listTitle.value = existing.title;
    savedSlug.value = existing.slug;
    displayMode.value = existing.displayMode ?? "grid";
  } catch (e) {
    console.error("Top10 load:", e);
  }
};

const handleSave = async () => {
  if (!currentUser.value?.uid) {
    isAuthOpen.value = true;
    return;
  }
  if (!selectedGames.value.length) return;

  try {
    isSaving.value = true;
    saveMessage.value = "";

    const saved = await saveUserTop10List($firestore, currentUser.value.uid, {
      username: displayUsername.value,
      title: listTitle.value,
      games: selectedGames.value,
      displayMode: displayMode.value,
      isPublic: canShare.value,
      existingSlug: savedSlug.value,
    });

    savedSlug.value = saved.slug;
    saveMessageOk.value = true;
    saveMessage.value = canShare.value
      ? "Liste kaydedildi! Paylaşım linkini kopyalayabilirsin."
      : "Taslak kaydedildi. 10 oyun tamamlayınca paylaşım açılır.";
  } catch (e) {
    console.error("Top10 save:", e);
    saveMessageOk.value = false;
    saveMessage.value = "Kayıt sırasında bir hata oluştu.";
  } finally {
    isSaving.value = false;
  }
};

const copyShareLink = async () => {
  if (!savedSlug.value) return;
  const url = getTop10ShareUrl(savedSlug.value);
  try {
    await navigator.clipboard.writeText(url);
    saveMessageOk.value = true;
    saveMessage.value = "Link panoya kopyalandı!";
  } catch {
    saveMessageOk.value = false;
    saveMessage.value = url;
  }
};

const onAuthSuccess = () => {
  loadExistingList();
};

watch(searchQuery, (val) => {
  if (searchTimer) clearTimeout(searchTimer);
  if (!val || val.length < 2) {
    searchResults.value = [];
    return;
  }
  searchTimer = setTimeout(async () => {
    try {
      isSearching.value = true;
      const { data } = await axios.get("/api/search-games", {
        params: { search: val, page: 1 },
      });
      searchResults.value = data?.results ?? [];
    } catch (e) {
      console.error("Top10 search:", e);
      searchResults.value = [];
    } finally {
      isSearching.value = false;
    }
  }, 350);
});

watch(
  currentUser,
  (user) => {
    if (user?.uid) loadExistingList();
  },
  { immediate: true }
);
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/top10.css";
</style>
