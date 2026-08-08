<template>
  <section class="home-discover-featured" :class="{ 'home-discover-featured--loading': loading }">
    <template v-if="loading">
      <v-skeleton-loader type="image" class="home-discover-featured__loader" />
      <div class="home-discover-featured__rail-skel">
        <v-skeleton-loader
          v-for="n in 5"
          :key="n"
          type="image"
          class="home-discover-featured__rail-skel-item"
        />
      </div>
    </template>

    <template v-else-if="featured">
      <div class="home-discover-featured__spotlight">
        <div v-if="featured.background_image" class="home-discover-featured__media" aria-hidden="true">
          <img
            :src="featured.background_image"
            alt=""
            class="home-discover-featured__bg home-discover-featured__bg--blur"
            loading="lazy"
          />
          <img
            :src="featured.background_image"
            :alt="featured.name"
            class="home-discover-featured__bg home-discover-featured__bg--main"
            loading="lazy"
          />
        </div>

        <div class="home-discover-featured__shade" aria-hidden="true" />
        <div class="home-discover-featured__vignette" aria-hidden="true" />

        <div class="home-discover-featured__inner">
          <div class="home-discover-featured__copy">
            <span class="home-discover-featured__eyebrow default-title-letter">
              <v-icon icon="mdi-compass-outline" size="14" />
              Keşfet seçkisi
            </span>

            <h3 class="home-discover-featured__title default-title-letter">
              {{ featured.name }}
            </h3>

            <p v-if="featuredGenres" class="home-discover-featured__sub default-title-letter mb-0">
              {{ featuredGenres }}
            </p>

            <div class="home-discover-featured__meta">
              <span
                v-if="featuredBadge"
                class="home-discover-featured__score"
                :style="{ background: featuredBadge.bg, color: featuredBadge.fg }"
                :aria-label="`Metacritic ${featuredBadge.value}`"
              >
                {{ featuredBadge.value }}
              </span>
              <span v-if="featuredYear" class="home-discover-featured__year default-title-letter">
                {{ featuredYear }}
              </span>
            </div>

            <div class="home-discover-featured__actions">
              <v-btn
                color="green-accent-2"
                variant="flat"
                rounded="pill"
                class="text-black font-weight-bold text-capitalize default-title-letter"
                prepend-icon="mdi-information-outline"
                text="Oyun detayı"
                :ripple="false"
                @click="onSelect(featured)"
              />
              <v-btn
                variant="tonal"
                rounded="pill"
                color="grey-lighten-1"
                class="text-capitalize default-title-letter"
                append-icon="mdi-arrow-right"
                text="Keşfete git"
                :ripple="false"
                to="/discover"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-if="railGames.length" class="home-discover-featured__rail" role="list">
        <button
          v-for="(game, index) in railGames"
          :key="game.id ?? index"
          type="button"
          class="home-discover-featured__pick"
          role="listitem"
          :aria-label="game.name"
          @click="onSelect(game)"
        >
          <div class="home-discover-featured__pick-art">
            <img
              v-if="game.background_image"
              :src="game.background_image"
              :alt="game.name"
              loading="lazy"
            />
            <span
              v-if="badgeFor(game)"
              class="home-discover-featured__pick-score"
              :style="{
                background: badgeFor(game)!.bg,
                color: badgeFor(game)!.fg,
              }"
            >
              {{ badgeFor(game)!.value }}
            </span>
            <div class="home-discover-featured__pick-info">
              <span class="home-discover-featured__pick-name default-title-letter">
                {{ game.name }}
              </span>
              <span class="home-discover-featured__pick-year default-title-letter">
                {{ game.released ? new Date(game.released).getFullYear() : "—" }}
              </span>
            </div>
          </div>
        </button>
      </div>

      <div class="home-discover-featured__genres">
        <button
          v-for="genre in genreLinks"
          :key="genre.slug"
          type="button"
          class="home-discover-featured__genre default-title-letter"
          @click="goGenre(genre)"
        >
          {{ genre.name }}
        </button>
      </div>
    </template>
  </section>
</template>

<script lang="ts" setup>
import {
  formatGameGenreLabels,
  getMetacriticBadge,
} from "~/composables/data/handleData";
import store from "~/store/store";
import { game_genres } from "~/utils/Game_Genres";
import { useDiscoverStore } from "~/store/queryStore";

const props = defineProps<{
  games: any[];
  loading?: boolean;
  onSelect: (game: any) => void;
}>();

const router = useRouter();
const _store = store();
const discoverStore = useDiscoverStore();

const featured = computed(() => props.games?.[0] ?? null);
const railGames = computed(() => (props.games ?? []).slice(1, 6));

const featuredBadge = computed(() => getMetacriticBadge(featured.value?.metacritic));
const featuredYear = computed(() =>
  featured.value?.released ? new Date(featured.value.released).getFullYear() : null
);
const featuredGenres = computed(() =>
  featured.value ? formatGameGenreLabels(featured.value.genres, 3) : ""
);

const genreLinks = computed(() => game_genres.slice(0, 5));

const badgeFor = (game: any) => getMetacriticBadge(game?.metacritic);

const goGenre = (genre: (typeof game_genres)[number]) => {
  _store.setActiveGameGenre(genre.slug, genre.name, genre.type);
  discoverStore.lastQuery = {};
  router.push(`/discover/${genre.slug}-games`);
};
</script>

<style scoped>
.home-discover-featured {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.home-discover-featured__loader {
  width: 100%;
  min-height: clamp(240px, 36vh, 360px);
  border-radius: 18px;
}

.home-discover-featured__rail-skel {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.65rem;
}

.home-discover-featured__rail-skel-item {
  aspect-ratio: 2 / 3;
  border-radius: 12px;
}

.home-discover-featured__spotlight {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  min-height: clamp(280px, 40vh, 400px);
  border: 1px solid rgba(105, 240, 174, 0.22);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
  background: #0a0f16;
}

.home-discover-featured__media {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.home-discover-featured__bg--blur {
  position: absolute;
  inset: -8%;
  width: 116%;
  height: 116%;
  object-fit: cover;
  object-position: center top;
  filter: blur(28px) brightness(0.42) saturate(1.2);
  transform: scale(1.05);
}

.home-discover-featured__bg--main {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: auto;
  width: min(48%, 480px);
  height: 100%;
  object-fit: cover;
  object-position: center top;
  mask-image: linear-gradient(90deg, transparent 0%, #000 22%, #000 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 22%, #000 100%);
}

.home-discover-featured__shade {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgba(6, 10, 16, 0.97) 0%,
    rgba(6, 10, 16, 0.82) 38%,
    rgba(6, 10, 16, 0.35) 68%,
    rgba(6, 10, 16, 0.2) 100%
  );
}

.home-discover-featured__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, transparent 55%, rgba(6, 10, 16, 0.55) 100%);
}

.home-discover-featured__inner {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  min-height: inherit;
  padding: clamp(1.15rem, 3.5vw, 2rem);
}

.home-discover-featured__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.55rem;
  max-width: min(520px, 100%);
}

.home-discover-featured__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #69f0ae;
}

.home-discover-featured__title {
  margin: 0;
  font-size: clamp(1.35rem, 3.2vw, 2.1rem);
  font-weight: 800;
  line-height: 1.15;
  color: #fff;
}

.home-discover-featured__sub {
  font-size: 0.86rem;
  color: rgba(255, 255, 255, 0.58);
  text-transform: lowercase;
}

.home-discover-featured__meta {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.home-discover-featured__score {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.15rem;
  height: 2.15rem;
  padding: 0 0.4rem;
  border-radius: 7px;
  font-size: 0.9rem;
  font-weight: 800;
  line-height: 1;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  flex-shrink: 0;
}

.home-discover-featured__year {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.62);
  line-height: 1;
}

.home-discover-featured__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.35rem;
}

.home-discover-featured__rail {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.65rem;
}

.home-discover-featured__pick {
  display: block;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  min-width: 0;
  width: 100%;
}

.home-discover-featured__pick-art {
  position: relative;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #0a0e14;
  transition:
    border-color 0.22s ease,
    transform 0.22s ease,
    box-shadow 0.22s ease;
}

.home-discover-featured__pick-art::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent 42%,
    rgba(0, 0, 0, 0.55) 70%,
    rgba(0, 0, 0, 0.92) 100%
  );
}

.home-discover-featured__pick-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
}

.home-discover-featured__pick:hover .home-discover-featured__pick-art {
  border-color: rgba(105, 240, 174, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4);
}

.home-discover-featured__pick-score {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
  min-width: 1.65rem;
  height: 1.65rem;
  padding: 0 0.28rem;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 800;
  line-height: 1;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}

.home-discover-featured__pick-info {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.55rem 0.6rem 0.65rem;
  pointer-events: none;
}

.home-discover-featured__pick-name {
  font-size: 0.74rem;
  font-weight: 650;
  color: #fff;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.home-discover-featured__pick-year {
  font-size: 0.66rem;
  color: rgba(255, 255, 255, 0.55);
}

.home-discover-featured__genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.home-discover-featured__genre {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.72rem;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.home-discover-featured__genre:hover {
  border-color: rgba(105, 240, 174, 0.4);
  background: rgba(105, 240, 174, 0.08);
  color: #69f0ae;
}

@media (max-width: 959px) {
  .home-discover-featured__bg--main {
    width: 100%;
    left: 0;
    right: 0;
    opacity: 0.55;
    mask-image: linear-gradient(180deg, #000 0%, #000 42%, transparent 100%);
    -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 42%, transparent 100%);
  }

  .home-discover-featured__shade {
    background: linear-gradient(
      180deg,
      rgba(6, 10, 16, 0.15) 0%,
      rgba(6, 10, 16, 0.82) 52%,
      rgba(6, 10, 16, 0.96) 100%
    );
  }

  .home-discover-featured__rail {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .home-discover-featured__pick:nth-child(n + 4) {
    display: none;
  }
}

@media (max-width: 599px) {
  .home-discover-featured__rail {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .home-discover-featured__pick:nth-child(n + 3) {
    display: none;
  }

  .home-discover-featured__rail-skel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .home-discover-featured__actions {
    width: 100%;
  }

  .home-discover-featured__actions :deep(.v-btn) {
    flex: 1 1 auto;
  }
}
</style>
