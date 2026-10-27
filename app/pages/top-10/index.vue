<template>
  <div class="top9-studio">
    <header class="top9-studio__intro">
      <p class="top9-studio__eyebrow">Top 9</p>
      <h1 class="top9-studio__title">Kendi 9'unu oluştur</h1>
      <p class="top9-studio__lead">
        Bir kareye dokunup oyun seç veya değiştir. Hazır olunca kaydet, görsel üret
        veya paylaş.
      </p>
    </header>

    <div class="top9-studio__board-wrap">
      <p class="top9-studio__hint">Bir kareye dokunarak oyun seç ↓</p>

      <div ref="boardExportRef" class="top9-board" role="list">
        <button
          v-for="slot in slotRows"
          :key="slot.rank"
          type="button"
          class="top9-cell"
          :class="{
            'top9-cell--filled': !!slot.game,
            'top9-cell--empty': !slot.game,
          }"
          role="listitem"
          :aria-label="
            slot.game
              ? `${slot.rank}. ${slot.game.name}`
              : `${slot.rank}. boş kare — oyun seç`
          "
          @click="openPicker(slot.rank)"
        >
          <template v-if="slot.game">
            <img
              v-if="slotCover(slot.game)"
              :src="slotCover(slot.game)"
              :alt="slot.game.name"
              class="top9-cell__cover"
              loading="lazy"
              referrerpolicy="no-referrer"
            />
            <div v-else class="top9-cell__cover top9-cell__cover--fallback">
              <v-icon icon="mdi-gamepad-variant-outline" size="28" />
            </div>
            <span class="top9-cell__shade" aria-hidden="true" />
            <span class="top9-cell__rank">{{ slot.rank }}</span>
            <span class="top9-cell__name">
              <span class="top9-cell__name-text">{{ slot.game.name }}</span>
            </span>
            <span
              class="top9-cell__clear"
              title="Kaldır"
              @click.stop="removeGame(slot.rank - 1)"
            >
              <v-icon icon="mdi-close" size="16" />
            </span>
          </template>
          <template v-else>
            <span class="top9-cell__plus">+</span>
            <span class="top9-cell__no">No. {{ slot.rank }}</span>
          </template>
        </button>
      </div>
    </div>

    <div class="top9-studio__tools">
      <section class="top9-tool top9-tool--wide">
        <h2 class="top9-tool__title">Liste</h2>
        <v-text-field
          v-model="listTitle"
          rounded="lg"
          variant="outlined"
          label="Liste başlığı"
          prepend-inner-icon="mdi-format-title"
          color="success"
          class="top9-search"
          hide-details
          density="comfortable"
          placeholder="Örn. Benim Top 9"
        />

        <div class="top9-actions">
          <button
            type="button"
            class="top9-btn top9-btn--primary"
            :disabled="!canSave"
            @click="handleSave"
          >
            <v-icon
              :icon="isSaving ? 'mdi-loading' : 'mdi-content-save'"
              size="18"
              :class="{ 'top9-spin': isSaving }"
            />
            Kaydet
          </button>
          <button
            type="button"
            class="top9-btn top9-btn--gold"
            :disabled="!filledCount || isExporting"
            @click="exportImage"
          >
            <v-icon
              :icon="isExporting ? 'mdi-loading' : 'mdi-image-outline'"
              size="18"
              :class="{ 'top9-spin': isExporting }"
            />
            Görsel üret
          </button>
          <button
            type="button"
            class="top9-btn top9-btn--forest"
            :disabled="!savedSlug || !canShare"
            @click="copyShareLink"
          >
            <v-icon icon="mdi-share-variant" size="18" />
            Paylaş
          </button>
          <button
            type="button"
            class="top9-btn top9-btn--ghost"
            :disabled="!filledCount"
            @click="clearList"
          >
            <v-icon icon="mdi-broom" size="18" />
            Listeyi temizle
          </button>
        </div>

        <p
          v-if="saveMessage"
          class="top9-status"
          :class="saveMessageOk ? 'top9-status--ok' : 'top9-status--warn'"
        >
          {{ saveMessage }}
        </p>
        <p v-else-if="!canShare" class="top9-status top9-status--warn">
          Paylaşım için {{ TOP10_MAX_GAMES }} oyun seç
          ({{ filledCount }}/{{ TOP10_MAX_GAMES }}).
        </p>

        <div class="top9-modes">
          <p class="top9-modes__label">Paylaşım görünümü</p>
          <div class="top9-modes__row">
            <button
              v-for="mode in displayModes"
              :key="mode.id"
              type="button"
              class="top9-mode"
              :class="{ 'top9-mode--on': displayMode === mode.id }"
              @click="displayMode = mode.id"
            >
              {{ mode.label }}
            </button>
          </div>
        </div>
      </section>
    </div>

    <section class="top9-preview">
      <h2 class="top9-tool__title">Önizleme</h2>
      <div class="top9-preview__frame">
        <Top10_Share_Card
          ref="shareCardRef"
          :title="previewTitle"
          :username="displayUsername"
          :games="previewGames"
          :display-mode="displayMode"
          :show-empty-slots="filledCount < TOP10_MAX_GAMES"
        />
      </div>
    </section>

    <!-- Oyun seç / değiştir popup -->
    <div
      v-if="pickerOpen"
      class="top9-modal"
      role="dialog"
      aria-modal="true"
      :aria-label="pickerTitle"
      @click.self="closePicker"
    >
      <div class="top9-modal__panel">
        <header class="top9-modal__head">
          <div>
            <p class="top9-modal__eyebrow">Kare {{ activeSlot }}</p>
            <h2 class="top9-modal__title">{{ pickerTitle }}</h2>
          </div>
          <button
            type="button"
            class="top9-modal__close"
            aria-label="Kapat"
            @click="closePicker"
          >
            <v-icon icon="mdi-close" size="20" />
          </button>
        </header>

        <v-text-field
          v-model="searchQuery"
          rounded="lg"
          variant="outlined"
          label="Oyun adı yaz…"
          prepend-inner-icon="mdi-magnify"
          color="success"
          class="top9-search"
          hide-details
          clearable
          autofocus
          :loading="isSearching"
          density="comfortable"
        />

        <div v-if="activeFilled" class="top9-modal__current">
          <img
            v-if="slotCover(activeFilled)"
            :src="slotCover(activeFilled)!"
            alt=""
            class="top9-modal__current-thumb"
          />
          <div>
            <strong>{{ activeFilled.name }}</strong>
            <small>Şu an bu karede</small>
          </div>
          <button type="button" class="top9-btn top9-btn--ghost" @click="clearActiveSlot">
            Kaldır
          </button>
        </div>

        <div v-if="isSearching" class="top9-search-state">
          <v-progress-circular indeterminate color="success" size="26" width="2" />
        </div>
        <p
          v-else-if="searchQuery.length >= 2 && !searchResults.length"
          class="top9-search-hint"
        >
          Sonuç bulunamadı.
        </p>
        <div v-else-if="searchResults.length" class="top9-search-results top9-search-results--modal">
          <button
            v-for="game in searchResults"
            :key="game.id"
            type="button"
            class="top9-pick"
            :disabled="
              isGameInList(game.id) && activeFilled?.id !== game.id
            "
            @click="pickGame(game)"
          >
            <img
              v-if="proxiedCover(resolveTop10Cover(game) || game.background_image)"
              :src="proxiedCover(resolveTop10Cover(game) || game.background_image)!"
              :alt="game.name"
              class="top9-pick__thumb"
              loading="lazy"
            />
            <span v-else class="top9-pick__thumb top9-pick__thumb--empty">
              <v-icon icon="mdi-gamepad-variant-outline" size="18" />
            </span>
            <span class="top9-pick__meta">
              <strong>{{ game.name }}</strong>
              <small>{{ game.released?.slice(0, 4) || "—" }}</small>
            </span>
            <v-icon
              :icon="activeFilled?.id === game.id ? 'mdi-check' : 'mdi-plus'"
              size="20"
            />
          </button>
        </div>
        <p v-else class="top9-search-hint">En az 2 karakter yazarak ara.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import { toPng } from "html-to-image";
import Top10_Share_Card from "~/components/top10/Top10_Share_Card.vue";
import {
  resolveTop10Cover,
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

definePageMeta({
  layout: "panel",
  ssr: false,
  middleware: "auth",
});

useHead({
  title: "Kendi 9'unu oluştur | npmrungame",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const { $firestore } = useNuxtApp();
const _store = store();

const searchQuery = ref("");
const searchResults = ref<any[]>([]);
const isSearching = ref(false);
const selectedGames = ref<Top10GameEntry[]>([]);
const listTitle = ref("");
const displayMode = ref<Top10DisplayMode>("wallpaper");
const savedSlug = ref<string | null>(null);
const isSaving = ref(false);
const isExporting = ref(false);
const saveMessage = ref("");
const saveMessageOk = ref(true);
const activeSlot = ref<number | null>(null);
const pickerOpen = ref(false);
const boardExportRef = ref<HTMLElement | null>(null);
const shareCardRef = ref<{ cardRef?: HTMLElement | null } | null>(null);

let searchTimer: ReturnType<typeof setTimeout> | null = null;

const displayModes: { id: Top10DisplayMode; label: string }[] = [
  { id: "wallpaper", label: "Ekran" },
  { id: "grid", label: "Kart" },
  { id: "list", label: "Liste" },
];

const currentUser = computed(() => _store.user);

const displayUsername = computed(
  () =>
    currentUser.value?.username ||
    currentUser.value?.displayName ||
    currentUser.value?.email?.split("@")[0] ||
    "Oyuncu"
);

const previewTitle = computed(
  () => listTitle.value.trim() || `${displayUsername.value} · Top 9`
);

const filledCount = computed(() =>
  Math.min(selectedGames.value.length, TOP10_MAX_GAMES)
);

const previewGames = computed(() =>
  selectedGames.value
    .slice(0, TOP10_MAX_GAMES)
    .map((g, i) => ({ ...g, rank: i + 1 }))
);

const canShare = computed(() => filledCount.value >= TOP10_MIN_SHARE);
const canSave = computed(
  () => !!currentUser.value && filledCount.value > 0 && !isSaving.value
);

const slotRows = computed(() =>
  Array.from({ length: TOP10_MAX_GAMES }, (_, i) => ({
    rank: i + 1,
    game: selectedGames.value[i] ?? null,
  }))
);

const activeFilled = computed(() => {
  if (!activeSlot.value) return null;
  return selectedGames.value[activeSlot.value - 1] ?? null;
});

const pickerTitle = computed(() =>
  activeFilled.value ? "Oyunu değiştir" : "Oyun ekle"
);

/** Görüntüleme + export: RAWG CORS için same-origin proxy */
function proxiedCover(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("/") || url.startsWith("data:")) return url;
  try {
    const host = new URL(url).hostname;
    if (
      host === "media.rawg.io" ||
      host === "images.igdb.com" ||
      host === "img.igdb.com"
    ) {
      return `/api/img-proxy?url=${encodeURIComponent(url)}`;
    }
  } catch {
    /* ignore */
  }
  return url;
}

function slotCover(game: Top10GameEntry | null | undefined) {
  return proxiedCover(resolveTop10Cover(game));
}

function normalizeTitle(title: string) {
  const t = title.trim();
  if (!t) return "";
  return t
    .replace(/my\s*top\s*10/gi, "My Top 9")
    .replace(/top\s*10/gi, "Top 9");
}

function capGames(games: Top10GameEntry[]) {
  return [...games]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, TOP10_MAX_GAMES)
    .map((g, i) => ({ ...g, rank: i + 1 }));
}

const isGameInList = (id: number) =>
  selectedGames.value.some((g) => g.id === id);

function openPicker(rank: number) {
  activeSlot.value = rank;
  searchQuery.value = "";
  searchResults.value = [];
  pickerOpen.value = true;
}

function closePicker() {
  pickerOpen.value = false;
  activeSlot.value = null;
  searchQuery.value = "";
  searchResults.value = [];
}

function pickGame(game: any) {
  const rank = activeSlot.value;
  if (!rank) return;
  if (isGameInList(game.id) && activeFilled.value?.id !== game.id) return;

  const entry = snapshotTop10Game(game, rank);
  const next = [...selectedGames.value];

  if (next[rank - 1]) {
    next[rank - 1] = { ...entry, rank };
  } else if (next.length >= TOP10_MAX_GAMES) {
    return;
  } else {
    next.push(snapshotTop10Game(game, next.length + 1));
  }

  selectedGames.value = capGames(next);
  closePicker();
}

function removeGame(index: number) {
  selectedGames.value.splice(index, 1);
  selectedGames.value = capGames(selectedGames.value);
  if (activeSlot.value === index + 1) closePicker();
}

function clearActiveSlot() {
  if (!activeSlot.value) return;
  removeGame(activeSlot.value - 1);
}

function clearList() {
  if (!filledCount.value) return;
  if (!confirm("Tüm Top 9 listesi temizlensin mi?")) return;
  selectedGames.value = [];
  saveMessageOk.value = true;
  saveMessage.value = "Liste temizlendi. Kaydetmeyi unutma.";
}

const loadExistingList = async () => {
  if (!currentUser.value?.uid) return;
  try {
    const existing = await fetchUserTop10List(
      $firestore,
      currentUser.value.uid
    );
    if (!existing) return;
    selectedGames.value = capGames(existing.games);
    listTitle.value = normalizeTitle(existing.title || "");
    savedSlug.value = existing.slug;
    displayMode.value = existing.displayMode ?? "wallpaper";
  } catch (e) {
    console.error("Top10 load:", e);
  }
};

const handleSave = async () => {
  if (!currentUser.value?.uid || !filledCount.value) return;

  try {
    isSaving.value = true;
    saveMessage.value = "";
    selectedGames.value = capGames(selectedGames.value);

    const saved = await saveUserTop10List($firestore, currentUser.value.uid, {
      username: displayUsername.value,
      title: normalizeTitle(listTitle.value) || previewTitle.value,
      games: selectedGames.value,
      displayMode: displayMode.value,
      isPublic: canShare.value,
      existingSlug: savedSlug.value,
    });

    savedSlug.value = saved.slug;
    listTitle.value = normalizeTitle(listTitle.value) || listTitle.value;
    saveMessageOk.value = true;
    saveMessage.value = canShare.value
      ? "Liste kaydedildi! Paylaşım linkini kopyalayabilirsin."
      : `Taslak kaydedildi. ${TOP10_MAX_GAMES} oyun tamamlayınca paylaşım açılır.`;
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

let cachedFontEmbedCSS: string | null = null;

async function loadFontEmbedCSS() {
  if (cachedFontEmbedCSS != null) return cachedFontEmbedCSS;
  try {
    const res = await fetch("/api/font-embed-css");
    cachedFontEmbedCSS = res.ok ? await res.text() : "";
  } catch {
    cachedFontEmbedCSS = "";
  }
  return cachedFontEmbedCSS;
}

async function exportImage() {
  const target =
    (shareCardRef.value as any)?.$el?.querySelector?.(".top10-share-card") ||
    (shareCardRef.value as any)?.cardRef ||
    boardExportRef.value;

  if (!target || !(target instanceof HTMLElement)) {
    saveMessageOk.value = false;
    saveMessage.value = "Önizleme alanı bulunamadı.";
    return;
  }

  try {
    isExporting.value = true;
    saveMessage.value = "";
    // Google Fonts link stylesheet cssRules CORS → SecurityError.
    // Sunucudan gömülü CSS al; document.styleSheets okunmaz.
    const fontEmbedCSS = await loadFontEmbedCSS();
    const dataUrl = await toPng(target, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#0f1a14",
      fontEmbedCSS,
      skipFonts: false,
    });
    const link = document.createElement("a");
    link.download = `npmrungame-top9-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    saveMessageOk.value = true;
    saveMessage.value = "Görsel indirildi.";
  } catch (e) {
    console.error("Top9 export:", e);
    saveMessageOk.value = false;
    saveMessage.value =
      "Görsel üretilemedi. Kapak görselleri engellenmiş olabilir — tekrar dene.";
  } finally {
    isExporting.value = false;
  }
}

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

onMounted(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape" && pickerOpen.value) closePicker();
  };
  window.addEventListener("keydown", onKey);
  onUnmounted(() => window.removeEventListener("keydown", onKey));
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/top10.css";
@import "~/assets/css/top9-studio.css";
</style>
