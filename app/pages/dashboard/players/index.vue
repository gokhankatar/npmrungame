<script setup lang="ts">
import Admin_Bulk_Delete_Bar from "~/components/common/Admin_Bulk_Delete_Bar.vue";
import PanelBulkDeleteConfirm from "~/components/panel/PanelBulkDeleteConfirm.vue";
import PanelPageTitle from "~/components/panel/PanelPageTitle.vue";
import { useAdminBulkDelete } from "~/composables/admin/useAdminBulkDelete";
import {
  fetchBannedPlayers,
  purgePlayerAccount,
  removeBannedPlayer,
  type BannedPlayerRow,
} from "~/composables/admin/purgePlayerAccount";
import {
  enrichPlayersWithSteamLive,
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
  title: "Admin Dashboard | npmrungame",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const { $firestore } = useNuxtApp();
const _store = store();
const router = useRouter();

const loading = ref(true);
const errorMsg = ref("");
const players = ref<PlayerOverviewRow[]>([]);
const bannedPlayers = ref<BannedPlayerRow[]>([]);
const listTab = ref<"active" | "banned">("active");
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

const {
  bulkDeleteMode: bannedBulkMode,
  selectedIds: bannedSelectedIds,
  selectedCount: bannedSelectedCount,
  isSelected: isBannedSelected,
  toggleBulkMode: toggleBannedBulkMode,
  exitBulkMode: exitBannedBulkMode,
  toggleSelect: toggleBannedSelect,
  selectAll: selectAllBanned,
  clearSelection: clearBannedSelection,
} = useAdminBulkDelete(
  (item: BannedPlayerRow) => `${item.source}:${item.id}`
);

const bulkConfirmOpen = ref(false);
const isBulkDeleting = ref(false);
const singleConfirmOpen = ref(false);
const singleTarget = ref<PlayerOverviewRow | null>(null);
const isSingleDeleting = ref(false);

const banRemoveConfirmOpen = ref(false);
const banRemoveTarget = ref<BannedPlayerRow | null>(null);
const isRemovingBan = ref(false);
const banBulkConfirmOpen = ref(false);
const isBanBulkDeleting = ref(false);

const editingActive = computed(() =>
  listTab.value === "active" ? bulkDeleteMode.value : bannedBulkMode.value
);

const summary = computed(() => summarizePlayerRows(players.value));

/** Spotlight: kanal sahibi (sen) — tüm oyuncuların toplamı değil */
const ownerRow = computed(
  () => players.value.find((p) => p.isOwner) ?? null
);

const ownerYearCompleted = computed(
  () => ownerRow.value?.counts.target_2026_games ?? 0
);

const ownerYearGoal = computed(
  () => ownerRow.value?.yearlyGameGoal ?? 50
);

const ownerGoalPct = computed(() => {
  const goal = Math.max(1, ownerYearGoal.value);
  return Math.min(
    100,
    Math.round((ownerYearCompleted.value / goal) * 100)
  );
});

const ownerGoalRemaining = computed(() =>
  Math.max(0, ownerYearGoal.value - ownerYearCompleted.value)
);

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
      p.uid.toLowerCase().includes(q) ||
      (p.steamId && p.steamId.includes(q)) ||
      (p.steamLive?.personaname || "").toLowerCase().includes(q) ||
      (p.steamLive?.gameName || "").toLowerCase().includes(q)
  );
});

const filteredDeletable = computed(() =>
  filtered.value.filter((p) => !p.isOwner)
);

const filteredBanned = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return bannedPlayers.value;
  return bannedPlayers.value.filter(
    (b) =>
      (b.displayName || "").toLowerCase().includes(q) ||
      (b.username || "").toLowerCase().includes(q) ||
      (b.email || "").toLowerCase().includes(q) ||
      (b.uid || "").toLowerCase().includes(q) ||
      (b.reason || "").toLowerCase().includes(q)
  );
});

function reasonLabel(reason: string | null) {
  if (reason === "admin_delete") return "Admin sildi";
  if (!reason) return "—";
  return reason;
}

async function load() {
  if (!_store.user?.uid || !isChannelOwner(_store.user.uid)) {
    await router.replace("/dashboard");
    return;
  }
  if (!$firestore) return;

  loading.value = true;
  errorMsg.value = "";
  try {
    const [base, banned] = await Promise.all([
      fetchOwnerPlayerOverview($firestore),
      fetchBannedPlayers($firestore),
    ]);
    players.value = await enrichPlayersWithSteamLive(base);
    bannedPlayers.value = banned;
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

function playerAvatar(p: PlayerOverviewRow) {
  return p.steamLive?.avatar || p.photoURL || null;
}

function onAvatarError(uid: string) {
  brokenAvatars.value[uid] = true;
}

function onRowClick(p: PlayerOverviewRow) {
  if (bulkDeleteMode.value) {
    if (!p.isOwner) toggleSelect(p);
    return;
  }
  navigateTo(`/dashboard/players/${p.uid}`);
}

function openSingleDelete(p: PlayerOverviewRow) {
  if (p.isOwner) return;
  singleTarget.value = p;
  singleConfirmOpen.value = true;
}

function toggleEditMode() {
  if (listTab.value === "active") toggleBulkMode();
  else toggleBannedBulkMode();
}

function onBannedRowClick(b: BannedPlayerRow) {
  if (!bannedBulkMode.value) return;
  toggleBannedSelect(b);
}

function openBanRemove(b: BannedPlayerRow) {
  banRemoveTarget.value = b;
  banRemoveConfirmOpen.value = true;
}

async function confirmSingleDelete(alsoBan: boolean) {
  const p = singleTarget.value;
  if (!p || !$firestore || p.isOwner) return;

  try {
    isSingleDeleting.value = true;
    await purgePlayerAccount($firestore, {
      uid: p.uid,
      email: p.email,
      username: p.username,
      displayName: p.displayName,
      alsoBan,
    });
    singleConfirmOpen.value = false;
    singleTarget.value = null;
    if (alsoBan) listTab.value = "banned";
    await load();
  } catch (e: any) {
    console.error("player delete:", e);
    errorMsg.value = e?.message || "Oyuncu silinemedi.";
  } finally {
    isSingleDeleting.value = false;
  }
}

async function confirmBanRemove() {
  const b = banRemoveTarget.value;
  if (!b || !$firestore) return;

  try {
    isRemovingBan.value = true;
    await removeBannedPlayer($firestore, b);
    banRemoveConfirmOpen.value = false;
    banRemoveTarget.value = null;
    await load();
  } catch (e: any) {
    console.error("ban remove:", e);
    errorMsg.value = e?.message || "Ban kaydı silinemedi.";
  } finally {
    isRemovingBan.value = false;
  }
}

async function confirmBulkDelete(alsoBan: boolean) {
  if (!$firestore || !selectedIds.value.length) return;

  const targets = deletablePlayers.value.filter((p) =>
    selectedIds.value.includes(p.uid)
  );
  if (!targets.length) return;

  try {
    isBulkDeleting.value = true;
    for (const p of targets) {
      await purgePlayerAccount($firestore, {
        uid: p.uid,
        email: p.email,
        username: p.username,
        displayName: p.displayName,
        alsoBan,
      });
    }
    if (alsoBan) listTab.value = "banned";
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

async function confirmBanBulkDelete() {
  if (!$firestore || !bannedSelectedIds.value.length) return;

  const targets = filteredBanned.value.filter((b) =>
    isBannedSelected(b)
  );
  if (!targets.length) return;

  try {
    isBanBulkDeleting.value = true;
    for (const b of targets) {
      await removeBannedPlayer($firestore, b);
    }
    banBulkConfirmOpen.value = false;
    exitBannedBulkMode();
    await load();
  } catch (e: any) {
    console.error("bulk ban remove:", e);
    errorMsg.value = e?.message || "Seçili ban kayıtları silinemedi.";
  } finally {
    isBanBulkDeleting.value = false;
  }
}
</script>

<template>
  <div class="owner-players">
    <header class="owner-players__head">
      <div>
        <p class="owner-players__eyebrow">Kanal sahibi · admin</p>
        <PanelPageTitle text="Dashboard" />
        <p class="owner-players__lead">
          Platform özeti, aktif oyuncular ve banlı / silinen hesaplar.
          Owner hesabı silinemez.
        </p>
      </div>
      <div class="owner-players__head-actions">
        <button
          type="button"
          class="owner-players__edit"
          :class="{ 'owner-players__edit--active': editingActive }"
          :disabled="
            listTab === 'active'
              ? !deletablePlayers.length && !bulkDeleteMode
              : !bannedPlayers.length && !bannedBulkMode
          "
          @click="toggleEditMode"
        >
          <v-icon
            :icon="
              editingActive
                ? 'mdi-close'
                : 'mdi-checkbox-multiple-marked-outline'
            "
            size="18"
          />
          {{ editingActive ? "Bitir" : "Çoklu sil" }}
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

    <section class="owner-players__stats" aria-label="Platform özeti">
      <!-- Spotlight: bu yıl -->
      <article class="op-stat op-stat--year">
        <div class="op-stat__glow" aria-hidden="true" />
        <div class="op-stat__year-top">
          <span class="op-stat__badge">
            <v-icon icon="mdi-calendar-star" size="14" />
            {{ new Date().getFullYear() }}
          </span>
          <span class="op-stat__hint">En önemli metrik</span>
        </div>
        <div class="op-stat__year-main">
          <div class="op-stat__year-copy">
            <p class="op-stat__label">Bu yıl bitirdiğin oyunlar</p>
            <p class="op-stat__value op-stat__value--xl">
              {{ ownerYearCompleted }}
              <span class="op-stat__goal-slash">/ {{ ownerYearGoal }}</span>
            </p>
            <p class="op-stat__sub">
              <template v-if="ownerGoalRemaining > 0">
                Hedefe <strong>{{ ownerGoalRemaining }}</strong> oyun kaldı ·
                %{{ ownerGoalPct }}
              </template>
              <template v-else>
                Yıllık hedef tamam · %{{ ownerGoalPct }}
              </template>
            </p>
          </div>
          <div class="op-stat__year-icon" aria-hidden="true">
            <v-icon icon="mdi-trophy-variant" size="36" />
          </div>
        </div>
        <div
          class="op-stat__bar"
          role="presentation"
          :style="{ '--pct': `${ownerGoalPct}%` }"
        >
          <span class="op-stat__bar-fill" />
        </div>
      </article>

      <div class="op-stat-grid">
        <article class="op-stat op-stat--tone-players">
          <div class="op-stat__icon" aria-hidden="true">
            <v-icon icon="mdi-account-group-outline" size="18" />
          </div>
          <div class="op-stat__body">
            <span class="op-stat__label">Kayıtlı oyuncu</span>
            <strong class="op-stat__value">{{ summary.playerCount }}</strong>
          </div>
        </article>

        <article class="op-stat op-stat--tone-library">
          <div class="op-stat__icon" aria-hidden="true">
            <v-icon icon="mdi-database-outline" size="18" />
          </div>
          <div class="op-stat__body">
            <span class="op-stat__label">Listelerdeki oyun</span>
            <strong class="op-stat__value">{{ summary.libraryTotal }}</strong>
          </div>
        </article>

        <article class="op-stat op-stat--tone-play">
          <div class="op-stat__icon" aria-hidden="true">
            <v-icon icon="mdi-play-circle-outline" size="18" />
          </div>
          <div class="op-stat__body">
            <span class="op-stat__label">Şu an oynanıyor</span>
            <strong class="op-stat__value">{{ summary.totals.current_games }}</strong>
          </div>
        </article>

        <article class="op-stat op-stat--tone-done">
          <div class="op-stat__icon" aria-hidden="true">
            <v-icon icon="mdi-trophy-outline" size="18" />
          </div>
          <div class="op-stat__body">
            <span class="op-stat__label">Bitirilen (tümü)</span>
            <strong class="op-stat__value">{{ summary.totals.completed_games }}</strong>
          </div>
        </article>

        <article class="op-stat op-stat--tone-radar">
          <div class="op-stat__icon" aria-hidden="true">
            <v-icon icon="mdi-radar" size="18" />
          </div>
          <div class="op-stat__body">
            <span class="op-stat__label">Radar</span>
            <strong class="op-stat__value">{{ summary.totals.upcoming_games }}</strong>
          </div>
        </article>

        <article class="op-stat op-stat--tone-steam">
          <div class="op-stat__icon" aria-hidden="true">
            <v-icon icon="mdi-steam" size="18" />
          </div>
          <div class="op-stat__body">
            <span class="op-stat__label">Steam bağlı</span>
            <strong class="op-stat__value">{{ summary.steamLinkedCount }}</strong>
          </div>
        </article>
      </div>
    </section>

    <div class="owner-players__tabs" role="tablist">
      <button
        type="button"
        class="owner-players__tab"
        :class="{ 'owner-players__tab--active': listTab === 'active' }"
        role="tab"
        :aria-selected="listTab === 'active'"
        @click="
          listTab = 'active';
          exitBannedBulkMode();
        "
      >
        Aktif oyuncular
        <span class="owner-players__tab-count">{{ players.length }}</span>
      </button>
      <button
        type="button"
        class="owner-players__tab"
        :class="{ 'owner-players__tab--active': listTab === 'banned' }"
        role="tab"
        :aria-selected="listTab === 'banned'"
        @click="
          listTab = 'banned';
          exitBulkMode();
        "
      >
        Banlı / silinen
        <span class="owner-players__tab-count">{{ bannedPlayers.length }}</span>
      </button>
    </div>

    <div class="owner-players__toolbar">
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        :placeholder="
          listTab === 'banned'
            ? 'Banlı oyuncu, email veya uid ara…'
            : 'Oyuncu, email veya uid ara…'
        "
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
      v-if="listTab === 'active'"
      :active="bulkDeleteMode"
      :selected-count="selectedCount"
      :total-count="filteredDeletable.length"
      entity-label="oyuncu"
      @select-all="selectAll(filteredDeletable)"
      @clear="clearSelection"
      @delete="bulkConfirmOpen = true"
      @cancel="exitBulkMode"
    />

    <Admin_Bulk_Delete_Bar
      v-else
      :active="bannedBulkMode"
      :selected-count="bannedSelectedCount"
      :total-count="filteredBanned.length"
      entity-label="ban kaydı"
      @select-all="selectAllBanned(filteredBanned)"
      @clear="clearBannedSelection"
      @delete="banBulkConfirmOpen = true"
      @cancel="exitBannedBulkMode"
    />

    <p v-if="errorMsg" class="owner-players__error">{{ errorMsg }}</p>

    <div v-if="loading" class="owner-players__loading">
      <v-progress-circular indeterminate color="success" size="36" width="3" />
      <span>Dashboard yükleniyor…</span>
    </div>

    <template v-else-if="listTab === 'active'">
      <div v-if="!filtered.length" class="owner-players__empty">
        Henüz oyuncu yok veya arama sonucu boş.
      </div>

      <div v-else class="owner-players__table-wrap">
        <table class="owner-players__table">
          <thead>
            <tr>
              <th v-if="bulkDeleteMode" class="owner-players__th-check" />
              <th>Oyuncu</th>
              <th>Steam</th>
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
                  bulkDeleteMode ? !p.isOwner : true,
                'owner-players__row--clickable': !bulkDeleteMode,
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
                    v-if="playerAvatar(p) && !brokenAvatars[p.uid]"
                    :src="playerAvatar(p)!"
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
              <td>
                <div v-if="p.steamId" class="owner-players__steam">
                  <span class="owner-players__steam-badge">
                    <v-icon icon="mdi-steam" size="14" />
                    {{ p.steamLive?.personaname || "Steam" }}
                  </span>
                  <small
                    v-if="p.steamLive?.gameName"
                    class="owner-players__steam-game"
                  >
                    Şu an: {{ p.steamLive.gameName }}
                  </small>
                  <small
                    v-else-if="p.steamLive?.privateOrUnavailable"
                    class="owner-players__steam-muted"
                  >
                    Profil gizli / yok
                  </small>
                  <small v-else class="owner-players__steam-muted">
                    Oyunda değil
                  </small>
                </div>
                <span v-else class="owner-players__steam-muted">—</span>
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
                <div class="owner-players__actions">
                  <button
                    type="button"
                    class="owner-players__view"
                    title="Detaylı incele"
                    :disabled="bulkDeleteMode"
                    @click="navigateTo(`/dashboard/players/${p.uid}`)"
                  >
                    <v-icon icon="mdi-magnify-scan" size="18" />
                  </button>
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
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-else>
      <div v-if="!filteredBanned.length" class="owner-players__empty">
        Banlı veya silinen oyuncu kaydı yok
        <small v-if="search.trim()" class="d-block mt-1">Arama sonucu boş.</small>
      </div>

      <div v-else class="owner-players__table-wrap">
        <table class="owner-players__table">
          <thead>
            <tr>
              <th v-if="bannedBulkMode" class="owner-players__th-check" />
              <th>Oyuncu</th>
              <th>Email</th>
              <th>UID</th>
              <th>Sebep</th>
              <th>Ban / silinme</th>
              <th class="owner-players__th-actions">İşlem</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="b in filteredBanned"
              :key="`${b.source}-${b.id}`"
              :class="{
                'owner-players__row--selected':
                  bannedBulkMode && isBannedSelected(b),
                'owner-players__row--selectable': bannedBulkMode,
              }"
              @click="onBannedRowClick(b)"
            >
              <td v-if="bannedBulkMode" class="owner-players__td-check">
                <v-icon
                  :icon="
                    isBannedSelected(b)
                      ? 'mdi-checkbox-marked'
                      : 'mdi-checkbox-blank-outline'
                  "
                  :color="isBannedSelected(b) ? 'success' : 'grey-lighten-1'"
                  size="22"
                />
              </td>
              <td>
                <div class="owner-players__user-meta">
                  <strong>
                    {{ b.displayName || b.username || "—" }}
                    <span class="owner-players__badge owner-players__badge--banned">
                      ban
                    </span>
                  </strong>
                  <small v-if="b.username && b.displayName !== b.username">
                    @{{ b.username }}
                  </small>
                </div>
              </td>
              <td>{{ b.email || "—" }}</td>
              <td>
                <code class="owner-players__uid">{{ b.uid || "—" }}</code>
              </td>
              <td>{{ reasonLabel(b.reason) }}</td>
              <td>{{ formatJoined(b.bannedAtMs) }}</td>
              <td class="owner-players__td-actions" @click.stop>
                <button
                  type="button"
                  class="owner-players__delete"
                  title="Ban kaydını sil"
                  :disabled="bannedBulkMode"
                  @click="openBanRemove(b)"
                >
                  <v-icon icon="mdi-delete-outline" size="18" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <v-dialog
      v-model="bulkConfirmOpen"
      :max-width="480"
      scrim="rgba(0,0,0,0.85)"
    >
      <div class="owner-players__confirm d-flex flex-column ga-3 pa-5">
        <div class="d-flex align-center ga-3">
          <span class="owner-players__confirm-icon">
            <v-icon icon="mdi-account-multiple-remove-outline" size="22" />
          </span>
          <div>
            <h3 class="owner-players__confirm-title mb-0">
              {{ selectedCount }} oyuncu nasıl silinsin?
            </h3>
            <p class="owner-players__confirm-sub mb-0">
              Profiller, listeler ve Top 9 kalıcı kaldırılır.
            </p>
          </div>
        </div>

        <ul class="owner-players__confirm-opts mb-0">
          <li>
            <strong>Banla ve sil</strong> — tekrar kayıt / giriş engellenir
          </li>
          <li>
            <strong>Sadece sil</strong> — veriler gider; aynı hesapla yeniden
            gelebilir
          </li>
        </ul>

        <div class="owner-players__confirm-actions">
          <v-btn
            variant="text"
            color="grey-lighten-1"
            class="text-capitalize"
            :disabled="isBulkDeleting"
            text="Vazgeç"
            @click="bulkConfirmOpen = false"
          />
          <v-btn
            color="warning"
            variant="tonal"
            class="text-capitalize"
            prepend-icon="mdi-delete-outline"
            :loading="isBulkDeleting"
            :disabled="isBulkDeleting"
            :text="`Sadece sil (${selectedCount})`"
            @click="confirmBulkDelete(false)"
          />
          <v-btn
            color="error"
            variant="flat"
            class="text-capitalize"
            prepend-icon="mdi-gavel"
            :loading="isBulkDeleting"
            :disabled="isBulkDeleting"
            :text="`Banla ve sil (${selectedCount})`"
            @click="confirmBulkDelete(true)"
          />
        </div>
      </div>
    </v-dialog>

    <PanelBulkDeleteConfirm
      v-model="banBulkConfirmOpen"
      :count="bannedSelectedCount"
      :loading="isBanBulkDeleting"
      entity-label="ban kaydı"
      @confirm="confirmBanBulkDelete"
    />

    <v-dialog
      v-model="singleConfirmOpen"
      :max-width="480"
      scrim="rgba(0,0,0,0.85)"
    >
      <div class="owner-players__confirm d-flex flex-column ga-3 pa-5">
        <div class="d-flex align-center ga-3">
          <span class="owner-players__confirm-icon">
            <v-icon icon="mdi-account-remove-outline" size="22" />
          </span>
          <div>
            <h3 class="owner-players__confirm-title mb-0">
              Oyuncu nasıl silinsin?
            </h3>
            <p class="owner-players__confirm-sub mb-0">
              <strong>{{
                singleTarget?.displayName || singleTarget?.username
              }}</strong>
              ({{ singleTarget?.email || singleTarget?.uid }}) — profili,
              listeleri ve Top 9’u silinir.
            </p>
          </div>
        </div>

        <ul class="owner-players__confirm-opts mb-0">
          <li>
            <strong>Banla ve sil</strong> — tekrar kayıt / giriş engellenir
          </li>
          <li>
            <strong>Sadece sil</strong> — veriler gider; aynı hesapla yeniden
            gelebilir
          </li>
        </ul>

        <div class="owner-players__confirm-actions">
          <v-btn
            variant="text"
            color="grey-lighten-1"
            class="text-capitalize"
            :disabled="isSingleDeleting"
            text="Vazgeç"
            @click="singleConfirmOpen = false"
          />
          <v-btn
            color="warning"
            variant="tonal"
            class="text-capitalize"
            prepend-icon="mdi-delete-outline"
            :loading="isSingleDeleting"
            :disabled="isSingleDeleting"
            text="Sadece sil"
            @click="confirmSingleDelete(false)"
          />
          <v-btn
            color="error"
            variant="flat"
            class="text-capitalize"
            prepend-icon="mdi-gavel"
            :loading="isSingleDeleting"
            :disabled="isSingleDeleting"
            text="Banla ve sil"
            @click="confirmSingleDelete(true)"
          />
        </div>
      </div>
    </v-dialog>

    <v-dialog
      v-model="banRemoveConfirmOpen"
      :max-width="460"
      scrim="rgba(0,0,0,0.85)"
    >
      <div class="owner-players__confirm d-flex flex-column ga-3 pa-5">
        <div class="d-flex align-center ga-3">
          <span class="owner-players__confirm-icon">
            <v-icon icon="mdi-shield-off-outline" size="22" />
          </span>
          <div>
            <h3 class="owner-players__confirm-title mb-0">
              Ban kaydı silinsin mi?
            </h3>
            <p class="owner-players__confirm-sub mb-0">
              <strong>{{
                banRemoveTarget?.displayName ||
                banRemoveTarget?.username ||
                banRemoveTarget?.email ||
                banRemoveTarget?.uid
              }}</strong>
              — `banned_users` / `banned_emails` kaydı kalkar; tekrar kayıt /
              giriş mümkün olur.
            </p>
          </div>
        </div>
        <div class="d-flex justify-end ga-2 mt-2">
          <v-btn
            variant="text"
            color="grey-lighten-1"
            class="text-capitalize"
            :disabled="isRemovingBan"
            text="Vazgeç"
            @click="banRemoveConfirmOpen = false"
          />
          <v-btn
            color="error"
            variant="flat"
            class="text-capitalize"
            prepend-icon="mdi-delete-outline"
            :loading="isRemovingBan"
            text="Banı sil"
            @click="confirmBanRemove"
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
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.15rem;
}

.op-stat {
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--panel-card, #0c1220);
}

.op-stat--year {
  padding: 1.15rem 1.25rem 1.05rem;
  border-color: rgba(255, 196, 72, 0.35);
  background:
    radial-gradient(
      120% 90% at 100% 0%,
      rgba(255, 196, 72, 0.16) 0%,
      transparent 55%
    ),
    linear-gradient(145deg, rgba(255, 196, 72, 0.08), #0a0f18 62%);
}

.op-stat__glow {
  position: absolute;
  inset: auto -20% -40% 40%;
  height: 70%;
  background: radial-gradient(
    closest-side,
    rgba(255, 196, 72, 0.18),
    transparent 70%
  );
  pointer-events: none;
}

.op-stat__year-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.op-stat__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: rgba(255, 196, 72, 0.14);
  border: 1px solid rgba(255, 196, 72, 0.4);
  color: #ffc448;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.op-stat__hint {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 196, 72, 0.65);
}

.op-stat__year-main {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.op-stat__year-copy {
  min-width: 0;
}

.op-stat__label {
  margin: 0;
  display: block;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: rgba(255, 255, 255, 0.55);
}

.op-stat__value {
  display: block;
  margin-top: 0.2rem;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.05;
  color: #e8eef7;
}

.op-stat__value--xl {
  margin-top: 0.35rem;
  font-size: clamp(2.4rem, 5vw, 3.25rem);
  letter-spacing: -0.03em;
  color: #ffe08a;
  text-shadow: 0 0 28px rgba(255, 196, 72, 0.25);
}

.op-stat__goal-slash {
  margin-left: 0.2rem;
  font-size: 0.42em;
  font-weight: 700;
  letter-spacing: 0;
  color: rgba(255, 255, 255, 0.4);
  text-shadow: none;
  vertical-align: baseline;
}

.op-stat__sub {
  margin: 0.45rem 0 0;
  font-size: 0.78rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.48);
}

.op-stat__sub strong {
  color: #ffc448;
  font-weight: 800;
}

.op-stat__year-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1rem;
  background: rgba(255, 196, 72, 0.12);
  border: 1px solid rgba(255, 196, 72, 0.35);
  color: #ffc448;
  flex-shrink: 0;
}

.op-stat__bar {
  margin-top: 1rem;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.op-stat__bar-fill {
  display: block;
  height: 100%;
  width: var(--pct, 0%);
  border-radius: inherit;
  background: linear-gradient(90deg, #e6a817, #ffc448);
  box-shadow: 0 0 12px rgba(255, 196, 72, 0.45);
  transition: width 0.4s ease;
}

.op-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
}

@media (min-width: 700px) {
  .op-stat-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.op-stat-grid .op-stat {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-height: 4.35rem;
  padding: 0.75rem 0.85rem;
}

.op-stat__icon {
  display: inline-flex;
  flex-shrink: 0;
  width: 2.1rem;
  height: 2.1rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.65rem;
  border: 1px solid transparent;
}

.op-stat__body {
  min-width: 0;
}

.op-stat--tone-players .op-stat__icon {
  color: #69f0ae;
  background: rgba(105, 240, 174, 0.1);
  border-color: rgba(105, 240, 174, 0.25);
}

.op-stat--tone-library .op-stat__icon {
  color: #80cbc4;
  background: rgba(128, 203, 196, 0.1);
  border-color: rgba(128, 203, 196, 0.25);
}

.op-stat--tone-play .op-stat__icon {
  color: #40c4ff;
  background: rgba(64, 196, 255, 0.1);
  border-color: rgba(64, 196, 255, 0.25);
}

.op-stat--tone-done .op-stat__icon {
  color: #69f0ae;
  background: rgba(105, 240, 174, 0.1);
  border-color: rgba(105, 240, 174, 0.25);
}

.op-stat--tone-radar .op-stat__icon {
  color: #26c6da;
  background: rgba(38, 198, 218, 0.1);
  border-color: rgba(38, 198, 218, 0.25);
}

.op-stat--tone-steam .op-stat__icon {
  color: #66c0f4;
  background: rgba(102, 192, 244, 0.1);
  border-color: rgba(102, 192, 244, 0.28);
}

.owner-players__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.85rem;
}

.owner-players__tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.2rem;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.owner-players__tab:hover {
  border-color: rgba(105, 240, 174, 0.35);
  color: #e8eef7;
}

.owner-players__tab--active {
  border-color: rgba(105, 240, 174, 0.45);
  background: rgba(105, 240, 174, 0.12);
  color: #69f0ae;
}

.owner-players__tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.35rem;
  height: 1.35rem;
  padding: 0 0.35rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.68rem;
  font-weight: 800;
}

.owner-players__tab--active .owner-players__tab-count {
  background: rgba(105, 240, 174, 0.2);
  color: #69f0ae;
}

.owner-players__toolbar {
  margin-bottom: 0.85rem;
}

.owner-players__badge--banned {
  background: rgba(239, 83, 80, 0.18);
  color: #ef9a9a;
}

.owner-players__uid {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.55);
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

.owner-players__row--selectable,
.owner-players__row--clickable {
  cursor: pointer;
}

.owner-players__row--clickable:hover {
  background: rgba(255, 255, 255, 0.03);
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
  width: 5.5rem;
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

.owner-players__steam {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 8.5rem;
}

.owner-players__steam-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  width: fit-content;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 750;
  background: rgb(27 40 56 / 0.95);
  border: 1px solid rgb(102 192 244 / 0.35);
  color: #c7d5e0;
}

.owner-players__steam-game {
  font-size: 0.72rem;
  font-weight: 650;
  color: var(--panel-accent, #69f0ae);
  max-width: 12rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.owner-players__steam-muted {
  font-size: 0.72rem;
  color: var(--panel-muted, #94a3b8);
  opacity: 0.85;
}

.owner-players__actions {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.owner-players__view {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid rgba(64, 196, 255, 0.4);
  border-radius: 0.55rem;
  background: rgba(64, 196, 255, 0.1);
  color: #40c4ff;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.owner-players__view:hover:not(:disabled) {
  background: rgba(64, 196, 255, 0.2);
  border-color: rgba(64, 196, 255, 0.65);
}

.owner-players__view:disabled {
  opacity: 0.35;
  cursor: not-allowed;
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

.owner-players__confirm-opts {
  margin: 0.15rem 0 0;
  padding: 0.75rem 0.9rem 0.75rem 1.35rem;
  border-radius: 0.7rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  list-style: disc;
  font-size: 0.84rem;
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.45;
}

.owner-players__confirm-opts li + li {
  margin-top: 0.35rem;
}

.owner-players__confirm-opts strong {
  color: #fff;
  font-weight: 600;
}

.owner-players__confirm-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.35rem;
}
</style>
