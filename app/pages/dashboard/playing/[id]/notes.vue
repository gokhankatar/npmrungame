<script setup lang="ts">
import { getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  createPlayNoteId,
  extractYoutubeVideoId,
  formatTimestampLabel,
  isValidYoutubeUrl,
  minutesSecondsToTotal,
  normalizeYoutubeUrl,
  parseYoutubeStartSeconds,
  sanitizePlayNotesForFirestore,
  youtubeThumbnailUrl,
  type PlayNoteItem,
} from "~/composables/core/playNotes";
import { resolveGameCardImage } from "~/composables/data/handleData";
import { gameDoc } from "~/utils/channelOwnerGames";
import store from "~/store/store";

definePageMeta({
  layout: "panel",
  ssr: false,
  middleware: "auth",
});

const route = useRoute();
const { $firestore } = useNuxtApp();
const _store = store();
const display = useDisplay();

const gameId = computed(() => String(route.params.id || ""));

const isLoading = ref(true);
const isSaving = ref(false);
const notFound = ref(false);
const game = ref<any | null>(null);

const localNotes = ref<PlayNoteItem[]>([]);
const addDialog = ref(false);
const draftText = ref("");
const draftYoutube = ref("");
const draftMinutes = ref<number | null>(null);
const draftSeconds = ref<number | null>(null);
const showTimestamp = ref(false);
const youtubeError = ref(false);
const saveMsg = ref("");
const saveOk = ref(true);

const canAdd = computed(
  () => draftText.value.trim().length > 0 && !youtubeError.value
);

const cover = computed(() => (game.value ? resolveGameCardImage(game.value) : ""));

const draftVideoId = computed(() =>
  draftYoutube.value.trim() ? extractYoutubeVideoId(draftYoutube.value) : null
);

const draftThumb = computed(() =>
  draftVideoId.value ? youtubeThumbnailUrl(draftVideoId.value) : ""
);

const draftStartSeconds = computed(() => {
  if (showTimestamp.value) {
    const m = Number(draftMinutes.value) || 0;
    const s = Number(draftSeconds.value) || 0;
    if (m <= 0 && s <= 0) return 0;
    return minutesSecondsToTotal(m, s);
  }
  return parseYoutubeStartSeconds(draftYoutube.value) ?? 0;
});

useSeoMeta({
  title: computed(() =>
    game.value?.name
      ? `${game.value.name} · Platin Defter | npmrungame`
      : "Platin Defter | npmrungame"
  ),
  robots: "noindex, nofollow",
});

watch(draftYoutube, (val) => {
  youtubeError.value = Boolean(val?.trim()) && !isValidYoutubeUrl(val);
  if (!val?.trim()) {
    showTimestamp.value = false;
    draftMinutes.value = null;
    draftSeconds.value = null;
  }
});

const openTimestamp = () => {
  showTimestamp.value = true;
  const fromLink = parseYoutubeStartSeconds(draftYoutube.value);
  if (fromLink != null && fromLink > 0) {
    draftMinutes.value = Math.floor(fromLink / 60);
    draftSeconds.value = fromLink % 60;
  }
};

const clearTimestamp = () => {
  showTimestamp.value = false;
  draftMinutes.value = null;
  draftSeconds.value = null;
};

const resetDraft = () => {
  draftText.value = "";
  draftYoutube.value = "";
  draftMinutes.value = null;
  draftSeconds.value = null;
  showTimestamp.value = false;
  youtubeError.value = false;
};

const openAddDialog = () => {
  resetDraft();
  addDialog.value = true;
};

const closeAddDialog = () => {
  addDialog.value = false;
  resetDraft();
};

const loadGame = async () => {
  if (!_store.user?.uid || !$firestore || !gameId.value) {
    notFound.value = true;
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    notFound.value = false;
    const snap = await getDoc(
      gameDoc($firestore, _store.user.uid, "current_games", gameId.value)
    );

    if (!snap.exists()) {
      game.value = null;
      notFound.value = true;
      return;
    }

    const data = { firestoreId: snap.id, ...snap.data() };
    game.value = data;
    localNotes.value = Array.isArray(data.playNotes)
      ? data.playNotes.map((n: PlayNoteItem) => ({ ...n }))
      : [];
  } catch (e) {
    console.error("Load play notes page:", e);
    notFound.value = true;
  } finally {
    isLoading.value = false;
  }
};

const saveNotes = async (okMsg = "Firestore’a kaydedildi.") => {
  if (!_store.user?.uid || !$firestore || !game.value?.firestoreId) return false;

  try {
    isSaving.value = true;
    saveMsg.value = "";
    await updateDoc(
      gameDoc(
        $firestore,
        _store.user.uid,
        "current_games",
        game.value.firestoreId
      ),
      {
        playNotes: sanitizePlayNotesForFirestore(localNotes.value),
        playNotesUpdatedAt: serverTimestamp(),
      }
    );
    if (game.value) game.value.playNotes = [...localNotes.value];
    saveOk.value = true;
    saveMsg.value = okMsg;
    return true;
  } catch (e) {
    console.error("Save play notes:", e);
    saveOk.value = false;
    saveMsg.value = "Kayıt sırasında hata oluştu.";
    return false;
  } finally {
    isSaving.value = false;
  }
};

const addNote = async () => {
  const text = draftText.value.trim();
  if (!text) return;
  if (draftYoutube.value.trim() && !isValidYoutubeUrl(draftYoutube.value)) {
    youtubeError.value = true;
    return;
  }

  const videoId = draftVideoId.value;
  const start =
    draftStartSeconds.value > 0 ? draftStartSeconds.value : undefined;
  const youtubeUrl = draftYoutube.value.trim()
    ? normalizeYoutubeUrl(draftYoutube.value, start)
    : "";

  const note: PlayNoteItem = {
    id: createPlayNoteId(),
    text,
    done: false,
    createdAt: new Date().toISOString(),
  };
  if (youtubeUrl) note.youtubeUrl = youtubeUrl;
  if (videoId) {
    note.youtubeVideoId = videoId;
    note.youtubeThumb = youtubeThumbnailUrl(videoId);
  }
  if (start) note.youtubeStartSeconds = start;

  localNotes.value = [note, ...localNotes.value];

  const ok = await saveNotes("Not eklendi ve kaydedildi.");
  if (ok) closeAddDialog();
};

const noteThumb = (note: PlayNoteItem) => {
  if (note.youtubeThumb) return note.youtubeThumb;
  if (note.youtubeVideoId) return youtubeThumbnailUrl(note.youtubeVideoId);
  if (note.youtubeUrl) {
    const id = extractYoutubeVideoId(note.youtubeUrl);
    return id ? youtubeThumbnailUrl(id) : "";
  }
  return "";
};

const noteStart = (note: PlayNoteItem) =>
  note.youtubeStartSeconds ??
  (note.youtubeUrl ? parseYoutubeStartSeconds(note.youtubeUrl) : undefined);

const toggleDone = async (id: string) => {
  localNotes.value = localNotes.value.map((n) =>
    n.id === id ? { ...n, done: !n.done } : n
  );
  await saveNotes("Durum kaydedildi.");
};

const removeNote = async (id: string) => {
  localNotes.value = localNotes.value.filter((n) => n.id !== id);
  await saveNotes("Not silindi.");
};

watch(gameId, loadGame, { immediate: true });
</script>

<template>
  <v-container class="play-notes-page pa-3 pa-md-6" fluid>
    <div class="play-notes-page__inner">
      <div class="play-notes-page__top">
        <v-btn
          variant="text"
          color="grey-lighten-1"
          class="text-capitalize default-title-letter"
          prepend-icon="mdi-arrow-left"
          text="Şu an oynadıklarım"
          :ripple="false"
          to="/dashboard/playing"
        />
      </div>

      <div v-if="isLoading" class="d-flex justify-center py-16">
        <v-progress-circular indeterminate color="light-blue-accent-2" size="42" width="3" />
      </div>

      <div v-else-if="notFound" class="play-notes-page__empty">
        <v-icon icon="mdi-gamepad-off" size="48" color="grey" />
        <h1 class="default-title-letter text-h6 mt-3">Oyun bulunamadı</h1>
        <p class="text-caption text-grey-darken-1 default-title-letter">
          Bu oyun listende yok veya silinmiş olabilir.
        </p>
        <v-btn
          color="light-blue-accent-2"
          variant="flat"
          rounded="pill"
          class="text-black text-capitalize mt-4"
          text="Listeye dön"
          :ripple="false"
          to="/dashboard/playing"
        />
      </div>

      <template v-else-if="game">
        <header class="play-notes-hero">
          <div class="play-notes-hero__media">
            <v-img v-if="cover" :src="cover" cover class="play-notes-hero__cover" />
            <div v-else class="play-notes-hero__cover play-notes-hero__cover--empty">
              <v-icon icon="mdi-gamepad-variant" size="36" color="grey" />
            </div>
          </div>
          <div class="play-notes-hero__copy min-w-0">
            <p class="play-notes-hero__eyebrow default-title-letter mb-1">
              <v-icon icon="mdi-book-open-page-variant-outline" size="14" class="mr-1" />
              Platin Defter
            </p>
            <h1 class="play-notes-hero__title default-title-letter">
              {{ game.name }}
            </h1>
            <p class="play-notes-hero__sub default-title-letter mb-0">
              Platine giden yol: notlar, todo’lar ve YouTube rehberleri.
            </p>
          </div>
          <v-btn
            v-if="localNotes.length"
            color="light-blue-accent-2"
            variant="flat"
            rounded="pill"
            class="text-black text-capitalize default-title-letter play-notes-hero__add"
            prepend-icon="mdi-plus"
            text="Not ekle"
            :ripple="false"
            @click="openAddDialog"
          />
        </header>

        <p
          v-if="saveMsg"
          class="play-notes-save-msg default-title-letter"
          :class="saveOk ? 'play-notes-save-msg--ok' : 'play-notes-save-msg--err'"
        >
          {{ saveMsg }}
        </p>

        <span
          v-if="isSaving"
          class="play-notes-saving default-title-letter mb-2 d-inline-flex"
        >
          <v-progress-circular
            indeterminate
            size="14"
            width="2"
            color="light-blue-accent-2"
            class="mr-1"
          />
          Kaydediliyor…
        </span>

        <!-- Empty: col-12 empty card → Not ekle -->
        <v-row v-if="!localNotes.length" dense>
          <v-col cols="12">
            <button
              type="button"
              class="notes-empty-card default-title-letter"
              @click="openAddDialog"
            >
              <span class="notes-empty-card__icon">
                <v-icon icon="mdi-notebook-plus-outline" size="36" color="#40c4ff" />
              </span>
              <span class="notes-empty-card__title">Defter boş</span>
              <span class="notes-empty-card__sub">
                Quest, boss, sandık… ilk notunu ekle. İstersen YouTube rehberi de bağla.
              </span>
              <span class="notes-empty-card__cta">
                <v-icon icon="mdi-plus" size="18" />
                Not ekle
              </span>
            </button>
          </v-col>
        </v-row>

        <!-- Notes list -->
        <v-row v-else dense>
          <v-col
            v-for="note in localNotes"
            :key="note.id"
            cols="12"
          >
            <article
              class="note-card"
              :class="note.done ? 'note-card--done' : 'note-card--todo'"
            >
              <a
                v-if="noteThumb(note)"
                :href="note.youtubeUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="note-card__cover"
                :title="
                  noteStart(note)
                    ? `${formatTimestampLabel(noteStart(note))}’den aç`
                    : 'Videoyu aç'
                "
              >
                <img :src="noteThumb(note)" alt="" class="note-card__cover-img" />
                <span class="note-card__play">
                  <v-icon icon="mdi-play" size="18" />
                </span>
                <span
                  v-if="noteStart(note)"
                  class="note-card__stamp default-title-letter"
                >
                  {{ formatTimestampLabel(noteStart(note)) }}
                </span>
              </a>
              <div v-else class="note-card__cover note-card__cover--empty">
                <v-icon icon="mdi-notebook-outline" size="28" color="grey" />
              </div>

              <div class="note-card__body min-w-0">
                <div class="note-card__meta">
                  <span
                    class="note-card__status default-title-letter"
                    :class="
                      note.done
                        ? 'note-card__status--done'
                        : 'note-card__status--todo'
                    "
                  >
                    <v-icon
                      :icon="note.done ? 'mdi-check-circle' : 'mdi-circle-outline'"
                      size="12"
                    />
                    {{ note.done ? "Tamamlandı" : "Yapılacak" }}
                  </span>
                  <div class="note-card__actions">
                    <button
                      type="button"
                      class="note-card__action"
                      :title="note.done ? 'Yapılacak yap' : 'Tamamlandı işaretle'"
                      @click="toggleDone(note.id)"
                    >
                      <v-icon
                        :icon="
                          note.done
                            ? 'mdi-checkbox-marked-circle'
                            : 'mdi-checkbox-blank-circle-outline'
                        "
                        :color="note.done ? '#69f0ae' : 'grey'"
                        size="20"
                      />
                    </button>
                    <button
                      type="button"
                      class="note-card__action note-card__action--danger"
                      title="Sil"
                      @click="removeNote(note.id)"
                    >
                      <v-icon icon="mdi-delete-outline" size="18" color="error" />
                    </button>
                  </div>
                </div>

                <p class="note-card__text default-title-letter mb-0">
                  {{ note.text }}
                </p>

                <a
                  v-if="note.youtubeUrl"
                  :href="note.youtubeUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="note-card__link default-title-letter"
                >
                  <v-icon icon="mdi-youtube" size="15" color="red" />
                  <template v-if="noteStart(note)">
                    {{ formatTimestampLabel(noteStart(note)) }}’den aç
                  </template>
                  <template v-else>Videoyu aç</template>
                </a>
              </div>
            </article>
          </v-col>
        </v-row>
      </template>
    </div>

    <!-- Add note popup -->
    <v-dialog
      v-model="addDialog"
      :max-width="display.smAndDown.value ? '100%' : 520"
      :fullscreen="display.smAndDown.value"
      scrim="black"
      transition="dialog-bottom-transition"
    >
      <v-card class="add-note-dialog" rounded="xl">
        <div class="add-note-dialog__head">
          <div>
            <p class="add-note-dialog__eyebrow default-title-letter mb-1">
              Yeni not
            </p>
            <h2 class="add-note-dialog__title default-title-letter mb-0">
              Not ekle
            </h2>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            :ripple="false"
            @click="closeAddDialog"
          />
        </div>

        <div class="add-note-dialog__body">
          <v-textarea
            v-model="draftText"
            label="Not / todo"
            placeholder="Örn: Kuzey bataklıkta şu sandığı al, sonra boss’a gir"
            variant="outlined"
            rounded="lg"
            rows="3"
            auto-grow
            color="light-blue-accent-2"
            class="default-title-letter"
            hide-details="auto"
            density="compact"
            autofocus
          />
          <v-text-field
            v-model="draftYoutube"
            label="YouTube linki (opsiyonel)"
            placeholder="https://youtu.be/… veya youtube.com/watch?v=…"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-youtube"
            color="light-blue-accent-2"
            class="default-title-letter mt-3"
            hide-details="auto"
            clearable
            density="compact"
            :error="youtubeError"
            :error-messages="
              youtubeError ? 'Geçerli bir YouTube linki gir' : undefined
            "
          />

          <div v-if="draftYoutube.trim() && draftThumb" class="play-notes-yt mt-3">
            <div class="play-notes-yt__preview">
              <img :src="draftThumb" alt="" class="play-notes-yt__thumb" />
              <span
                v-if="draftStartSeconds > 0"
                class="play-notes-yt__time default-title-letter"
              >
                {{ formatTimestampLabel(draftStartSeconds) }}
              </span>
            </div>

            <div class="play-notes-yt__side">
              <button
                v-if="!showTimestamp"
                type="button"
                class="play-notes-yt__toggle default-title-letter"
                @click="openTimestamp"
              >
                <v-icon icon="mdi-clock-plus-outline" size="16" />
                Zaman ekle
              </button>

              <div v-else class="play-notes-yt__time-row">
                <v-text-field
                  v-model.number="draftMinutes"
                  type="number"
                  min="0"
                  label="Dk"
                  variant="outlined"
                  rounded="lg"
                  color="light-blue-accent-2"
                  class="default-title-letter play-notes-yt__input"
                  hide-details
                  density="compact"
                />
                <span class="play-notes-yt__colon">:</span>
                <v-text-field
                  v-model.number="draftSeconds"
                  type="number"
                  min="0"
                  max="59"
                  label="Sn"
                  variant="outlined"
                  rounded="lg"
                  color="light-blue-accent-2"
                  class="default-title-letter play-notes-yt__input"
                  hide-details
                  density="compact"
                />
                <button
                  type="button"
                  class="play-notes-yt__clear"
                  title="Zamanı kaldır"
                  @click="clearTimestamp"
                >
                  <v-icon icon="mdi-close" size="16" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="add-note-dialog__foot">
          <v-btn
            variant="text"
            class="text-capitalize default-title-letter"
            text="Vazgeç"
            :ripple="false"
            @click="closeAddDialog"
          />
          <v-btn
            color="light-blue-accent-2"
            variant="flat"
            rounded="pill"
            class="text-black text-capitalize default-title-letter"
            prepend-icon="mdi-plus"
            text="Ekle ve kaydet"
            :disabled="!canAdd"
            :loading="isSaving"
            :ripple="false"
            @click="addNote"
          />
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.play-notes-page__inner {
  max-width: 860px;
  margin-inline: auto;
}

.play-notes-page__top {
  margin-bottom: 0.75rem;
}

.play-notes-hero {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 18px;
  background: linear-gradient(
    135deg,
    rgba(64, 196, 255, 0.12) 0%,
    rgba(0, 0, 0, 0.42) 55%,
    rgba(0, 0, 0, 0.5) 100%
  );
  border: 1px solid rgba(64, 196, 255, 0.28);
}

.play-notes-hero__media {
  flex-shrink: 0;
}

.play-notes-hero__cover {
  width: 72px;
  height: 96px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.play-notes-hero__cover--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
}

.play-notes-hero__copy {
  flex: 1;
}

.play-notes-hero__eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(64, 196, 255, 0.9);
  display: flex;
  align-items: center;
}

.play-notes-hero__title {
  margin: 0;
  font-size: clamp(1.15rem, 2.5vw, 1.55rem);
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
}

.play-notes-hero__sub {
  margin-top: 0.35rem;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.48);
}

.play-notes-hero__add {
  flex-shrink: 0;
}

.play-notes-saving {
  align-items: center;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.45);
}

.play-notes-save-msg {
  margin: 0 0 0.75rem;
  font-size: 0.8rem;
}

.play-notes-save-msg--ok {
  color: #40c4ff;
}

.play-notes-save-msg--err {
  color: #ef5350;
}

.notes-empty-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  padding: 2.5rem 1.25rem;
  border-radius: 18px;
  border: 1px dashed rgba(64, 196, 255, 0.4);
  background: rgba(64, 196, 255, 0.05);
  cursor: pointer;
  text-align: center;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.notes-empty-card:hover {
  background: rgba(64, 196, 255, 0.1);
  border-color: rgba(64, 196, 255, 0.65);
}

.notes-empty-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(64, 196, 255, 0.12);
  margin-bottom: 0.25rem;
}

.notes-empty-card__title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #fff;
}

.notes-empty-card__sub {
  max-width: 360px;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.45;
}

.notes-empty-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.55rem;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  background: #40c4ff;
  color: #000;
  font-size: 0.82rem;
  font-weight: 800;
}

.play-notes-yt {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 12px;
  background: rgba(64, 196, 255, 0.06);
  border: 1px solid rgba(64, 196, 255, 0.18);
}

.play-notes-yt__preview {
  position: relative;
  flex-shrink: 0;
  width: 112px;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #000;
}

.play-notes-yt__thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.play-notes-yt__time {
  position: absolute;
  right: 4px;
  bottom: 4px;
  padding: 0.05rem 0.28rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  font-size: 0.62rem;
  font-weight: 700;
}

.play-notes-yt__side {
  flex: 1;
  min-width: 0;
}

.play-notes-yt__toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  border: 1px dashed rgba(64, 196, 255, 0.45);
  background: transparent;
  color: #40c4ff;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.play-notes-yt__toggle:hover {
  background: rgba(64, 196, 255, 0.1);
}

.play-notes-yt__time-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  max-width: 200px;
}

.play-notes-yt__input {
  max-width: 72px;
}

.play-notes-yt__colon {
  font-size: 0.95rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.4);
}

.play-notes-yt__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
}

.play-notes-yt__clear:hover {
  background: rgba(239, 83, 80, 0.15);
  color: #ef5350;
}

.note-card {
  display: flex;
  gap: 0.75rem;
  min-height: 88px;
  padding: 0.55rem;
  border-radius: 14px;
  overflow: hidden;
}

.note-card--todo {
  background: rgba(64, 196, 255, 0.06);
  border: 1px solid rgba(64, 196, 255, 0.28);
}

.note-card--done {
  background: rgba(105, 240, 174, 0.05);
  border: 1px solid rgba(105, 240, 174, 0.28);
}

.note-card__cover {
  position: relative;
  flex-shrink: 0;
  width: 120px;
  align-self: stretch;
  min-height: 72px;
  border-radius: 10px;
  overflow: hidden;
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.08);
  text-decoration: none;
}

.note-card__cover--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
}

.note-card__cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.note-card__play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.28);
  color: #fff;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.note-card__cover:hover .note-card__play {
  opacity: 1;
}

.note-card__stamp {
  position: absolute;
  right: 5px;
  bottom: 5px;
  padding: 0.05rem 0.3rem;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  font-size: 0.62rem;
  font-weight: 700;
}

.note-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.15rem 0.2rem 0.15rem 0;
}

.note-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.note-card__status {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.12rem 0.45rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.note-card__status--todo {
  background: rgba(64, 196, 255, 0.14);
  color: #40c4ff;
}

.note-card__status--done {
  background: rgba(105, 240, 174, 0.14);
  color: #69f0ae;
}

.note-card__actions {
  display: flex;
  align-items: center;
  gap: 0.15rem;
}

.note-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}

.note-card__action:hover {
  background: rgba(255, 255, 255, 0.06);
}

.note-card__action--danger:hover {
  background: rgba(239, 83, 80, 0.12);
}

.note-card__text {
  font-size: 0.86rem;
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
}

.note-card--done .note-card__text {
  color: rgba(255, 255, 255, 0.48);
  text-decoration: line-through;
}

.note-card__link {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  margin-top: auto;
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
  text-decoration: none;
}

.note-card__link:hover {
  color: #40c4ff;
}

.add-note-dialog {
  background: #141416 !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.add-note-dialog__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1.1rem 1.1rem 0.5rem;
}

.add-note-dialog__eyebrow {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #40c4ff;
}

.add-note-dialog__title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #fff;
}

.add-note-dialog__body {
  padding: 0.5rem 1.1rem 0.25rem;
}

.add-note-dialog__foot {
  display: flex;
  justify-content: flex-end;
  gap: 0.4rem;
  padding: 0.85rem 1.1rem 1.1rem;
}

.play-notes-page__empty {
  text-align: center;
  padding: 4rem 1rem;
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 600px) {
  .note-card__cover {
    width: 92px;
  }

  .play-notes-hero__add {
    width: 100%;
  }
}
</style>
