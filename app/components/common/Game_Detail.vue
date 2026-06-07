<template>
  <div class="game-detail-page">
    <div class="game-detail-glow game-detail-glow--left" aria-hidden="true" />
    <div class="game-detail-glow game-detail-glow--right" aria-hidden="true" />

    <v-responsive :height="isSmallScreen ? 70 : 100" />

    <v-container class="game-detail-container pa-3 pa-md-6 pa-lg-8">
      <div class="gd-hero-head">
        <div class="gd-hero-head__toolbar">
          <button type="button" class="gd-back default-title-letter" @click="goBackToDiscover">
            <v-icon icon="mdi-arrow-left" size="18" />
            <span>Keşfetmeye devam et</span>
          </button>
        </div>

        <template v-if="isGettingGame">
          <v-skeleton-loader type="heading" width="60%" class="mb-2 bg-transparent" />
          <v-skeleton-loader type="chip" width="120" class="bg-transparent" />
        </template>
        <template v-else-if="game">
          <h1 class="gd-title default-title-letter">{{ game.name }}</h1>
          <div class="gd-title-row">
            <span v-if="releaseYear" class="gd-year default-title-letter">{{ releaseYear }}</span>
            <div class="gd-quick-chips">
              <v-chip
                v-if="game.metacritic"
                size="small"
                rounded="lg"
                :ripple="false"
                :prepend-icon="game.metacritic < 90 ? 'mdi-star-outline' : undefined"
                :prepend-avatar="game.metacritic >= 90 ? fireAnimation : undefined"
                variant="elevated"
                :color="useMetacriticStyle(game.metacritic).color"
                :text="String(game.metacritic)"
                class="cursor-pointer"
                @click="handleMetacriticUrl"
              />
              <v-chip
                v-if="game.playtime"
                size="small"
                rounded="lg"
                :ripple="false"
                prepend-icon="mdi-clock-outline"
                variant="tonal"
                color="green-accent-2"
                :text="`${game.playtime} saat`"
              />
              <v-chip
                v-for="(genre, index) in game.genres?.slice(0, 3)"
                :key="index"
                size="small"
                rounded="lg"
                :ripple="false"
                variant="outlined"
                color="grey-lighten-1"
                :text="genre.name"
              />
            </div>
          </div>
        </template>
      </div>

      <section class="gd-hero">
        <div v-if="isGettingGame" class="gd-hero__banner">
          <v-skeleton-loader type="image" class="w-100 h-100" />
        </div>
        <button
          v-else
          type="button"
          class="gd-hero__banner"
          :aria-label="`${game?.name} kapak görseli`"
          @click="openImgDetail(game?.background_image)"
        >
          <img
            :src="game?.background_image ?? 'https://f4.bcbits.com/img/0016409163_71.jpg'"
            :alt="game?.name"
            loading="lazy"
          />
          <div class="gd-hero__banner-shade" aria-hidden="true" />
          <span class="gd-hero__banner-zoom default-title-letter">
            <v-icon icon="mdi-magnify-plus-outline" size="14" />
            Büyüt
          </span>
        </button>

        <div v-if="isGettingScreenshots" class="gd-screenshots">
          <v-skeleton-loader
            v-for="n in 6"
            :key="n"
            type="image"
            class="gd-screenshot rounded-lg"
          />
        </div>
        <div v-else class="gd-screenshots">
          <button
            v-for="(item, index) in imgArr.slice(0, 6)"
            :key="index"
            type="button"
            class="gd-screenshot"
            :aria-label="`Ekran görüntüsü ${index + 1}`"
            @click="openImgDetail(item.image)"
          >
            <img :src="item.image" alt="" loading="lazy" />
          </button>
        </div>
      </section>

      <section class="gd-content">
        <article class="gd-panel gd-description">
          <h2 class="gd-panel__heading default-title-letter">Hakkında</h2>
          <div v-if="isGettingGame" class="d-flex flex-column ga-2">
            <v-skeleton-loader v-for="n in 4" :key="n" type="text" width="100%" />
          </div>
          <div
            v-else
            class="gd-description__body default-title-letter"
            v-html="game?.description"
          />
        </article>

        <aside class="gd-panel gd-meta">
          <h2 class="gd-panel__heading default-title-letter">Detaylar</h2>

          <div v-if="isGettingGame" class="d-flex flex-column ga-3">
            <v-skeleton-loader v-for="n in 5" :key="n" type="chip" width="100%" />
          </div>

          <div v-else class="gd-meta-list">
            <div
              v-if="game?.metacritic"
              class="gd-meta-row gd-meta-row--clickable"
              @click="handleMetacriticUrl"
            >
              <p class="gd-meta-row__label default-title-letter">
                <v-icon icon="mdi-star-circle-outline" size="14" />
                Metacritic
              </p>
              <div class="gd-meta-row__values">
                <v-chip
                  size="small"
                  rounded="lg"
                  :ripple="false"
                  :prepend-icon="game.metacritic < 90 ? 'mdi-star-outline' : undefined"
                  :prepend-avatar="game.metacritic >= 90 ? fireAnimation : undefined"
                  variant="elevated"
                  :color="useMetacriticStyle(game.metacritic).color"
                  :text="String(game.metacritic)"
                />
              </div>
            </div>

            <div v-if="game?.website" class="gd-meta-row">
              <p class="gd-meta-row__label default-title-letter">
                <v-icon icon="mdi-web" size="14" />
                Website
              </p>
              <div class="gd-meta-row__values">
                <v-chip
                  :href="game.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  rounded="lg"
                  :ripple="false"
                  prepend-icon="mdi-open-in-new"
                  variant="tonal"
                  color="green-accent-2"
                  :text="formatWebsiteHost(game.website)"
                />
              </div>
            </div>

            <div v-if="game?.playtime" class="gd-meta-row">
              <p class="gd-meta-row__label default-title-letter">
                <v-icon icon="mdi-clock-outline" size="14" />
                Tahmini süre
              </p>
              <div class="gd-meta-row__values">
                <v-chip
                  size="small"
                  rounded="lg"
                  :ripple="false"
                  prepend-icon="mdi-update"
                  variant="outlined"
                  :text="`${game.playtime} saat`"
                />
              </div>
            </div>

            <div v-if="game?.developers?.[0]" class="gd-meta-row">
              <p class="gd-meta-row__label default-title-letter">
                <v-icon icon="mdi-account-group-outline" size="14" />
                Geliştiriciler
              </p>
              <div class="gd-meta-row__values">
                <v-chip
                  v-for="(developer, index) in game.developers"
                  :key="index"
                  size="small"
                  rounded="lg"
                  :ripple="false"
                  variant="outlined"
                  :text="developer.name"
                />
              </div>
            </div>

            <div v-if="game?.publishers?.[0]" class="gd-meta-row">
              <p class="gd-meta-row__label default-title-letter">
                <v-icon icon="mdi-domain" size="14" />
                Yayıncı
              </p>
              <div class="gd-meta-row__values">
                <v-chip
                  v-for="(publisher, index) in game.publishers"
                  :key="index"
                  size="small"
                  rounded="lg"
                  :ripple="false"
                  variant="outlined"
                  :text="publisher.name"
                />
              </div>
            </div>

            <div v-if="game?.platforms?.[0]" class="gd-meta-row">
              <p class="gd-meta-row__label default-title-letter">
                <v-icon icon="mdi-gamepad-variant-outline" size="14" />
                Platformlar
              </p>
              <div class="gd-platform-icons">
                <v-icon
                  v-for="icon in getUniquePlatformIcons(game.platforms)"
                  :key="icon"
                  size="18"
                  color="grey-lighten-1"
                  :icon="icon"
                />
              </div>
            </div>

            <div v-if="game?.stores?.[0]" class="gd-meta-row">
              <p class="gd-meta-row__label default-title-letter">
                <v-icon icon="mdi-store-outline" size="14" />
                Mağazalar
              </p>
              <div class="gd-meta-row__values">
                <v-chip
                  v-for="(store, index) in game.stores"
                  :key="index"
                  :prepend-avatar="store.store.image_background"
                  size="small"
                  rounded="lg"
                  :ripple="false"
                  variant="tonal"
                  color="blue-grey-lighten-1"
                  :text="store.store.name"
                />
              </div>
            </div>

            <div v-if="game?.genres?.[0]" class="gd-meta-row">
              <p class="gd-meta-row__label default-title-letter">
                <v-icon icon="mdi-shape-outline" size="14" />
                Türler
              </p>
              <div class="gd-meta-row__values">
                <v-chip
                  v-for="(genre, index) in game.genres"
                  :key="index"
                  size="small"
                  rounded="lg"
                  :ripple="false"
                  variant="tonal"
                  color="green-accent-2"
                  :text="genre.name"
                />
              </div>
            </div>

            <div v-if="game?.tags?.[0]" class="gd-meta-row">
              <p class="gd-meta-row__label default-title-letter">
                <v-icon icon="mdi-tag-outline" size="14" />
                Etiketler
              </p>
              <div class="gd-meta-row__values">
                <v-chip
                  v-for="(tag, index) in game.tags.slice(0, 8)"
                  :key="index"
                  size="x-small"
                  rounded="lg"
                  :ripple="false"
                  variant="tonal"
                  color="blue-lighten-1"
                  :text="tag.name"
                />
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section
        v-if="
          !isGettingGame &&
          (game?.platforms?.[0]?.requirements?.minimum ||
            game?.platforms?.[0]?.requirements?.recommended)
        "
        class="gd-requirements"
      >
        <div
          v-if="game?.platforms?.[0]?.requirements?.minimum"
          class="gd-req-card gd-req-card--min"
        >
          <h3 class="gd-req-card__title default-title-letter">Minimum gereksinimler</h3>
          <p
            v-for="(line, i) in parseRequirements(game.platforms[0].requirements.minimum)"
            :key="i"
            class="gd-req-line default-title-letter"
          >
            {{ line }}
          </p>
        </div>

        <div
          v-if="game?.platforms?.[0]?.requirements?.recommended"
          class="gd-req-card gd-req-card--rec"
        >
          <h3 class="gd-req-card__title default-title-letter">Önerilen gereksinimler</h3>
          <p
            v-for="(line, i) in parseRequirements(game.platforms[0].requirements.recommended)"
            :key="i"
            class="gd-req-line default-title-letter"
          >
            {{ line }}
          </p>
        </div>
      </section>

      <template v-if="isGettingGame">
        <v-skeleton-loader type="card" class="gd-requirements rounded-xl" />
      </template>

      <section v-if="!isGettingGame" class="gd-collection-section">
        <v-skeleton-loader
          v-if="isGettingGameStatus"
          type="card"
          class="gd-collection-banner rounded-xl"
          height="88"
        />

        <div
          v-else-if="gameCollectionStatus && collectionPublicInfo"
          class="gd-collection-banner gd-collection-banner--found"
          :style="{ '--gd-collection-accent': collectionPublicInfo.color }"
        >
          <div class="gd-collection-banner__icon">
            <v-icon :icon="collectionPublicInfo.icon" size="26" :color="collectionPublicInfo.color" />
          </div>
          <div class="gd-collection-banner__copy">
            <p class="gd-collection-banner__eyebrow default-title-letter">npmrungame listelerinde</p>
            <h3 class="gd-collection-banner__title default-title-letter">
              {{ collectionPublicInfo.title }}
            </h3>
            <p class="gd-collection-banner__msg default-title-letter">
              {{ collectionPublicInfo.message }}
            </p>
          </div>
          <v-btn
            v-if="collectionPublicInfo.path"
            :to="collectionPublicInfo.path"
            variant="tonal"
            rounded="lg"
            size="small"
            class="gd-collection-banner__cta default-title-letter text-capitalize"
            :color="collectionPublicInfo.color === '#69f0ae' ? 'green-accent-2' : undefined"
            append-icon="mdi-arrow-right"
            :ripple="false"
          >
            Listeyi gör
          </v-btn>
        </div>

        <div v-else class="gd-collection-banner gd-collection-banner--empty">
          <div class="gd-collection-banner__icon gd-collection-banner__icon--empty">
            <v-icon icon="mdi-bookmark-off-outline" size="26" color="#69f0ae" />
          </div>
          <div class="gd-collection-banner__copy">
            <p class="gd-collection-banner__eyebrow default-title-letter">npmrungame listelerinde yok</p>
            <h3 class="gd-collection-banner__title default-title-letter">
              Henüz koleksiyonda değil
            </h3>
            <p class="gd-collection-banner__msg default-title-letter">
              Bu oyun bitirilenler, radar, önerilenler veya şu an oynananlar arasında
              görünmüyor. Beğendiysen topluluğa önerebilirsin.
            </p>
          </div>
          <v-btn
            text="Önermek ister misin?"
            class="gd-collection-banner__cta gd-recommend-btn default-title-letter text-capitalize"
            prepend-icon="mdi-heart-plus"
            rounded="xl"
            color="deep-purple-darken-1"
            variant="elevated"
            :loading="isRecommendingGame"
            :size="display.smAndDown.value ? 'small' : 'default'"
            :ripple="false"
            @click="addToRecommendGame"
          />
        </div>

        <div v-if="_store.isAdmin && gameCollectionStatus" class="gd-actions__admin">
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
    </v-container>

    <v-dialog v-model="isOpenImgDetail" :max-width="720" class="gd-dialog">
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
          aria-label="Önceki görsel"
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
          aria-label="Sonraki görsel"
          @click="showNextImage"
        />

        <p
          v-if="galleryImages.length > 1"
          class="img-detail-counter default-title-letter"
        >
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
        <p class="text-subtitle-2 text-lg-subtitle-1 text-grey-lighten-1 default-title-letter mb-0">
          {{ toastModels?.msg }}
        </p>
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
  parseRequirements,
  useMetacriticStyle,
} from "~/composables/data/handleData";
import { useDiscoverStore } from "~/store/queryStore";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import successfullyDoneImg from "~/assets/img/successfully_done_anim.gif";
import warningImg from "~/assets/img/warning_anim.gif";
import { useGameCollectionStatus } from "~/composables/data/useGameCollectionStatus";
import Animated_Text from "./Animated_Text.vue";

const { $firestore } = useNuxtApp();

const _store = store();
const discover_store = useDiscoverStore();
const router = useRouter();
const display = useDisplay();

const isSmallScreen = computed(() => display.smAndDown.value);

const isGettingGame = ref(false);
const isGettingScreenshots = ref(false);
const isOpenImgDetail = ref(false);
const isRecommendingGame = ref(false);

const game = ref<any | null>(null);
const imgArr = ref<any[]>([]);
const galleryIndex = ref(0);

const galleryImages = computed(() => {
  const images: string[] = [];
  const banner = game.value?.background_image;
  if (banner) images.push(banner);

  for (const item of imgArr.value.slice(0, 6)) {
    if (item.image && !images.includes(item.image)) {
      images.push(item.image);
    }
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

const goBackToDiscover = () => {
  router.push({
    path: "/discover",
    query: discover_store.lastQuery || {},
  });
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

  if (open) {
    window.addEventListener("keydown", onGalleryKeydown);
  } else {
    window.removeEventListener("keydown", onGalleryKeydown);
  }
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener("keydown", onGalleryKeydown);
  }
});

const getGameScreenshots = async () => {
  try {
    isGettingScreenshots.value = true;

    const res = await axios.get("/api/game-screenshots", {
      params: {
        id: _store.active_detailed_game?.id,
      },
    });

    imgArr.value = res.data.results;
  } catch (error: any) {
    console.error("Error while getting screenshots", error.message);
  } finally {
    isGettingScreenshots.value = false;
  }
};

const getGamesById = async () => {
  try {
    isGettingGame.value = true;

    await getGameScreenshots();

    const res = await axios.get("/api/game-details", {
      params: {
        id: _store.active_detailed_game?.id,
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

    const metadata = {
      recommender_name: "Bilinmeyen Kullanıcı",
      recommender_email: "Kesfetten Onerildi",
      recommender_suggestion_msg: "Kesfetten Onerildi",
      recommended_at: new Date().toISOString(),
    };

    const finalGameData = {
      ...game.value,
      ...metadata,
    };

    await addDoc(recommendedGamesCollection, finalGameData);

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
