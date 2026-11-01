<script setup lang="ts">
import PanelPageTitle from "~/components/panel/PanelPageTitle.vue";
import {
  fetchPlayerLists,
  fetchPlayerProfile,
  PLAYER_DETAIL_TABS,
  type PlayerDetailLists,
  type PlayerDetailProfile,
  type PlayerListGame,
} from "~/composables/admin/fetchPlayerDetail";
import type { PlayerListCounts } from "~/composables/useOwnerPlayerStats";
import store from "~/store/store";
import { isChannelOwner } from "~/utils/channelOwnerGames";
import type { UserGameListKey } from "~/utils/channelOwnerGames";

definePageMeta({
  layout: "panel",
  ssr: false,
  middleware: "auth",
});

const route = useRoute();
const router = useRouter();
const { $firestore } = useNuxtApp();
const _store = store();

const uid = computed(() => String(route.params.uid || "").trim());

const loading = ref(true);
const errorMsg = ref("");
const profile = ref<PlayerDetailProfile | null>(null);
const lists = ref<PlayerDetailLists | null>(null);
const counts = ref<PlayerListCounts | null>(null);

const activeTab = ref<UserGameListKey | "steam">("current_games");

const steamLoading = ref(false);
const steamError = ref("");
const steamSummary = ref<{
  personaname?: string;
  avatarfull?: string;
  gameextrainfo?: string;
  personastate?: number;
  profileurl?: string;
} | null>(null);
const steamRecent = ref<
  Array<{
    appId: number;
    name: string;
    playtime2WeeksMin: number;
    playtimeForeverMin: number;
    iconUrl?: string;
    coverUrls?: string[];
  }>
>([]);
const steamOwned = ref<
  Array<{
    appId: number;
    name: string;
    playtimeForeverMin: number;
    iconUrl?: string;
    coverUrls?: string[];
  }>
>([]);
const steamOwnedCount = ref(0);

useHead({
  title: computed(() =>
    profile.value
      ? `${profile.value.displayName} · Admin | npmrungame`
      : "Oyuncu detayı | npmrungame"
  ),
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const tabItems = computed(() =>
  PLAYER_DETAIL_TABS.map((t) => ({
    ...t,
    count:
      t.key === "steam"
        ? profile.value?.steamId
          ? steamOwnedCount.value || "—"
          : 0
        : counts.value?.[t.key as UserGameListKey] ?? 0,
    disabled: t.key === "steam" && !profile.value?.steamId,
  }))
);

const activeListGames = computed<PlayerListGame[]>(() => {
  if (!lists.value || activeTab.value === "steam") return [];
  return lists.value[activeTab.value] || [];
});

function formatMinutes(min: number) {
  if (!min) return "0 dk";
  if (min < 60) return `${min} dk`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} sa ${m} dk` : `${h} sa`;
}

function formatJoined(ms: number | null) {
  if (ms == null) return "—";
  return new Date(ms).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function loadSteam(steamId: string) {
  steamLoading.value = true;
  steamError.value = "";
  steamSummary.value = null;
  steamRecent.value = [];
  steamOwned.value = [];
  steamOwnedCount.value = 0;

  try {
    const [summaryRes, recentRes, ownedRes] = await Promise.all([
      $fetch<{ success?: boolean; data?: typeof steamSummary.value }>(
        "/api/steam/player-summary",
        { query: { steamId } }
      ).catch((e) => {
        throw e;
      }),
      $fetch<{
        success?: boolean;
        data?: { games?: typeof steamRecent.value };
      }>("/api/steam/recently-played", { query: { steamId } }).catch(() => null),
      $fetch<{
        success?: boolean;
        data?: { games?: typeof steamOwned.value; gameCount?: number };
      }>("/api/steam/owned-games", { query: { steamId } }).catch(() => null),
    ]);

    steamSummary.value = summaryRes?.data || null;
    steamRecent.value = recentRes?.data?.games || [];
    const owned = ownedRes?.data?.games || [];
    steamOwnedCount.value = ownedRes?.data?.gameCount ?? owned.length;
    steamOwned.value = [...owned]
      .sort((a, b) => (b.playtimeForeverMin || 0) - (a.playtimeForeverMin || 0))
      .slice(0, 24);
  } catch (e: any) {
    steamError.value =
      e?.data?.message ||
      e?.statusMessage ||
      e?.message ||
      "Steam verisi alınamadı.";
  } finally {
    steamLoading.value = false;
  }
}

async function load() {
  if (!_store.user?.uid || !isChannelOwner(_store.user.uid)) {
    await router.replace("/dashboard");
    return;
  }
  if (!$firestore || !uid.value) {
    errorMsg.value = "Geçersiz oyuncu.";
    loading.value = false;
    return;
  }

  loading.value = true;
  errorMsg.value = "";
  try {
    const p = await fetchPlayerProfile($firestore, uid.value);
    if (!p) {
      profile.value = null;
      lists.value = null;
      errorMsg.value = "Oyuncu bulunamadı.";
      return;
    }
    profile.value = p;
    const { lists: L, counts: C } = await fetchPlayerLists(
      $firestore,
      uid.value
    );
    lists.value = L;
    counts.value = C;

    // En dolu sekme ile başla
    const preferred: UserGameListKey[] = [
      "current_games",
      "completed_games",
      "target_2026_games",
      "upcoming_games",
      "to_play_games",
    ];
    activeTab.value =
      preferred.find((k) => (C[k] || 0) > 0) || "current_games";

    if (p.steamId) {
      // Steam sekmesi seçili değilse arka planda yükle
      loadSteam(p.steamId);
    }
  } catch (e: any) {
    console.error("player detail:", e);
    errorMsg.value = e?.message || "Oyuncu detayı alınamadı.";
  } finally {
    loading.value = false;
  }
}

watch(
  () => [uid.value, _store.user?.uid] as const,
  () => {
    if (_store.user?.uid) load();
  },
  { immediate: true }
);

watch(activeTab, (tab) => {
  if (
    tab === "steam" &&
    profile.value?.steamId &&
    !steamSummary.value &&
    !steamLoading.value
  ) {
    loadSteam(profile.value.steamId);
  }
});
</script>

<template>
  <div class="player-detail">
    <div class="player-detail__top">
      <v-btn
        variant="text"
        color="grey-lighten-1"
        class="text-capitalize"
        prepend-icon="mdi-arrow-left"
        text="Dashboard"
        :ripple="false"
        to="/dashboard/players"
      />
    </div>

    <div v-if="loading" class="player-detail__state">
      <v-progress-circular indeterminate color="success" size="36" width="3" />
      <span>Oyuncu yükleniyor…</span>
    </div>

    <div v-else-if="errorMsg && !profile" class="player-detail__state">
      <v-icon icon="mdi-account-off-outline" size="40" color="grey" />
      <p class="mb-0">{{ errorMsg }}</p>
      <v-btn
        color="success"
        variant="tonal"
        class="text-capitalize mt-3"
        text="Geri dön"
        to="/dashboard/players"
      />
    </div>

    <template v-else-if="profile">
      <header class="player-detail__hero">
        <img
          v-if="steamSummary?.avatarfull || profile.photoURL"
          :src="steamSummary?.avatarfull || profile.photoURL!"
          alt=""
          class="player-detail__avatar"
          referrerpolicy="no-referrer"
        />
        <span v-else class="player-detail__avatar player-detail__avatar--fb">
          {{ (profile.displayName || "?").slice(0, 1).toUpperCase() }}
        </span>

        <div class="player-detail__hero-copy min-w-0">
          <p class="player-detail__eyebrow mb-1">
            Oyuncu detayı
            <span v-if="profile.isOwner" class="player-detail__owner">owner</span>
          </p>
          <PanelPageTitle :text="profile.displayName || profile.username" />
          <p class="player-detail__meta mb-0">
            <span>{{ profile.email || "—" }}</span>
            <span>·</span>
            <span>Kayıt: {{ formatJoined(profile.createdAtMs) }}</span>
            <span v-if="profile.steamId">·</span>
            <span v-if="profile.steamId" class="player-detail__steam-pill">
              <v-icon icon="mdi-steam" size="14" />
              {{ steamSummary?.personaname || "Steam bağlı" }}
            </span>
          </p>
          <p
            v-if="steamSummary?.gameextrainfo"
            class="player-detail__playing mb-0"
          >
            Şu an oynuyor: <strong>{{ steamSummary.gameextrainfo }}</strong>
          </p>
        </div>

        <div class="player-detail__hero-stats">
          <div
            v-for="t in tabItems.filter((x) => x.key !== 'steam')"
            :key="t.key"
            class="player-detail__chip"
          >
            <span>{{ t.label }}</span>
            <strong>{{ t.count }}</strong>
          </div>
        </div>
      </header>

      <p v-if="errorMsg" class="player-detail__error">{{ errorMsg }}</p>

      <div class="player-detail__tabs" role="tablist">
        <button
          v-for="t in tabItems"
          :key="t.key"
          type="button"
          class="player-detail__tab"
          :class="{
            'player-detail__tab--active': activeTab === t.key,
            'player-detail__tab--disabled': t.disabled,
          }"
          :disabled="t.disabled"
          role="tab"
          :aria-selected="activeTab === t.key"
          @click="!t.disabled && (activeTab = t.key)"
        >
          <v-icon :icon="t.icon" size="16" />
          {{ t.label }}
          <span class="player-detail__tab-n">{{ t.count }}</span>
        </button>
      </div>

      <!-- Liste sekmeleri -->
      <section v-if="activeTab !== 'steam'" class="player-detail__panel">
        <div v-if="!activeListGames.length" class="player-detail__empty">
          Bu listede oyun yok.
        </div>
        <div v-else class="player-detail__grid">
          <article
            v-for="g in activeListGames"
            :key="g.firestoreId"
            class="player-detail__card"
          >
            <img :src="g.cover" alt="" class="player-detail__cover" />
            <div class="player-detail__card-body">
              <h3 class="player-detail__game-name">{{ g.name }}</h3>
              <p class="player-detail__game-sub mb-0">
                <span v-if="g.released">{{ String(g.released).slice(0, 4) }}</span>
                <span v-if="g.metacritic"> · Meta {{ g.metacritic }}</span>
              </p>
            </div>
          </article>
        </div>
      </section>

      <!-- Steam sekmesi -->
      <section v-else class="player-detail__panel">
        <div v-if="!profile.steamId" class="player-detail__empty">
          Bu oyuncu Steam hesabını bağlamamış.
        </div>
        <div v-else-if="steamLoading" class="player-detail__state player-detail__state--in">
          <v-progress-circular indeterminate color="#66c0f4" size="28" width="2" />
          <span>Steam taranıyor…</span>
        </div>
        <div v-else-if="steamError" class="player-detail__error">
          {{ steamError }}
        </div>
        <template v-else>
          <div class="player-detail__steam-head">
            <div>
              <p class="player-detail__steam-label mb-1">Steam profil</p>
              <p class="player-detail__steam-name mb-0">
                {{ steamSummary?.personaname || "—" }}
              </p>
              <p v-if="steamSummary?.gameextrainfo" class="player-detail__playing mb-0 mt-1">
                Oynuyor: <strong>{{ steamSummary.gameextrainfo }}</strong>
              </p>
            </div>
            <div class="player-detail__steam-counts">
              <div>
                <span>Kütüphane</span>
                <strong>{{ steamOwnedCount }}</strong>
              </div>
              <div>
                <span>Son oynanan</span>
                <strong>{{ steamRecent.length }}</strong>
              </div>
            </div>
            <a
              v-if="steamSummary?.profileurl"
              :href="steamSummary.profileurl"
              target="_blank"
              rel="noopener noreferrer"
              class="player-detail__steam-link"
            >
              Steam’de aç
              <v-icon icon="mdi-open-in-new" size="14" />
            </a>
          </div>

          <h3 class="player-detail__section-title">Son oynananlar</h3>
          <div v-if="!steamRecent.length" class="player-detail__empty player-detail__empty--sm">
            Son 2 haftada oyun yok (veya profil gizli).
          </div>
          <div v-else class="player-detail__steam-row">
            <article
              v-for="g in steamRecent"
              :key="`r-${g.appId}`"
              class="player-detail__steam-card"
            >
              <img
                :src="g.coverUrls?.[0] || g.iconUrl"
                alt=""
                class="player-detail__steam-img"
              />
              <div class="min-w-0">
                <p class="player-detail__steam-game mb-0">{{ g.name }}</p>
                <small>
                  2 hf: {{ formatMinutes(g.playtime2WeeksMin) }} · toplam
                  {{ formatMinutes(g.playtimeForeverMin) }}
                </small>
              </div>
            </article>
          </div>

          <h3 class="player-detail__section-title">
            En çok oynananlar (kütüphane)
          </h3>
          <div v-if="!steamOwned.length" class="player-detail__empty player-detail__empty--sm">
            Kütüphane okunamadı (gizli olabilir).
          </div>
          <div v-else class="player-detail__steam-row">
            <article
              v-for="g in steamOwned"
              :key="`o-${g.appId}`"
              class="player-detail__steam-card"
            >
              <img
                :src="g.coverUrls?.[0] || g.iconUrl"
                alt=""
                class="player-detail__steam-img"
              />
              <div class="min-w-0">
                <p class="player-detail__steam-game mb-0">{{ g.name }}</p>
                <small>{{ formatMinutes(g.playtimeForeverMin) }}</small>
              </div>
              <a
                v-if="profile.steamId"
                class="player-detail__ach-link"
                :href="`https://steamcommunity.com/profiles/${profile.steamId}/stats/${g.appId}/?tab=achievements`"
                target="_blank"
                rel="noopener noreferrer"
                title="Steam başarımları"
              >
                <v-icon icon="mdi-trophy-outline" size="16" />
              </a>
            </article>
          </div>
          <p class="player-detail__hint">
            Kupa ikonu oyuncunun Steam başarımlar sayfasını açar (profil herkese
            açıksa görünür).
          </p>
        </template>
      </section>
    </template>
  </div>
</template>

<style scoped>
.player-detail {
  max-width: 72rem;
  margin: 0 auto;
  padding: 0.5rem 0.25rem 2.5rem;
}

.player-detail__top {
  margin-bottom: 0.5rem;
}

.player-detail__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  min-height: 12rem;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.88rem;
}

.player-detail__state--in {
  min-height: 6rem;
  flex-direction: row;
}

.player-detail__hero {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.15rem;
  margin-bottom: 1rem;
  border-radius: 1.1rem;
  border: 1px solid rgba(105, 240, 174, 0.28);
  background: linear-gradient(
    135deg,
    rgba(105, 240, 174, 0.1) 0%,
    rgba(0, 0, 0, 0.4) 55%
  );
}

.player-detail__avatar {
  width: 4.25rem;
  height: 4.25rem;
  border-radius: 999px;
  object-fit: cover;
  border: 2px solid rgba(105, 240, 174, 0.35);
  flex-shrink: 0;
}

.player-detail__avatar--fb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(105, 240, 174, 0.15);
  color: #69f0ae;
  font-weight: 800;
  font-size: 1.4rem;
}

.player-detail__hero-copy {
  flex: 1;
  min-width: 12rem;
}

.player-detail__eyebrow {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #69f0ae;
}

.player-detail__owner {
  margin-left: 0.35rem;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  background: rgba(105, 240, 174, 0.18);
  font-size: 0.62rem;
}

.player-detail__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.45rem;
  margin-top: 0.35rem;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.5);
}

.player-detail__steam-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #66c0f4;
}

.player-detail__playing {
  margin-top: 0.35rem;
  font-size: 0.8rem;
  color: #69f0ae;
}

.player-detail__hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.player-detail__chip {
  display: flex;
  flex-direction: column;
  min-width: 4.2rem;
  padding: 0.4rem 0.55rem;
  border-radius: 0.65rem;
  background: rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.player-detail__chip span {
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 700;
}

.player-detail__chip strong {
  font-size: 1rem;
  color: #e8eef7;
}

.player-detail__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.85rem;
}

.player-detail__tab {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 2.15rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font: inherit;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
}

.player-detail__tab:hover:not(:disabled) {
  border-color: rgba(105, 240, 174, 0.35);
  color: #e8eef7;
}

.player-detail__tab--active {
  border-color: rgba(105, 240, 174, 0.45);
  background: rgba(105, 240, 174, 0.12);
  color: #69f0ae;
}

.player-detail__tab--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.player-detail__tab-n {
  min-width: 1.2rem;
  padding: 0 0.3rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.68rem;
  text-align: center;
}

.player-detail__panel {
  padding: 0.85rem;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(12, 18, 32, 0.9);
}

.player-detail__empty {
  text-align: center;
  padding: 2rem 1rem;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.86rem;
}

.player-detail__empty--sm {
  padding: 1rem;
}

.player-detail__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}

@media (min-width: 700px) {
  .player-detail__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1000px) {
  .player-detail__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.player-detail__card {
  display: flex;
  gap: 0.65rem;
  padding: 0.45rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.25);
  min-height: 4.5rem;
}

.player-detail__cover {
  width: 2.75rem;
  height: 3.7rem;
  object-fit: cover;
  border-radius: 0.4rem;
  flex-shrink: 0;
  background: #111;
}

.player-detail__game-name {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 750;
  color: #e8eef7;
  line-height: 1.25;
}

.player-detail__game-sub {
  margin-top: 0.25rem;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.42);
}

.player-detail__steam-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.15rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.player-detail__steam-label {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #66c0f4;
}

.player-detail__steam-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: #fff;
}

.player-detail__steam-counts {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
}

.player-detail__steam-counts div {
  display: flex;
  flex-direction: column;
  padding: 0.4rem 0.65rem;
  border-radius: 0.65rem;
  background: rgba(102, 192, 244, 0.08);
  border: 1px solid rgba(102, 192, 244, 0.22);
}

.player-detail__steam-counts span {
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.45);
}

.player-detail__steam-counts strong {
  font-size: 1.05rem;
  color: #66c0f4;
}

.player-detail__steam-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: #66c0f4;
  text-decoration: none;
}

.player-detail__section-title {
  margin: 0 0 0.65rem;
  font-size: 0.88rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.85);
}

.player-detail__steam-row {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-bottom: 1.25rem;
}

.player-detail__steam-card {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.45rem 0.55rem;
  border-radius: 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(0, 0, 0, 0.22);
}

.player-detail__steam-img {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.4rem;
  object-fit: cover;
  background: #111;
  flex-shrink: 0;
}

.player-detail__steam-game {
  font-size: 0.82rem;
  font-weight: 700;
  color: #e8eef7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-detail__steam-card small {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.42);
}

.player-detail__ach-link {
  margin-left: auto;
  display: inline-flex;
  color: rgba(255, 255, 255, 0.35);
}

.player-detail__ach-link:hover {
  color: #ffc448;
}

.player-detail__hint {
  margin: 0;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.38);
  line-height: 1.4;
}

.player-detail__error {
  margin: 0 0 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: 0.65rem;
  background: rgba(239, 83, 80, 0.12);
  color: #fecaca;
  font-size: 0.84rem;
}
</style>
