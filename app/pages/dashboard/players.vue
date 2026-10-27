<script setup lang="ts">
import Admin_Bulk_Delete_Bar from "~/components/common/Admin_Bulk_Delete_Bar.vue";
import PanelBulkDeleteConfirm from "~/components/panel/PanelBulkDeleteConfirm.vue";
import PanelPageTitle from "~/components/panel/PanelPageTitle.vue";
import { useAdminBulkDelete } from "~/composables/admin/useAdminBulkDelete";
import { purgePlayerAccount } from "~/composables/admin/purgePlayerAccount";
import {
  fetchOwnerPlayerOverview,
  summarizePlayerRows,
  type PlayerOverviewRow,
} from "~/composables/useOwnerPlayerStats";
import store from "~/store/store";
import { isChannelOwner } from "~/utils/channelOwnerGames";

definePageMeta({
  layout: "panel",
  ssr: false,
  middleware: "auth",
});

useHead({
  title: "Oyuncular | npmrungame",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const { $firestore } = useNuxtApp();
const _store = store();
const router = useRouter();

const loading = ref(true);
const errorMsg = ref("");
const players = ref<PlayerOverviewRow[]>([]);
const search = ref("");

const {
  bulkDeleteMode,
  selectedIds,
  selectedCount,
  isSelected,
  toggleBulkMode,
  exitBulkMode,
  toggleSelect,
  selectAll,
  clearSelection,
} = useAdminBulkDelete((item: PlayerOverviewRow) => item.uid);

const bulkConfirmOpen = ref(false);
const isBulkDeleting = ref(false);
const singleConfirmOpen = ref(false);
const singleTarget = ref<PlayerOverviewRow | null>(null);
const isSingleDeleting = ref(false);

const summary = computed(() => summarizePlayerRows(players.value));

const deletablePlayers = computed(() =>
  players.value.filter((p) => !p.isOwner)
);

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return players.value;
  return players.value.filter(
    (p) =>
      p.username.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.displayName.toLowerCase().includes(q) ||
      p.uid.toLowerCase().includes(q)
  );
});

const filteredDeletable = computed(() =>
  filtered.value.filter((p) => !p.isOwner)
);

async function load() {
  if (!_store.user?.uid || !isChannelOwner(_store.user.uid)) {
    await router.replace("/dashboard");
    return;
  }
  if (!$firestore) return;

  loading.value = true;
  errorMsg.value = "";
  try {
    players.value = await fetchOwnerPlayerOverview($firestore);
  } catch (e: any) {
    console.error("players overview:", e);
    errorMsg.value =
      e?.message ||
      "Oyuncu verileri alınamadı. Firestore kurallarını kontrol et.";
  } finally {
    loading.value = false;
  }
}

watch(
  () => _store.user?.uid,
  (uid) => {
    if (uid) load();
  },
  { immediate: true }
);

function formatJoined(ms: number | null) {
  if (ms == null) return "—";
  return new Date(ms).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Bozuk / erişilemeyen Google avatar URL’leri için harf fallback */
const brokenAvatars = ref<Record<string, boolean>>({});

function avatarLetter(p: PlayerOverviewRow) {
  const src = p.displayName || p.username || p.email || "?";
  return src.slice(0, 1).toUpperCase();
}

function onAvatarError(uid: string) {
  brokenAvatars.value[uid] = true;
}

function onRowClick(p: PlayerOverviewRow) {
  if (!bulkDeleteMode.value || p.isOwner) return;
  toggleSelect(p);
}

function openSingleDelete(p: PlayerOverviewRow) {
  if (p.isOwner) return;
  singleTarget.value = p;
  singleConfirmOpen.value = true;
}

async function confirmSingleDelete() {
  const p = singleTarget.value;
  if (!p || !$firestore || p.isOwner) return;

  try {
    isSingleDeleting.value = true;
    await purgePlayerAccount($firestore, { uid: p.uid, email: p.email });
    singleConfirmOpen.value = false;
    singleTarget.value = null;
    await load();
  } catch (e: any) {
    console.error("player delete:", e);
    errorMsg.value = e?.message || "Oyuncu silinemedi.";
  } finally {
    isSingleDeleting.value = false;
  }
}

async function confirmBulkDelete() {
  if (!$firestore || !selectedIds.value.length) return;

  const targets = deletablePlayers.value.filter((p) =>
    selectedIds.value.includes(p.uid)
  );
  if (!targets.length) return;

  try {
    isBulkDeleting.value = true;
    for (const p of targets) {
      await purgePlayerAccount($firestore, { uid: p.uid, email: p.email });
    }
    bulkConfirmOpen.value = false;
    exitBulkMode();
    await load();
  } catch (e: any) {
    console.error("bulk player delete:", e);
    errorMsg.value = e?.message || "Seçili oyuncular silinemedi.";
  } finally {
    isBulkDeleting.value = false;
  }
}
</script>

<template>
  <div class="owner-players">
    <header class="owner-players__head">
      <div>
        <p class="owner-players__eyebrow">Kanal sahibi · platform özeti</p>
        <PanelPageTitle text="Oyuncular" />
        <p class="owner-players__lead">
          Kayıtlı oyuncuları gör, listelerini yönet veya sistemden kaldır.
          Owner hesabı silinemez.
        </p>
      </div>
      <div class="owner-players__head-actions">
        <button
          type="button"
          class="owner-players__edit"
          :class="{ 'owner-players__edit--active': bulkDeleteMode }"
          :disabled="!deletablePlayers.length && !bulkDeleteMode"
          @click="toggleBulkMode"
        >
          <v-icon
            :icon="
              bulkDeleteMode
                ? 'mdi-close'
                : 'mdi-checkbox-multiple-marked-outline'
            "
            size="18"
          />
          {{ bulkDeleteMode ? "Bitir" : "Düzenle" }}
        </button>
        <button
          type="button"
          class="owner-players__refresh"
          :disabled="loading"
          @click="load"
        >
          <v-icon
            :icon="loading ? 'mdi-loading' : 'mdi-refresh'"
            size="18"
            :class="{ 'owner-players__spin': loading }"
          />
          Yenile
        </button>
      </div>
    </header>

    <v-row dense class="owner-players__stats">
      <v-col cols="12" sm="6">
        <article class="owner-players__stat owner-players__stat--hero">
          <div class="owner-players__stat-icon" aria-hidden="true">
            <v-icon icon="mdi-account-group" size="22" />
          </div>
          <div>
            <span>Kayıtlı oyuncu</span>
            <strong>{{ summary.playerCount }}</strong>
            <small>Platforma üye olan toplam kullanıcı</small>
          </div>
        </article>
      </v-col>
      <v-col cols="12" sm="6">
        <article class="owner-players__stat owner-players__stat--hero owner-players__stat--accent">
          <div class="owner-players__stat-icon" aria-hidden="true">
            <v-icon icon="mdi-database" size="22" />
          </div>
          <div>
            <span>Tüm listelerdeki oyunlar</span>
            <strong>{{ summary.libraryTotal }}</strong>
            <small>Herkesin listelerindeki oyun kaydı toplamı</small>
          </div>
        </article>
      </v-col>

      <v-col cols="12" sm="4">
        <article class="owner-players__stat">
          <div class="owner-players__stat-icon" aria-hidden="true">
            <v-icon icon="mdi-play-circle-outline" size="20" />
          </div>
          <div>
            <span>Şu an oynanıyor</span>
            <strong>{{ summary.totals.current_games }}</strong>
          </div>
        </article>
      </v-col>
      <v-col cols="12" sm="4">
        <article class="owner-players__stat">
          <div class="owner-players__stat-icon" aria-hidden="true">
            <v-icon icon="mdi-trophy-outline" size="20" />
          </div>
          <div>
            <span>Bitirilen oyunlar</span>
            <strong>{{ summary.totals.completed_games }}</strong>
          </div>
        </article>
      </v-col>
      <v-col cols="12" sm="4">
        <article class="owner-players__stat">
          <div class="owner-players__stat-icon" aria-hidden="true">
            <v-icon icon="mdi-calendar-check" size="20" />
          </div>
          <div>
            <span>Bu yıl bitirilen</span>
            <strong>{{ summary.totals.target_2026_games }}</strong>
          </div>
        </article>
      </v-col>

      <v-col cols="12" sm="6">
        <article class="owner-players__stat">
          <div class="owner-players__stat-icon" aria-hidden="true">
            <v-icon icon="mdi-radar" size="20" />
          </div>
          <div>
            <span>Radar (yakında çıkacak)</span>
            <strong>{{ summary.totals.upcoming_games }}</strong>
          </div>
        </article>
      </v-col>
      <v-col cols="12" sm="6">
        <article class="owner-players__stat">
          <div class="owner-players__stat-icon" aria-hidden="true">
            <v-icon icon="mdi-playlist-play" size="20" />
          </div>
          <div>
            <span>Backlog (bir ara oynanacak)</span>
            <strong>{{ summary.totals.to_play_games }}</strong>
          </div>
        </article>
      </v-col>
    </v-row>

    <div class="owner-players__toolbar">
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        placeholder="Oyuncu, email veya uid ara…"
        variant="solo-filled"
        flat
        hide-details
        clearable
        density="comfortable"
        rounded="lg"
        class="owner-players__search"
      />
    </div>

    <Admin_Bulk_Delete_Bar
      :active="bulkDeleteMode"
      :selected-count="selectedCount"
      :total-count="filteredDeletable.length"
      entity-label="oyuncu"
      @select-all="selectAll(filteredDeletable)"
      @clear="clearSelection"
      @delete="bulkConfirmOpen = true"
      @cancel="exitBulkMode"
    />

    <p v-if="errorMsg" class="owner-players__error">{{ errorMsg }}</p>

    <div v-if="loading" class="owner-players__loading">
      <v-progress-circular indeterminate color="success" size="36" width="3" />
      <span>Oyuncular yükleniyor…</span>
    </div>

    <div v-else-if="!filtered.length" class="owner-players__empty">
      Henüz oyuncu yok veya arama sonucu boş.
    </div>

    <div v-else class="owner-players__table-wrap">
      <table class="owner-players__table">
        <thead>
          <tr>
            <th v-if="bulkDeleteMode" class="owner-players__th-check" />
            <th>Oyuncu</th>
            <th>Oynuyor</th>
            <th>Bitirdi</th>
            <th>Radar</th>
            <th>Backlog</th>
            <th>Bu yıl</th>
            <th>Toplam</th>
            <th>Kayıt</th>
            <th class="owner-players__th-actions">İşlem</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in filtered"
            :key="p.uid"
            :class="{
              'owner-players__row--selected':
                bulkDeleteMode && isSelected(p),
              'owner-players__row--selectable':
                bulkDeleteMode && !p.isOwner,
            }"
            @click="onRowClick(p)"
          >
            <td v-if="bulkDeleteMode" class="owner-players__td-check">
              <v-icon
                v-if="!p.isOwner"
                :icon="
                  isSelected(p)
                    ? 'mdi-checkbox-marked'
                    : 'mdi-checkbox-blank-outline'
                "
                :color="isSelected(p) ? 'success' : 'grey-lighten-1'"
                size="22"
              />
            </td>
            <td>
              <div class="owner-players__user">
                <img
                  v-if="p.photoURL && !brokenAvatars[p.uid]"
                  :src="p.photoURL"
                  alt=""
                  class="owner-players__avatar"
                  referrerpolicy="no-referrer"
                  @error="onAvatarError(p.uid)"
                />
                <span
                  v-else
                  class="owner-players__avatar owner-players__avatar--fallback"
                >
                  {{ avatarLetter(p) }}
                </span>
                <div class="owner-players__user-meta">
                  <strong>
                    {{ p.displayName || p.username }}
                    <span v-if="p.isOwner" class="owner-players__badge">owner</span>
                  </strong>
                  <small>{{ p.email || p.uid }}</small>
                </div>
              </div>
            </td>
            <td>{{ p.counts.current_games }}</td>
            <td>{{ p.counts.completed_games }}</td>
            <td>{{ p.counts.upcoming_games }}</td>
            <td>{{ p.counts.to_play_games }}</td>
            <td>{{ p.counts.target_2026_games }}</td>
            <td>
              <strong class="owner-players__total">{{ p.totalGames }}</strong>
            </td>
            <td>{{ formatJoined(p.createdAtMs) }}</td>
            <td class="owner-players__td-actions" @click.stop>
              <button
                v-if="!p.isOwner"
                type="button"
                class="owner-players__delete"
                title="Sistemden sil"
                :disabled="bulkDeleteMode"
                @click="openSingleDelete(p)"
              >
                <v-icon icon="mdi-delete-outline" size="18" />
              </button>
              <span v-else class="owner-players__locked">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PanelBulkDeleteConfirm
      v-model="bulkConfirmOpen"
      :count="selectedCount"
      :loading="isBulkDeleting"
      entity-label="oyuncu"
      @confirm="confirmBulkDelete"
    />

    <v-dialog
      v-model="singleConfirmOpen"
      :max-width="460"
      scrim="rgba(0,0,0,0.85)"
    >
      <div class="owner-players__confirm d-flex flex-column ga-3 pa-5">
        <div class="d-flex align-center ga-3">
          <span class="owner-players__confirm-icon">
            <v-icon icon="mdi-account-remove-outline" size="22" />
          </span>
          <div>
            <h3 class="owner-players__confirm-title mb-0">
              Oyuncu sistemden silinsin mi?
            </h3>
            <p class="owner-players__confirm-sub mb-0">
              <strong>{{
                singleTarget?.displayName || singleTarget?.username
              }}</strong>
              ({{ singleTarget?.email || singleTarget?.uid }}) — profili,
              listeleri ve Top 9’u silinir; tekrar giriş engellenir.
            </p>
          </div>
        </div>
        <div class="d-flex justify-end ga-2 mt-2">
          <v-btn
            variant="text"
            color="grey-lighten-1"
            class="text-capitalize"
            :disabled="isSingleDeleting"
            text="Vazgeç"
            @click="singleConfirmOpen = false"
          />
          <v-btn
            color="error"
            variant="flat"
            class="text-capitalize"
            prepend-icon="mdi-delete-outline"
            :loading="isSingleDeleting"
            text="Sil"
            @click="confirmSingleDelete"
          />
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<style scoped>
.owner-players {
  max-width: 72rem;
  margin: 0 auto;
  padding: 0.5rem 0.25rem 2rem;
}

.owner-players__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.owner-players__head-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.owner-players__eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--panel-accent, #69f0ae);
}

.owner-players__lead {
  margin: 0.45rem 0 0;
  max-width: 36rem;
  font-size: 0.86rem;
  line-height: 1.5;
  color: var(--panel-muted, #94a3b8);
}

.owner-players__edit,
.owner-players__refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.4rem;
  padding: 0.45rem 0.95rem;
  border-radius: 0.75rem;
  border: 1px solid var(--panel-border, rgb(255 255 255 / 0.1));
  background: var(--panel-card, #0c1220);
  color: var(--panel-text, #e8eef7);
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.owner-players__edit:hover:not(:disabled) {
  border-color: rgba(105, 240, 174, 0.45);
  color: #69f0ae;
}

.owner-players__edit--active {
  border-color: rgba(239, 83, 80, 0.55);
  background: rgba(239, 83, 80, 0.12);
  color: #ef9a9a;
}

.owner-players__edit:disabled,
.owner-players__refresh:disabled {
  opacity: 0.6;
  cursor: wait;
}

.owner-players__edit:disabled {
  cursor: not-allowed;
}

.owner-players__spin {
  animation: owner-spin 0.8s linear infinite;
}

@keyframes owner-spin {
  to {
    transform: rotate(360deg);
  }
}

.owner-players__stats {
  margin-bottom: 0.35rem;
}

.owner-players__stat {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  height: 100%;
  min-height: 5.25rem;
  padding: 0.95rem 1rem;
  border-radius: 1rem;
  border: 1px solid var(--panel-card-border, rgb(255 255 255 / 0.1));
  background: var(--panel-card, #0c1220);
}

.owner-players__stat-icon {
  display: inline-flex;
  flex-shrink: 0;
  width: 2.35rem;
  height: 2.35rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.7rem;
  background: rgb(105 240 174 / 0.1);
  border: 1px solid rgb(105 240 174 / 0.22);
  color: var(--panel-accent, #69f0ae);
}

.owner-players__stat span {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--panel-muted, #94a3b8);
}

.owner-players__stat strong {
  display: block;
  margin-top: 0.2rem;
  font-size: 1.45rem;
  font-weight: 800;
  line-height: 1.1;
  color: var(--panel-text, #e8eef7);
}

.owner-players__stat small {
  display: block;
  margin-top: 0.3rem;
  font-size: 0.72rem;
  line-height: 1.35;
  color: var(--panel-muted, #94a3b8);
  opacity: 0.9;
}

.owner-players__stat--hero {
  min-height: 6.4rem;
  padding: 1.15rem 1.15rem;
}

.owner-players__stat--hero strong {
  font-size: 2rem;
}

.owner-players__stat--accent {
  border-color: rgb(105 240 174 / 0.35);
  background: linear-gradient(
    145deg,
    rgb(105 240 174 / 0.14),
    var(--panel-card, #0c1220) 70%
  );
}

.owner-players__stat--accent strong {
  color: var(--panel-accent, #69f0ae);
}

.owner-players__toolbar {
  margin-bottom: 0.85rem;
}

.owner-players__search :deep(.v-field) {
  background: var(--panel-card, #0c1220) !important;
}

.owner-players__error {
  margin: 0 0 0.85rem;
  padding: 0.75rem 0.9rem;
  border-radius: 0.75rem;
  background: rgb(239 68 68 / 0.12);
  color: #fecaca;
  font-size: 0.85rem;
}

.owner-players__loading,
.owner-players__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 10rem;
  border-radius: 1rem;
  border: 1px dashed var(--panel-border, rgb(255 255 255 / 0.12));
  color: var(--panel-muted, #94a3b8);
  font-size: 0.88rem;
}

.owner-players__table-wrap {
  overflow: auto;
  border-radius: 1rem;
  border: 1px solid var(--panel-card-border, rgb(255 255 255 / 0.1));
  background: var(--panel-card, #0c1220);
}

.owner-players__table {
  width: 100%;
  border-collapse: collapse;
  min-width: 56rem;
}

.owner-players__table th,
.owner-players__table td {
  padding: 0.75rem 0.85rem;
  text-align: left;
  font-size: 0.82rem;
  border-bottom: 1px solid var(--panel-border, rgb(255 255 255 / 0.08));
  white-space: nowrap;
}

.owner-players__table th {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--panel-muted, #94a3b8);
  background: var(--panel-soft, rgb(0 0 0 / 0.22));
}

.owner-players__table tbody tr:hover {
  background: rgb(105 240 174 / 0.04);
}

.owner-players__row--selectable {
  cursor: pointer;
}

.owner-players__row--selected {
  background: rgb(105 240 174 / 0.08) !important;
}

.owner-players__th-check,
.owner-players__td-check {
  width: 2.5rem;
  text-align: center;
}

.owner-players__th-actions,
.owner-players__td-actions {
  width: 3.5rem;
  text-align: center;
}

.owner-players__user {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 14rem;
}

.owner-players__avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  object-fit: cover;
  flex-shrink: 0;
}

.owner-players__avatar--fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgb(105 240 174 / 0.15);
  color: var(--panel-accent, #69f0ae);
  font-weight: 800;
}

.owner-players__user-meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.owner-players__user-meta strong {
  font-size: 0.86rem;
  color: var(--panel-text, #e8eef7);
}

.owner-players__user-meta small {
  font-size: 0.72rem;
  color: var(--panel-muted, #94a3b8);
  overflow: hidden;
  text-overflow: ellipsis;
}

.owner-players__badge {
  margin-left: 0.35rem;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: rgb(105 240 174 / 0.18);
  color: var(--panel-accent, #69f0ae);
  vertical-align: middle;
}

.owner-players__total {
  color: var(--panel-accent, #69f0ae);
}

.owner-players__delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid rgba(239, 83, 80, 0.35);
  border-radius: 0.55rem;
  background: rgba(239, 83, 80, 0.1);
  color: #ef9a9a;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.owner-players__delete:hover:not(:disabled) {
  background: rgba(239, 83, 80, 0.22);
  border-color: rgba(239, 83, 80, 0.6);
}

.owner-players__delete:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.owner-players__locked {
  color: var(--panel-muted, #94a3b8);
  opacity: 0.5;
}

.owner-players__confirm {
  border-radius: 1rem;
  background: #12161d;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
}

.owner-players__confirm-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.75rem;
  background: rgba(239, 83, 80, 0.14);
  color: #ef9a9a;
  flex-shrink: 0;
}

.owner-players__confirm-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
}

.owner-players__confirm-sub {
  margin-top: 0.25rem;
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.62);
  line-height: 1.4;
  white-space: normal;
}
</style>
