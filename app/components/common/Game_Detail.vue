<template>
  <div class="game-detail-page">
    <header class="gd-hero">
      <div class="gd-hero__media" aria-hidden="true">
        <img v-if="atmosphereImage" :src="atmosphereImage" alt="" class="gd-hero__bg" />
        <div class="gd-hero__veil" />
        <div class="gd-hero__grid" />
      </div>

      <div class="gd-hero__top">
        <button type="button" class="gd-back" @click="goBackToDiscover">
          <v-icon icon="mdi-arrow-left" size="18" />
          <span>Panele dön</span>
        </button>
      </div>

      <div class="gd-hero__stage">
        <template v-if="isGettingGame">
          <div class="gd-hero__skel">
            <v-skeleton-loader type="image" class="gd-poster-skel" />
            <div class="gd-hero__skel-copy">
              <v-skeleton-loader type="heading" width="65%" class="bg-transparent mb-3" />
              <v-skeleton-loader type="chip" width="40%" class="bg-transparent mb-2" />
              <v-skeleton-loader type="text" width="70%" class="bg-transparent" />
            </div>
          </div>
        </template>

        <template v-else-if="game">
          <button
            type="button"
            class="gd-poster"
            :aria-label="`${game.name} kapak`"
            @click="openImgDetail(posterImage)"
          >
            <img :src="posterImage" :alt="game.name" loading="eager" />
            <span class="gd-poster__hint">
              <v-icon icon="mdi-magnify-plus-outline" size="15" />
            </span>
          </button>

          <div class="gd-hero__info">
            <div class="gd-hero__chips">
              <span v-if="releaseYear" class="gd-chip gd-chip--accent">{{ releaseYear }}</span>
              <span
                v-for="(genre, i) in (game.genres || []).slice(0, 3)"
                :key="`g-${i}`"
                class="gd-chip"
              >
                {{ genre.name }}
              </span>
            </div>

            <h1 class="gd-title">{{ game.name }}</h1>

            <p v-if="shortDevelopers" class="gd-byline">
              <span>{{ shortDevelopers }}</span>
              <template v-if="shortPublishers">
                <span class="gd-byline__dot">·</span>
                <span>{{ shortPublishers }}</span>
              </template>
            </p>

            <div class="gd-scoreboard">
              <button
                v-if="game.metacritic"
                type="button"
                class="gd-meter"
                :class="`gd-meter--${metacriticTier}`"
                @click="handleMetacriticUrl"
              >
                <strong>{{ game.metacritic }}</strong>
                <span>
                  <img
                    v-if="game.metacritic >= 90"
                    :src="fireAnimation"
                    alt=""
                    class="gd-meter__fire"
                  />
                  Eleştirmen
                </span>
              </button>

              <div v-if="game.rating" class="gd-meter gd-meter--community">
                <strong>{{ Number(game.rating).toFixed(1) }}</strong>
                <span>
                  <v-icon icon="mdi-star" size="12" />
                  Topluluk
                </span>
              </div>

              <div v-if="platformIcons.length" class="gd-meter gd-meter--soft">
                <div class="gd-meter__icons">
                  <v-icon
                    v-for="icon in platformIcons"
                    :key="icon"
                    :icon="icon"
                    size="18"
                  />
                </div>
                <span>Platform</span>
              </div>
            </div>

            <div v-if="storeLinks.length" class="gd-store-row">
              <a
                v-for="store in storeLinks"
                :key="store.name"
                :href="store.url"
                target="_blank"
                rel="noopener noreferrer"
                class="gd-store"
              >
                <v-icon :icon="store.icon" size="16" />
                {{ store.name }}
              </a>
            </div>
          </div>
        </template>
      </div>
    </header>

    <div class="gd-body">
      <!-- Bento screenshots -->
      <section v-if="isGettingScreenshots || displayShots.length" class="gd-gallery">
        <div class="gd-section-head">
          <h2 class="gd-section-label">Görseller</h2>
          <span v-if="displayShots.length" class="gd-section-meta">
            {{ displayShots.length }} kare
          </span>
        </div>

        <div v-if="isGettingScreenshots" class="gd-bento">
          <div v-for="n in 5" :key="n" class="gd-bento__cell gd-bento__cell--skel">
            <v-skeleton-loader type="image" class="w-100 h-100" />
          </div>
        </div>
        <div v-else class="gd-bento">
          <button
            v-for="(shot, index) in displayShots"
            :key="index"
            type="button"
            class="gd-bento__cell"
            :class="{ 'gd-bento__cell--hero': index === 0 }"
            :aria-label="`Ekran görüntüsü ${index + 1}`"
            @click="openImgDetail(shot)"
          >
            <img :src="shot" alt="" loading="lazy" />
          </button>
        </div>
      </section>

      <section class="gd-split">
        <div class="gd-split__main">
          <article v-if="isGettingGame || summaryHtml" class="gd-card">
            <h2 class="gd-section-label">Özet</h2>
            <div v-if="isGettingGame" class="d-flex flex-column ga-2">
              <v-skeleton-loader v-for="n in 4" :key="n" type="text" width="100%" />
            </div>
            <div v-else class="gd-prose" v-html="summaryHtml" />
          </article>

          <article v-if="storylineHtml" class="gd-card">
            <h2 class="gd-section-label">Hikâye</h2>
            <div class="gd-prose" v-html="storylineHtml" />
          </article>
        </div>

        <aside class="gd-card gd-facts">
          <h2 class="gd-section-label">Bilgiler</h2>

          <div v-if="isGettingGame" class="d-flex flex-column ga-3">
            <v-skeleton-loader v-for="n in 5" :key="n" type="chip" width="100%" />
          </div>

          <dl v-else class="gd-facts__list">
            <div v-if="game?.metacritic" class="gd-fact">
              <dt>Eleştirmen puanı</dt>
              <dd>
                <span class="gd-mc" :class="`gd-mc--${metacriticTier}`">
                  {{ game.metacritic }}
                </span>
              </dd>
            </div>

            <div v-if="game?.rating" class="gd-fact">
              <dt>Topluluk</dt>
              <dd>{{ Number(game.rating).toFixed(1) }} / 5</dd>
            </div>

            <div v-if="game?.released" class="gd-fact">
              <dt>Çıkış</dt>
              <dd>{{ formatReleaseDate(game.released) }}</dd>
            </div>

            <div v-if="game?.developers?.[0]" class="gd-fact">
              <dt>Geliştirici</dt>
              <dd class="gd-tags">
                <span v-for="(d, i) in game.developers" :key="i">{{ d.name }}</span>
              </dd>
            </div>

            <div v-if="game?.publishers?.[0]" class="gd-fact">
              <dt>Yayıncı</dt>
              <dd class="gd-tags">
                <span v-for="(p, i) in game.publishers" :key="i">{{ p.name }}</span>
              </dd>
            </div>

            <div v-if="platformNames.length" class="gd-fact">
              <dt>Platformlar</dt>
              <dd class="gd-tags">
                <span v-for="(name, i) in platformNames" :key="i">{{ name }}</span>
              </dd>
            </div>

            <div v-if="game?.genres?.[0]" class="gd-fact">
              <dt>Türler</dt>
              <dd class="gd-tags">
                <span v-for="(g, i) in game.genres" :key="i">{{ g.name }}</span>
              </dd>
            </div>

            <div v-if="game?.tags?.[0]" class="gd-fact">
              <dt>Etiketler</dt>
              <dd class="gd-tags gd-tags--soft">
                <span v-for="(tag, i) in game.tags.slice(0, 12)" :key="i">
                  {{ tag.name }}
                </span>
              </dd>
            </div>

            <div v-if="game?.website" class="gd-fact">
              <dt>Website</dt>
              <dd>
                <a
                  :href="game.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="gd-ext"
                >
                  {{ formatWebsiteHost(game.website) }}
                  <v-icon icon="mdi-open-in-new" size="12" />
                </a>
              </dd>
            </div>

            <div v-if="storeLinks.length" class="gd-fact">
              <dt>Mağazalar</dt>
              <dd class="gd-tags">
                <a
                  v-for="store in storeLinks"
                  :key="`f-${store.name}`"
                  :href="store.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="gd-tag-link"
                >
                  {{ store.name }}
                </a>
              </dd>
            </div>
          </dl>
        </aside>
      </section>

      <!-- Collection -->
      <section v-if="!isGettingGame" class="gd-collection-section">
        <v-skeleton-loader
          v-if="isGettingGameStatus"
          type="card"
          class="gd-collection rounded-xl"
          height="96"
        />

        <div
          v-else-if="gameCollectionStatus && collectionPublicInfo"
          class="gd-collection gd-collection--found"
          :style="{ '--gd-collection-accent': collectionPublicInfo.color }"
        >
          <div class="gd-collection__icon">
            <v-icon
              :icon="collectionPublicInfo.icon"
              size="28"
              :color="collectionPublicInfo.color"
            />
          </div>
          <div class="gd-collection__copy">
            <p class="gd-collection__eyebrow">npmrungame listelerinde</p>
            <h3 class="gd-collection__title">{{ collectionPublicInfo.title }}</h3>
            <p class="gd-collection__msg">{{ collectionPublicInfo.message }}</p>
          </div>
          <NuxtLink
            v-if="collectionPublicInfo.path"
            :to="collectionPublicInfo.path"
            class="gd-collection__cta"
          >
            Listeyi gör
            <v-icon icon="mdi-arrow-right" size="16" />
          </NuxtLink>
        </div>

        <div v-else class="gd-collection gd-collection--empty">
          <div class="gd-collection__icon">
            <v-icon icon="mdi-bookmark-plus-outline" size="28" />
          </div>
          <div class="gd-collection__copy">
            <p class="gd-collection__eyebrow">npmrungame listelerinde yok</p>
            <h3 class="gd-collection__title">Henüz koleksiyonda değil</h3>
            <p class="gd-collection__msg">
              Beğendiysen topluluğa önerebilirsin.
            </p>
          </div>
          <button
            type="button"
            class="gd-collection__cta gd-collection__cta--primary"
            :disabled="isRecommendingGame"
            @click="addToRecommendGame"
          >
            <v-progress-circular
              v-if="isRecommendingGame"
              indeterminate
              size="16"
              width="2"
              color="#07140f"
            />
            <template v-else>
              <v-icon icon="mdi-heart-plus" size="18" />
              Öner
            </template>
          </button>
        </div>

        <div v-if="_store.isAdmin && gameCollectionStatus" class="gd-admin">
          <Animated_Text
            v-if="getGameStatusTextByGameCollectionStatus(gameCollectionStatus)?.slug_msg"
            :text="getGameStatusTextByGameCollectionStatus(gameCollectionStatus)?.slug_msg!"
            :ms-per-char="50"
            :duration="550"
            :loop="true"
          />
          <v-btn
            :text="getGameStatusTextByGameCollectionStatus(gameCollectionStatus)?.btn_text"
            class="default-title-letter"
            prepend-icon="mdi-cog-outline"
            rounded="xl"
            color="grey-lighten-1"
            variant="tonal"
            :loading="isGettingGameStatus"
            :size="display.smAndDown.value ? 'small' : 'default'"
            :ripple="false"
            block
          />
        </div>
      </section>
    </div>

    <v-dialog v-model="isOpenImgDetail" :max-width="980" class="gd-dialog">
      <div class="img-detail-container">
        <v-btn
          class="close-icon-in-img-detail-container"
          variant="text"
          size="small"
          color="grey-lighten-1"
          icon="mdi-close"
          :ripple="false"
          aria-label="Kapat"
          @click="isOpenImgDetail = false"
        />
        <v-btn
          v-if="canGoPrevImage"
          class="img-detail-nav img-detail-nav--prev"
          variant="tonal"
          size="small"
          color="grey-lighten-1"
          icon="mdi-chevron-left"
          :ripple="false"
          aria-label="Önceki"
          @click="showPrevImage"
        />
        <v-img v-if="currentGalleryImage" rounded="0" :src="currentGalleryImage" cover />
        <v-btn
          v-if="canGoNextImage"
          class="img-detail-nav img-detail-nav--next"
          variant="tonal"
          size="small"
          color="grey-lighten-1"
          icon="mdi-chevron-right"
          :ripple="false"
          aria-label="Sonraki"
          @click="showNextImage"
        />
        <p v-if="galleryImages.length > 1" class="img-detail-counter">
          {{ galleryIndex + 1 }} / {{ galleryImages.length }}
        </p>
      </div>
    </v-dialog>

    <v-dialog v-model="toastModels.toastbar" :max-width="480" class="gd-dialog">
      <div class="successfully-done-container">
        <v-btn
          class="close-icon-in-successfully-done-container"
          icon="mdi-close"
          :ripple="false"
          variant="text"
          color="grey-darken-1"
          size="small"
          @click="toastModels.toastbar = false"
        />
        <v-img
          :class="toastModels?.status === 'warning' ? 'bg-warning rounded-xl mb-2' : 'mb-2'"
          :src="toastModels?.status === 'success' ? successfullyDoneImg : warningImg"
          :width="isSmallScreen ? 56 : 72"
          class="mx-auto"
        />
        <p class="successfully-done-container__msg">{{ toastModels?.msg }}</p>
      </div>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import store from "~/store/store";
import fireAnimation from "~/assets/img/fire_anim.gif";
import {
  getGameCollectionPublicInfo,
  getGameStatusTextByGameCollectionStatus,
  getUniquePlatformIcons,
} from "~/composables/data/handleData";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import successfullyDoneImg from "~/assets/img/successfully_done_anim.gif";
import warningImg from "~/assets/img/warning_anim.gif";
import { useGameCollectionStatus } from "~/composables/data/useGameCollectionStatus";
import Animated_Text from "./Animated_Text.vue";

const STORE_ICONS: Record<string, string> = {
  Steam: "mdi-steam",
  "Epic Games": "mdi-controller",
  GOG: "mdi-shopping-outline",
  "itch.io": "mdi-controller-classic",
  Official: "mdi-web",
};

const { $firestore } = useNuxtApp();
const _store = store();
const route = useRoute();
const router = useRouter();
const display = useDisplay();

/** Store veya URL'den oyun id (spotlight `/game-detail/123` gibi) */
const resolvedGameId = computed(() => {
  const fromStore = _store.active_detailed_game?.id;
  if (fromStore != null && fromStore !== "") return fromStore;
  const param = route.params._game;
  const raw = Array.isArray(param) ? param[0] : param;
  if (raw != null && /^\d+$/.test(String(raw))) return Number(raw);
  return null;
});

const resolvedGameName = computed(
  () => _store.active_detailed_game?.name || null
);

const isSmallScreen = computed(() => display.smAndDown.value);

const isGettingGame = ref(false);
const isGettingScreenshots = ref(false);
const isOpenImgDetail = ref(false);
const isRecommendingGame = ref(false);

const game = ref<any | null>(null);
const imgArr = ref<any[]>([]);
const galleryIndex = ref(0);

const posterImage = computed(
  () =>
    game.value?.cover_image ||
    game.value?.background_image ||
    "https://f4.bcbits.com/img/0016409163_71.jpg"
);

const atmosphereImage = computed(
  () =>
    game.value?.background_image_additional ||
    game.value?.background_image ||
    game.value?.cover_image ||
    ""
);

const displayShots = computed(() => {
  const fromApi = imgArr.value.map((i) => i.image).filter(Boolean);
  if (fromApi.length) return fromApi.slice(0, 8);
  const embedded = (game.value?.short_screenshots ?? [])
    .map((s: any) => s.image)
    .filter(Boolean);
  return embedded.slice(0, 8);
});

const galleryImages = computed(() => {
  const images: string[] = [];
  for (const src of [posterImage.value, atmosphereImage.value, ...displayShots.value]) {
    if (src && !images.includes(src)) images.push(src);
  }
  return images;
});

const currentGalleryImage = computed(
  () => galleryImages.value[galleryIndex.value] ?? null
);
const canGoPrevImage = computed(() => galleryIndex.value > 0);
const canGoNextImage = computed(
  () => galleryIndex.value < galleryImages.value.length - 1
);

const releaseYear = computed(() => {
  if (!game.value?.released) return "";
  return new Date(game.value.released).getFullYear();
});

const platformIcons = computed(() =>
  game.value?.platforms ? getUniquePlatformIcons(game.value.platforms) : []
);

const platformNames = computed(() =>
  (game.value?.platforms ?? [])
    .map((p: any) => p.platform?.name)
    .filter(Boolean)
);

const metacriticTier = computed(() => {
  const score = game.value?.metacritic;
  if (score == null) return "mid";
  if (score >= 90) return "hot";
  if (score >= 75) return "good";
  if (score >= 50) return "mid";
  return "low";
});

const shortDevelopers = computed(() =>
  (game.value?.developers ?? [])
    .slice(0, 2)
    .map((d: { name: string }) => d.name)
    .join(", ")
);

const shortPublishers = computed(() =>
  (game.value?.publishers ?? [])
    .slice(0, 2)
    .map((p: { name: string }) => p.name)
    .join(", ")
);

const summaryHtml = computed(
  () => game.value?.summary_html || game.value?.description || ""
);

const storylineHtml = computed(() => game.value?.storyline_html || "");

const storeLinks = computed(() =>
  (game.value?.stores ?? [])
    .filter((s: any) => s.url && s.store?.name)
    .map((s: any) => ({
      name: s.store.name as string,
      url: s.url as string,
      icon: STORE_ICONS[s.store.name] || "mdi-store-outline",
    }))
);

const toastModels = ref<any>({
  toastbar: false,
  status: "success",
  msg: "",
});

const formatWebsiteHost = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const formatReleaseDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const goBackToDiscover = () => {
  if (import.meta.client && window.history.length > 1) {
    router.back();
    return;
  }
  router.push("/dashboard");
};

const openImgDetail = (src: string | null | undefined) => {
  if (!src) return;
  const idx = galleryImages.value.indexOf(src);
  galleryIndex.value = idx >= 0 ? idx : 0;
  isOpenImgDetail.value = true;
};

const showPrevImage = () => {
  if (canGoPrevImage.value) galleryIndex.value -= 1;
};

const showNextImage = () => {
  if (canGoNextImage.value) galleryIndex.value += 1;
};

const onGalleryKeydown = (event: KeyboardEvent) => {
  if (!isOpenImgDetail.value) return;
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showPrevImage();
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    showNextImage();
  }
};

watch(isOpenImgDetail, (open) => {
  if (!import.meta.client) return;
  if (open) window.addEventListener("keydown", onGalleryKeydown);
  else window.removeEventListener("keydown", onGalleryKeydown);
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener("keydown", onGalleryKeydown);
  }
});

const getGameScreenshots = async () => {
  const id = resolvedGameId.value;
  if (!id && !resolvedGameName.value) return;

  try {
    isGettingScreenshots.value = true;
    const res = await axios.get("/api/game-screenshots", {
      params: {
        id,
        name: resolvedGameName.value,
      },
    });
    imgArr.value = res.data.results ?? [];
  } catch (error: any) {
    console.error("Error while getting screenshots", error.message);
  } finally {
    isGettingScreenshots.value = false;
  }
};

const getGamesById = async () => {
  const id = resolvedGameId.value;
  if (!id && !resolvedGameName.value) {
    console.warn("[game-detail] missing game id/name");
    return;
  }

  if (id != null) {
    _store.setActiveDetailedGame(
      id,
      resolvedGameName.value || String(id)
    );
  }

  try {
    isGettingGame.value = true;
    await getGameScreenshots();
    const res = await axios.get("/api/game-details", {
      params: {
        id,
        name: resolvedGameName.value,
      },
    });
    game.value = res.data;
  } catch (err: any) {
    console.error("Error fetching game:", err.message);
  } finally {
    isGettingGame.value = false;
  }
};

const addToRecommendGame = async () => {
  try {
    isRecommendingGame.value = true;
    const recommendedGamesCollection = collection($firestore, "recommended_games");
    const q = query(recommendedGamesCollection, where("id", "==", game.value.id));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      toastModels.value.status = "warning";
      toastModels.value.msg = "Bu oyun zaten önerilerde mevcut.";
      toastModels.value.toastbar = true;
      setTimeout(() => {
        toastModels.value.toastbar = false;
      }, 3000);
      return;
    }

    await addDoc(recommendedGamesCollection, {
      ...game.value,
      recommender_name: "Bilinmeyen Kullanıcı",
      recommender_email: "Kesfetten Onerildi",
      recommender_suggestion_msg: "Kesfetten Onerildi",
      recommended_at: new Date().toISOString(),
    });

    toastModels.value.status = "success";
    toastModels.value.msg = `${game.value?.name} adlı oyun başarıyla önerildi!`;
    toastModels.value.toastbar = true;
    await getGameCollectionStatus(game.value?.id);
    setTimeout(() => {
      toastModels.value.toastbar = false;
    }, 3500);
  } catch (error: any) {
    console.error(error.message);
  } finally {
    isRecommendingGame.value = false;
  }
};

const handleMetacriticUrl = () => {
  if (game.value?.metacritic_url) {
    window.open(game.value.metacritic_url, "_blank", "noopener,noreferrer");
  }
};

const {
  gameCollectionStatus,
  isGettingGameStatus,
  getGameCollectionStatus,
} = useGameCollectionStatus($firestore);

const collectionPublicInfo = computed(() =>
  getGameCollectionPublicInfo(gameCollectionStatus.value)
);

onMounted(async () => {
  await getGamesById();
  await getGameCollectionStatus(game.value?.id);
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/game_detail.css";
</style>
