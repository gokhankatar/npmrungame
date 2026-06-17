<script lang="ts" setup>
import axios from "axios";
import type { Youtube_Channel_Stats } from "~/composables/core/interfaces";

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@npmrungame";

const isLoading = ref(true);
const youtubeChannelStats = ref<Youtube_Channel_Stats | null>(null);

function toNumber(raw: number | string | null | undefined): number {
  if (raw == null || raw === "") return 0;
  const n =
    typeof raw === "number" ? raw : Number(String(raw).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return m >= 10 ? `${Math.round(m)}M` : `${m.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1000) {
    const k = n / 1000;
    return k >= 10 ? `${Math.round(k)}K` : `${k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return n.toLocaleString("tr-TR");
}

function progressPercent(value: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((value / goal) * 100));
}

function ringColor(percent: number): string {
  const t = Math.min(1, Math.max(0, percent / 100));
  const r = Math.round(183 + (255 - 183) * t);
  const g = Math.round(28 + (138 - 28) * t);
  const b = Math.round(28 + (128 - 28) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

const statCards = computed(() => {
  const subs = toNumber(youtubeChannelStats.value?.subscriberCount);
  const views = toNumber(youtubeChannelStats.value?.viewCount);
  const videos = toNumber(youtubeChannelStats.value?.videoCount);

  return [
    {
      id: "subs",
      label: "Abone",
      icon: "mdi-youtube",
      value: subs,
      display: formatCompact(subs),
      goal: 100_000,
      goalLabel: "100K",
    },
    {
      id: "views",
      label: "Toplam izlenme",
      icon: "mdi-eye",
      value: views,
      display: formatCompact(views),
      goal: 10_000_000,
      goalLabel: "10M",
    },
    {
      id: "videos",
      label: "Toplam video",
      icon: "mdi-video",
      value: videos,
      display: formatCompact(videos),
      goal: 500,
      goalLabel: "500",
    },
  ].map((card) => {
    const pct = progressPercent(card.value, card.goal);
    return {
      ...card,
      percent: pct,
      color: ringColor(pct),
      hint: `${card.display} / ${card.goalLabel} hedef`,
    };
  });
});

const getYoutubeChannelInfos = async () => {
  try {
    isLoading.value = true;
    const res = await axios.get("/api/youtube-channel-infos");
    youtubeChannelStats.value = res.data.statistics;
  } catch (err: any) {
    console.error("YouTube stats:", err?.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getYoutubeChannelInfos();
});
</script>

<template>
  <section class="home-yt-stats" aria-label="YouTube kanal istatistikleri">
    <div class="home-yt-stats__glow" aria-hidden="true" />

    <div class="home-yt-stats__head">
      <div class="home-yt-stats__brand">
        <div class="home-yt-stats__icon-ring">
          <v-icon icon="mdi-youtube" color="#ff5252" size="22" />
        </div>
        <div>
          <p class="home-yt-stats__eyebrow default-title-letter">npmrungame · YouTube</p>
          <h2 class="home-yt-stats__title default-title-letter">Kanal istatistikleri</h2>
          <p class="home-yt-stats__sub default-title-letter">
            Türkçe 4K oyun kanalı — canlı abone, izlenme ve video sayıları
          </p>
        </div>
      </div>

      <div class="home-yt-stats__actions">
        <span
          v-if="youtubeChannelStats && !isLoading"
          class="home-yt-stats__privacy default-title-letter"
        >
          <v-icon
            :icon="youtubeChannelStats.hiddenSubscriberCount ? 'mdi-eye-off' : 'mdi-eye'"
            size="14"
          />
          Abone {{ youtubeChannelStats.hiddenSubscriberCount ? "gizli" : "açık" }}
        </span>
        <v-btn
          variant="tonal"
          color="red"
          rounded="pill"
          size="small"
          prepend-icon="mdi-youtube"
          class="text-capitalize default-title-letter"
          :ripple="false"
          :href="YOUTUBE_CHANNEL_URL"
          target="_blank"
        >
          Kanala git
        </v-btn>
      </div>
    </div>

    <div class="home-yt-stats__grid">
      <article
        v-for="card in statCards"
        :key="card.id"
        class="home-yt-stat-card"
      >
        <template v-if="isLoading">
          <v-skeleton-loader type="avatar" class="home-yt-stat-card__skel-ring mb-3" />
          <v-skeleton-loader type="text" width="60%" class="mb-1" />
          <v-skeleton-loader type="text" width="40%" />
        </template>

        <template v-else>
          <div class="home-yt-stat-card__ring">
            <v-progress-circular
              :model-value="card.percent"
              :size="58"
              :width="4"
              :color="card.color"
              bg-color="rgba(255, 82, 82, 0.12)"
            >
              <v-icon :icon="card.icon" size="22" :color="card.color" />
            </v-progress-circular>
          </div>

          <p class="home-yt-stat-card__value default-title-letter" :style="{ color: card.color }">
            {{ card.display }}
          </p>
          <p class="home-yt-stat-card__label default-title-letter">{{ card.label }}</p>

          <v-progress-linear
            :model-value="card.percent"
            :color="card.color"
            bg-color="rgba(255, 255, 255, 0.08)"
            rounded
            height="5"
            class="home-yt-stat-card__bar"
          />

          <p class="home-yt-stat-card__hint default-title-letter">
            %{{ card.percent }} · {{ card.hint }}
          </p>
        </template>
      </article>
    </div>
  </section>
</template>

<style scoped>
.home-yt-stats {
  position: relative;
  margin: 2rem 0 0.5rem;
  padding: 1.25rem 1.15rem 1.15rem;
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(
    165deg,
    rgba(255, 82, 82, 0.1) 0%,
    rgba(0, 0, 0, 0.42) 50%,
    rgba(0, 0, 0, 0.52) 100%
  );
  border: 1px solid rgba(255, 82, 82, 0.26);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
}

.home-yt-stats__glow {
  position: absolute;
  top: -35%;
  right: -5%;
  width: min(320px, 60vw);
  height: min(320px, 60vw);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 82, 82, 0.2) 0%, transparent 70%);
  pointer-events: none;
}

.home-yt-stats__head {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.15rem;
}

.home-yt-stats__brand {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  min-width: 0;
  flex: 1 1 220px;
}

.home-yt-stats__icon-ring {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(255, 82, 82, 0.14);
  border: 1px solid rgba(255, 82, 82, 0.32);
}

.home-yt-stats__eyebrow {
  margin: 0;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 138, 128, 0.9);
}

.home-yt-stats__title {
  margin: 0.2rem 0 0;
  font-size: clamp(1rem, 2.2vw, 1.2rem);
  font-weight: 800;
  color: #fff;
}

.home-yt-stats__sub {
  margin: 0.35rem 0 0;
  font-size: 0.76rem;
  color: rgba(255, 255, 255, 0.42);
  line-height: 1.4;
}

.home-yt-stats__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.home-yt-stats__privacy {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 600;
  color: rgba(255, 138, 128, 0.95);
  background: rgba(255, 82, 82, 0.12);
  border: 1px solid rgba(255, 82, 82, 0.22);
}

.home-yt-stats__grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  width: 100%;
}

.home-yt-stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.1rem 0.85rem 1rem;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.32);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  min-height: 11rem;
}

.home-yt-stat-card:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 82, 82, 0.35);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
}

.home-yt-stat-card__ring {
  margin-bottom: 0.65rem;
}

.home-yt-stat-card__value {
  margin: 0;
  font-size: clamp(1.35rem, 3vw, 1.75rem);
  font-weight: 800;
  line-height: 1;
}

.home-yt-stat-card__label {
  margin: 0.35rem 0 0.65rem;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
}

.home-yt-stat-card__bar {
  width: 100%;
  max-width: 140px;
}

.home-yt-stat-card__hint {
  margin: 0.45rem 0 0;
  font-size: 0.62rem;
  color: rgba(255, 138, 128, 0.7);
}

.home-yt-stat-card__skel-ring {
  width: 58px !important;
  height: 58px !important;
  border-radius: 50% !important;
}

@media (max-width: 720px) {
  .home-yt-stats__grid {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }

  .home-yt-stat-card {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    text-align: left;
    min-height: 0;
    padding: 0.85rem 1rem;
    gap: 0 0.85rem;
  }

  .home-yt-stat-card__ring {
    margin-bottom: 0;
    grid-row: span 2;
  }

  .home-yt-stat-card__value {
    flex: 1;
    min-width: 0;
  }

  .home-yt-stat-card__label {
    margin: 0.15rem 0 0;
    flex: 1;
    min-width: 0;
  }

  .home-yt-stat-card__bar {
    width: 100%;
    max-width: none;
    flex: 1 1 100%;
    margin-top: 0.35rem;
  }

  .home-yt-stat-card__hint {
    flex: 1 1 100%;
    margin-top: 0.25rem;
  }
}

@media (min-width: 721px) and (max-width: 959px) {
  .home-yt-stats__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.55rem;
  }

  .home-yt-stat-card {
    padding: 0.95rem 0.5rem 0.85rem;
    min-height: 10rem;
  }

  .home-yt-stat-card__value {
    font-size: 1.25rem;
  }
}

@media (min-width: 960px) {
  .home-yt-stats {
    padding: 1.35rem 1.4rem 1.25rem;
  }

  .home-yt-stats__grid {
    gap: 1rem;
  }
}
</style>
