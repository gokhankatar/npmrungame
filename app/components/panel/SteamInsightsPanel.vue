<script setup lang="ts">
import { useAppLocale } from "~/composables/useAppLocale";
import { steamHours, type SteamGame } from "~/composables/useSteamHub";
import { useSteamInsights } from "~/composables/useSteamInsights";
import { formatSteamMoney } from "~/utils/steamMatch";

const props = defineProps<{
  games: SteamGame[];
  platinumCount: number;
  wishlist: Array<{
    appId: number;
    name: string;
    discountPct: number;
    headerUrl?: string;
  }>;
  /** Hub yüklemesi bitti mi — 0 oyunda da skeleton bitsin */
  ready?: boolean;
}>();

const { tx } = useAppLocale();
const {
  libraryValue,
  libraryValueDisplay,
  setDisplayCurrency,
  yearRecap,
  radarMatch,
  friendsLive,
  refreshInsights,
} = useSteamInsights();

const loading = ref(true);
const errorMsg = ref("");
const booted = ref(false);

const yearShareText = computed(() => {
  const y = yearRecap.value;
  if (!y) return "";
  return tx("panel.steam.yearShareText")
    .replace("{year}", String(y.year))
    .replace("{games}", String(y.gamesTouched))
    .replace("{hours}", String(y.hoursApprox))
    .replace("{plat}", String(y.platinumInLibrary));
});

/** Radar’da var, Steam kütüphanesinde yok */
const radarMissingRows = computed(() =>
  radarMatch.value.rows.filter((r) => !r.owned)
);

async function copyYearCard() {
  try {
    await navigator.clipboard.writeText(yearShareText.value);
  } catch {
    /* ignore */
  }
}

async function boot() {
  loading.value = true;
  errorMsg.value = "";
  try {
    await refreshInsights({
      games: props.games,
      platinumCount: props.platinumCount,
      wishlist: props.wishlist,
    });
    booted.value = true;
  } catch (e: any) {
    errorMsg.value =
      e?.data?.message || e?.message || tx("panel.steam.loadFail");
  } finally {
    loading.value = false;
  }
}

watch(
  () =>
    [props.ready, props.games.length, props.platinumCount, props.wishlist.length] as const,
  ([ready]) => {
    if (ready !== false) boot();
  },
  { immediate: true }
);
</script>

<template>
  <div class="si">
    <p class="si__sub">{{ tx("panel.steam.insightsSub") }}</p>

    <p v-if="errorMsg" class="si-msg">{{ errorMsg }}</p>

    <div v-if="loading && !booted" class="si-skel" aria-busy="true" aria-label="Loading">
      <div class="si-hero-row">
        <div class="si-skel__card si-skel__card--value">
          <span class="si-skel__shine" />
          <div class="si-skel__row">
            <i class="si-skel__ico" />
            <div class="si-skel__stack">
              <i class="si-skel__line si-skel__line--md" />
              <i class="si-skel__line si-skel__line--lg" />
            </div>
            <i class="si-skel__chip" />
          </div>
          <i class="si-skel__price" />
          <i class="si-skel__line si-skel__line--sm" />
        </div>
        <div class="si-skel__card si-skel__card--plat">
          <span class="si-skel__shine" />
          <i class="si-skel__ico" />
          <i class="si-skel__line si-skel__line--md" />
          <i class="si-skel__price si-skel__price--sm" />
          <i class="si-skel__line si-skel__line--sm" />
          <i class="si-skel__line si-skel__line--xs" />
        </div>
      </div>

      <div class="si-skel__card si-skel__card--wide">
        <span class="si-skel__shine" />
        <div class="si-skel__row">
          <i class="si-skel__ico" />
          <div class="si-skel__stack">
            <i class="si-skel__line si-skel__line--md" />
            <i class="si-skel__line si-skel__line--lg" />
          </div>
          <i class="si-skel__chip" />
        </div>
        <div class="si-skel__stats">
          <i /><i /><i />
        </div>
        <div class="si-skel__games">
          <div v-for="n in 5" :key="n" class="si-skel__game">
            <i class="si-skel__cover" />
            <i class="si-skel__line si-skel__line--sm" />
            <i class="si-skel__line si-skel__line--xs" />
          </div>
        </div>
      </div>

      <div class="si-skel__card si-skel__card--wide">
        <span class="si-skel__shine" />
        <div class="si-skel__row">
          <i class="si-skel__ico" />
          <div class="si-skel__stack">
            <i class="si-skel__line si-skel__line--md" />
            <i class="si-skel__line si-skel__line--lg" />
          </div>
        </div>
        <div class="si-skel__pills">
          <i v-for="n in 4" :key="n" />
        </div>
      </div>

      <div class="si-skel__card si-skel__card--wide">
        <span class="si-skel__shine" />
        <i class="si-skel__ico" />
        <i class="si-skel__line si-skel__line--md" />
        <div class="si-skel__games si-skel__games--dense">
          <div v-for="n in 6" :key="n" class="si-skel__game">
            <i class="si-skel__cover" />
            <i class="si-skel__line si-skel__line--sm" />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="si-grid">
      <div class="si-hero-row">
        <section class="si-card si-card--value">
          <div class="si-card__head-row">
            <div class="si-card__title-block">
              <div class="si-card__icon"><v-icon icon="mdi-cash-multiple" /></div>
              <div>
                <h2>{{ tx("panel.steam.valueTitle") }}</h2>
                <p class="si-card__hint">{{ tx("panel.steam.valueHint") }}</p>
              </div>
            </div>
            <div class="si-fx" role="group" :aria-label="tx('panel.steam.valueFx')">
              <button
                type="button"
                class="si-fx__btn"
                :class="{ 'si-fx__btn--on': libraryValue.displayCurrency === 'TRY' }"
                @click="setDisplayCurrency('TRY')"
              >
                TRY
              </button>
              <button
                type="button"
                class="si-fx__btn"
                :class="{ 'si-fx__btn--on': libraryValue.displayCurrency === 'USD' }"
                :disabled="!libraryValue.usdTryRate"
                @click="setDisplayCurrency('USD')"
              >
                USD
              </button>
            </div>
          </div>
          <p v-if="libraryValue.loading" class="si-card__muted">…</p>
          <template v-else>
            <p class="si-card__big si-card__big--value">
              {{
                formatSteamMoney(
                  libraryValueDisplay.cents,
                  libraryValueDisplay.currency
                )
              }}
            </p>
            <div class="si-card__foot">
              <p class="si-card__meta">
                {{
                  tx("panel.steam.valueMeta")
                    .replace("{n}", String(libraryValue.pricedCount))
                    .replace("{t}", String(libraryValue.scannedCount))
                }}
              </p>
              <p v-if="libraryValue.usdTryRate" class="si-card__note">
                {{
                  tx("panel.steam.valueRate").replace(
                    "{rate}",
                    libraryValue.usdTryRate.toFixed(2)
                  )
                }}
              </p>
              <p v-if="libraryValue.sampleNote" class="si-card__note">
                {{ tx("panel.steam.valueSample") }}
              </p>
            </div>
          </template>
        </section>

        <section class="si-card si-card--plat">
          <div class="si-plat__glow" aria-hidden="true" />
          <div class="si-card__icon si-card__icon--gold">
            <v-icon icon="mdi-trophy" />
          </div>
          <h2>{{ tx("panel.steam.boardTitle") }}</h2>
          <p class="si-card__big si-card__big--plat">{{ platinumCount }}</p>
          <p class="si-card__meta">{{ tx("panel.steam.platinum") }} · %100</p>
          <p class="si-card__hint si-card__hint--plat">
            {{ tx("panel.steam.boardHint") }}
          </p>
          <NuxtLink
            class="si-card__link"
            to="/dashboard/platforms/steam?tab=achievements"
          >
            {{ tx("panel.steam.boardCta") }}
            <v-icon icon="mdi-chevron-right" size="18" />
          </NuxtLink>
        </section>
      </div>

      <section v-if="yearRecap" class="si-card si-card--wide si-year">
        <div class="si-year__top">
          <div>
            <div class="si-card__icon"><v-icon icon="mdi-calendar-star" /></div>
            <h2>
              {{
                tx("panel.steam.yearTitle").replace(
                  "{year}",
                  String(yearRecap.year)
                )
              }}
            </h2>
            <p class="si-card__hint">{{ tx("panel.steam.yearHint") }}</p>
          </div>
          <button type="button" class="si-btn" @click="copyYearCard">
            <v-icon icon="mdi-content-copy" size="18" />
            {{ tx("panel.steam.yearCopy") }}
          </button>
        </div>
        <div class="si-year__stats">
          <div>
            <strong>{{ yearRecap.gamesTouched }}</strong>
            <span>{{ tx("panel.steam.yearGames") }}</span>
          </div>
          <div>
            <strong>{{ yearRecap.hoursApprox }}</strong>
            <span>{{ tx("panel.steam.hours") }}</span>
          </div>
          <div>
            <strong>{{ yearRecap.platinumInLibrary }}</strong>
            <span>{{ tx("panel.steam.platinum") }}</span>
          </div>
        </div>
        <ul v-if="yearRecap.topGames.length" class="si-year__top-list">
          <li v-for="(g, i) in yearRecap.topGames" :key="g.appId">
            <span class="si-year__rank">#{{ i + 1 }}</span>
            <div class="si-year__cover">
              <img :src="g.headerUrl" :alt="g.name" />
            </div>
            <div class="si-year__meta">
              <strong :title="g.name">{{ g.name }}</strong>
              <em
                >{{ steamHours(g.playtimeForeverMin) }}
                {{ tx("panel.steam.hours") }}</em
              >
            </div>
          </li>
        </ul>
        <p class="si-card__note">{{ tx("panel.steam.yearNote") }}</p>
      </section>

      <section class="si-card si-card--wide si-friends-card">
        <div class="si-friends-card__head">
          <div class="si-card__title-block">
            <div class="si-card__icon"><v-icon icon="mdi-account-group" /></div>
            <div>
              <h2>{{ tx("panel.steam.friendsTitle") }}</h2>
              <p class="si-card__hint">{{ tx("panel.steam.friendsHint") }}</p>
            </div>
          </div>
          <span
            v-if="!friendsLive.loading && !friendsLive.privateOrFail"
            class="si-friends-card__count"
          >
            {{
              tx("panel.steam.friendsMeta").replace(
                "{n}",
                String(friendsLive.total)
              )
            }}
          </span>
        </div>

        <p v-if="friendsLive.loading" class="si-card__muted">…</p>
        <p v-else-if="friendsLive.privateOrFail" class="si-card__meta">
          {{ tx("panel.steam.friendsPrivate") }}
        </p>
        <div v-else-if="!friendsLive.playing.length" class="si-friends-empty">
          <div class="si-friends-empty__ico" aria-hidden="true">
            <v-icon icon="mdi-gamepad-variant-outline" size="28" />
          </div>
          <div>
            <strong>{{ tx("panel.steam.friendsEmpty") }}</strong>
            <p>
              {{
                tx("panel.steam.friendsEmptyHint").replace(
                  "{n}",
                  String(friendsLive.total)
                )
              }}
            </p>
          </div>
        </div>
        <ul v-else class="si-friends">
          <li v-for="f in friendsLive.playing.slice(0, 12)" :key="f.steamId">
            <img v-if="f.avatarfull" :src="f.avatarfull" alt="" />
            <span v-else class="si-friends__av" aria-hidden="true">
              {{ (f.personaname || "?").slice(0, 1) }}
            </span>
            <div>
              <strong>{{ f.personaname }}</strong>
              <em>
                <span class="si-live" aria-hidden="true" />
                {{ f.gameExtraInfo || tx("panel.steam.friendsPlayingNow") }}
              </em>
            </div>
          </li>
        </ul>
      </section>

      <section class="si-card si-card--wide">
        <div class="si-card__icon"><v-icon icon="mdi-radar" /></div>
        <h2>{{ tx("panel.steam.radarTitle") }}</h2>
        <p class="si-card__hint">{{ tx("panel.steam.radarHint") }}</p>
        <p v-if="radarMatch.loading" class="si-card__muted">…</p>
        <template v-else>
          <ul v-if="radarMissingRows.length" class="si-match">
            <li v-for="r in radarMissingRows" :key="r.id">
              <div class="si-match__cover">
                <img :src="r.imageUrl" :alt="r.name" loading="lazy" />
              </div>
              <div class="si-match__meta">
                <strong :title="r.name">{{ r.name }}</strong>
                <span v-if="r.onWishlist" class="si-pill">
                  {{ tx("panel.steam.radarWish") }}
                </span>
              </div>
            </li>
          </ul>
          <p v-else class="si-card__meta">
            {{
              radarMatch.rows.length
                ? tx("panel.steam.radarAllOwned")
                : tx("panel.steam.radarEmpty")
            }}
          </p>
        </template>
      </section>

    </div>
  </div>
</template>

<style scoped>
.si {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}
.si__sub {
  margin: 0;
  color: var(--panel-muted, #64748b);
  font-size: 0.92rem;
  line-height: 1.45;
  max-width: 40rem;
}
.si-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.85rem;
  border-radius: 10px;
  border: 1px solid var(--panel-card-border, rgb(15 23 42 / 0.12));
  background: var(--panel-card, #e8edf4);
  color: var(--panel-text, #0f172a);
  font-weight: 600;
  font-size: 0.88rem;
  text-decoration: none;
  cursor: pointer;
}
.si-msg {
  padding: 1rem;
  border-radius: 14px;
  border: 1px dashed var(--panel-border);
  color: var(--panel-muted);
  text-align: center;
}
.si-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.si-hero-row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); /* ~col-8 / col-4 */
  gap: 1rem;
  align-items: stretch;
}
@media (max-width: 860px) {
  .si-hero-row {
    grid-template-columns: 1fr;
  }
}
.si-card {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 1.15rem 1.2rem 1.25rem;
  border-radius: 16px;
  border: 1px solid var(--panel-card-border, rgb(15 23 42 / 0.1));
  background: var(--panel-card, #0c1220);
  box-shadow: var(--panel-card-shadow, none);
  color: var(--panel-text, #e8eef7);
  position: relative;
  overflow: hidden;
}
.si-card--wide {
  grid-column: 1 / -1;
}
.si-card--value {
  min-height: 14.5rem;
  justify-content: space-between;
  background:
    radial-gradient(
      120% 90% at 0% 0%,
      color-mix(in srgb, var(--panel-accent, #69f0ae) 14%, transparent),
      transparent 55%
    ),
    var(--panel-card, #0c1220);
  border-color: color-mix(in srgb, var(--panel-accent, #69f0ae) 28%, transparent);
}
.si-card--plat {
  min-height: 11.5rem;
  align-items: flex-start;
  background:
    radial-gradient(
      100% 80% at 100% 0%,
      rgb(245 215 110 / 0.16),
      transparent 55%
    ),
    var(--panel-card, #0c1220);
  border-color: rgb(245 215 110 / 0.35);
}
.si-plat__glow {
  position: absolute;
  inset: auto -20% -40% auto;
  width: 10rem;
  height: 10rem;
  border-radius: 999px;
  background: rgb(245 215 110 / 0.12);
  filter: blur(28px);
  pointer-events: none;
}
.si-skel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}
.si-skel__card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 1.15rem 1.2rem 1.25rem;
  border-radius: 16px;
  border: 1px solid var(--panel-card-border, rgb(15 23 42 / 0.12));
  background: var(--panel-card, #0c1220);
  min-height: 8rem;
}
.si-skel__card--value {
  min-height: 13rem;
}
.si-skel__card--plat {
  min-height: 13rem;
}
.si-skel__card--wide {
  min-height: 14rem;
}
.si-skel__card--grow {
  flex: 1;
}
.si-skel__shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 20%,
    color-mix(in srgb, var(--panel-accent, #69f0ae) 10%, transparent) 48%,
    transparent 72%
  );
  background-size: 220% 100%;
  animation: si-skel-shine 1.35s ease-in-out infinite;
  pointer-events: none;
}
.si-skel__row {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
}
.si-skel__stack {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}
.si-skel__ico {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 10px;
  background: color-mix(in srgb, var(--panel-muted, #94a3b8) 22%, transparent);
  flex-shrink: 0;
}
.si-skel__chip {
  width: 4.5rem;
  height: 1.6rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--panel-muted, #94a3b8) 18%, transparent);
  margin-left: auto;
  flex-shrink: 0;
}
.si-skel__line {
  display: block;
  height: 0.7rem;
  border-radius: 6px;
  background: color-mix(in srgb, var(--panel-muted, #94a3b8) 20%, transparent);
}
.si-skel__line--lg {
  width: 72%;
}
.si-skel__line--md {
  width: 42%;
}
.si-skel__line--sm {
  width: 55%;
}
.si-skel__line--xs {
  width: 28%;
  height: 0.55rem;
}
.si-skel__price {
  display: block;
  width: 55%;
  height: 2.6rem;
  margin-top: 0.55rem;
  border-radius: 10px;
  background: color-mix(in srgb, var(--panel-accent, #69f0ae) 18%, transparent);
}
.si-skel__price--sm {
  width: 35%;
  height: 2.1rem;
}
.si-skel__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.65rem;
  margin-top: 0.35rem;
}
.si-skel__stats i {
  display: block;
  height: 4.2rem;
  border-radius: 12px;
  background: color-mix(in srgb, var(--panel-muted, #94a3b8) 14%, transparent);
}
.si-skel__games {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.35rem;
}
.si-skel__games--dense {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.55rem;
}
@media (max-width: 1100px) {
  .si-skel__games {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 700px) {
  .si-skel__games,
  .si-skel__games--dense {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.si-skel__game {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  border-radius: 12px;
  overflow: hidden;
  background: color-mix(in srgb, var(--panel-muted, #94a3b8) 10%, transparent);
  padding-bottom: 0.55rem;
}
.si-skel__cover {
  display: block;
  width: 100%;
  aspect-ratio: 460 / 215;
  background: color-mix(in srgb, var(--panel-muted, #94a3b8) 22%, transparent);
}
.si-skel__game .si-skel__line {
  margin-inline: 0.55rem;
}
.si-skel__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.55rem;
}
.si-skel__pills i {
  width: 11rem;
  height: 3.4rem;
  border-radius: 12px;
  background: color-mix(in srgb, var(--panel-muted, #94a3b8) 16%, transparent);
}
@keyframes si-skel-shine {
  0% {
    background-position: 120% 0;
  }
  100% {
    background-position: -80% 0;
  }
}
.si-card h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
}
.si-card__title-block {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  min-width: 0;
}
.si-card__title-block .si-card__hint {
  margin-top: 0.2rem;
}
.si-card__head-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}
.si-card__foot {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.si-card__big--value {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  font-size: clamp(3.6rem, 8.5vw, 5.25rem);
  margin: 0.35rem 0;
  letter-spacing: -0.05em;
  line-height: 0.95;
  font-weight: 900;
}
.si-card__big--plat {
  font-size: clamp(2.4rem, 4vw, 3rem);
  color: #f5d76e;
  margin: 0.15rem 0;
}
.si-card__hint--plat {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.si-fx {
  display: inline-flex;
  padding: 0.15rem;
  border-radius: 999px;
  border: 1px solid var(--panel-border);
  background: var(--panel-soft);
  gap: 0.1rem;
}
.si-fx__btn {
  border: 0;
  background: transparent;
  color: var(--panel-muted);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  cursor: pointer;
}
.si-fx__btn--on {
  background: var(--panel-accent);
  color: var(--panel-accent-ink, #fff);
}
.si-fx__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.si-card__icon {
  display: inline-flex;
  width: 2.2rem;
  height: 2.2rem;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--panel-icon-bg, rgb(16 185 129 / 0.12));
  color: var(--panel-accent, #059669);
  border: 1px solid var(--panel-icon-border, rgb(16 185 129 / 0.28));
}
.si-card__icon--gold {
  background: rgb(245 215 110 / 0.18);
  color: #ca8a04;
  border-color: rgb(202 138 4 / 0.35);
}
.si-card__hint,
.si-card__meta,
.si-card__note,
.si-card__muted {
  margin: 0;
  color: var(--panel-muted, #64748b);
  font-size: 0.86rem;
  line-height: 1.4;
}
.si-card__note {
  font-size: 0.78rem;
  opacity: 0.9;
}
.si-card__big {
  margin: 0.15rem 0;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  font-weight: 800;
  color: var(--panel-accent, #059669);
  letter-spacing: -0.02em;
}
.si-card__link {
  margin-top: 0.35rem;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  color: var(--panel-accent, #059669);
  font-weight: 700;
  font-size: 0.88rem;
  text-decoration: none;
}
.si-year__top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: flex-start;
}
.si-year__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 0.5rem 0;
}
.si-year__stats div {
  flex: 1 1 6rem;
  padding: 0.7rem 0.85rem;
  border-radius: 12px;
  background: var(--panel-soft, rgb(0 0 0 / 0.22));
  border: 1px solid var(--panel-border, rgb(15 23 42 / 0.08));
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.si-year__stats strong {
  font-size: 1.35rem;
  font-weight: 800;
}
.si-year__stats span {
  font-size: 0.75rem;
  color: var(--panel-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.si-year__top-list {
  list-style: none;
  margin: 0.85rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}
@media (max-width: 1100px) {
  .si-year__top-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 700px) {
  .si-year__top-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.si-year__top-list li {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0;
  border-radius: 14px;
  background: var(--panel-soft);
  border: 1px solid var(--panel-border);
  overflow: hidden;
  position: relative;
}
.si-year__rank {
  position: absolute;
  top: 0.45rem;
  left: 0.45rem;
  z-index: 1;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 800;
  background: rgb(0 0 0 / 0.55);
  color: #eafff2;
  backdrop-filter: blur(4px);
}
.si-year__cover {
  width: 100%;
  aspect-ratio: 460 / 215;
  background: #0a1210;
  line-height: 0;
}
.si-year__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.si-year__meta {
  padding: 0 0.7rem 0.75rem;
  min-width: 0;
}
.si-year__meta strong {
  display: block;
  font-size: 0.88rem;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.si-year__meta em {
  font-style: normal;
  font-size: 0.78rem;
  color: var(--panel-muted);
  font-weight: 600;
}
.si-friends-card__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}
.si-friends-card__count {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--panel-muted);
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: var(--panel-soft);
  border: 1px solid var(--panel-border);
}
.si-friends-empty {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-top: 0.85rem;
  padding: 1rem 1.1rem;
  border-radius: 14px;
  background: var(--panel-soft);
  border: 1px dashed var(--panel-border);
}
.si-friends-empty__ico {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--panel-icon-bg);
  color: var(--panel-accent);
  border: 1px solid var(--panel-icon-border);
}
.si-friends-empty strong {
  display: block;
  font-size: 0.98rem;
  margin-bottom: 0.2rem;
}
.si-friends-empty p {
  margin: 0;
  font-size: 0.84rem;
  color: var(--panel-muted);
  line-height: 1.4;
}
.si-friends,
.si-match,
.si-sales {
  list-style: none;
  margin: 0.85rem 0 0;
  padding: 0;
}
.si-friends {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.65rem;
}
.si-friends li,
.si-owner {
  display: flex;
  gap: 0.7rem;
  align-items: center;
}
.si-friends li {
  padding: 0.7rem 0.8rem;
  border-radius: 14px;
  background: var(--panel-soft);
  border: 1px solid var(--panel-border);
  min-width: 0;
}
.si-friends img,
.si-friends__av,
.si-owner img {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  object-fit: cover;
  flex-shrink: 0;
}
.si-friends__av {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--panel-icon-bg);
  color: var(--panel-accent);
  font-weight: 800;
  font-size: 0.9rem;
}
.si-friends strong,
.si-owner strong {
  display: block;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.si-friends em,
.si-owner em {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-style: normal;
  font-size: 0.78rem;
  color: var(--panel-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.si-friends li > div,
.si-owner > div {
  min-width: 0;
}
.si-live {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 3px rgb(34 197 94 / 0.25);
}
.si-match {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 0.7rem;
  margin-top: 0.85rem;
}
.si-match li {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  overflow: hidden;
  border-radius: 14px;
  background: var(--panel-soft);
  border: 1px solid var(--panel-border);
  min-width: 0;
  transition: border-color 0.15s ease, transform 0.15s ease;
}
.si-match li:hover {
  border-color: color-mix(in srgb, var(--panel-accent) 40%, transparent);
  transform: translateY(-1px);
}
.si-match__cover {
  aspect-ratio: 3 / 4;
  background: color-mix(in srgb, var(--panel-soft) 70%, #000);
  overflow: hidden;
}
.si-match__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.si-match__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
  padding: 0.55rem 0.65rem 0.7rem;
  min-width: 0;
}
.si-match__meta strong {
  display: block;
  width: 100%;
  font-size: 0.84rem;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.si-match--ok {
  border-color: color-mix(in srgb, var(--panel-accent) 35%, transparent);
}
.si-pill {
  flex-shrink: 0;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
  background: var(--panel-soft);
  color: var(--panel-muted);
  border: 1px solid var(--panel-border);
}
.si-pill--ok {
  background: var(--panel-icon-bg);
  color: var(--panel-accent);
  border-color: var(--panel-icon-border);
}
.si-sales li {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.45rem 0.55rem;
  border-radius: 12px;
  background: var(--panel-soft);
  border: 1px solid var(--panel-border);
}
.si-sales img {
  width: 96px;
  height: 45px;
  object-fit: cover;
  border-radius: 8px;
}
.si-sales__meta {
  flex: 1;
  min-width: 0;
}
.si-sales__meta strong {
  display: block;
  font-size: 0.88rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.si-sales__meta em {
  font-style: normal;
  font-size: 0.75rem;
  color: var(--panel-muted);
}
.si-sales__pct {
  font-weight: 800;
  color: #059669;
  font-size: 0.95rem;
}
.si-sales__link {
  color: var(--panel-muted);
}
</style>
