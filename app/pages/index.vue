<template>
  <div class="home-page">
    <Bg_Anim
      :next-upcoming-game="nextUpcomingGame"
      :is-loading-upcoming="isLoadingUpcoming"
      :loading-stats="isLoadingHomeStats"
    />

    <div id="home-content" class="home-main mt-5 mt-lg-10">
    <div class="home-content-wrap">
      <!-- Dashboard metrics -->
      <div class="home-dashboard">
        <v-card
          class="home-dash-card rounded-xl pa-3 pa-sm-4"
          :ripple="false"
          @click="router.push('/completed-games')"
        >
          <v-icon icon="mdi-trophy" color="#69f0ae" size="small" class="mb-2" />
          <p class="home-dash-value">{{ isLoadingHomeStats ? "—" : completedCount }}</p>
          <p class="home-dash-label">Bitirilen</p>
        </v-card>
        <v-card
          class="home-dash-card home-dash-card--radar rounded-xl pa-3 pa-sm-4"
          :ripple="false"
          @click="router.push('/radarimdaki-oyunlar')"
        >
          <v-icon icon="mdi-radar" color="#ffb74d" size="small" class="mb-2" />
          <p class="home-dash-value">{{ isLoadingUpcoming ? "—" : radarCount }}</p>
          <p class="home-dash-label">Radar</p>
        </v-card>
        <v-card class="home-dash-card rounded-xl pa-3 pa-sm-4" :ripple="false" @click="router.push('/blogs')">
          <v-icon icon="mdi-post-outline" color="#69f0ae" size="small" class="mb-2" />
          <p class="home-dash-value">{{ isGettingBlogs ? "—" : blogCount }}</p>
          <p class="home-dash-label">Blog</p>
        </v-card>
        <v-card class="home-dash-card rounded-xl pa-3 pa-sm-4" :ripple="false" @click="goToChannel">
          <v-icon icon="mdi-youtube" color="red" size="small" class="mb-2" />
          <p class="home-dash-value">{{ isLoadedVideos ? "—" : videoCount }}</p>
          <p class="home-dash-label">Video</p>
        </v-card>
      </div>

      <!-- Library strip -->
      <div v-if="!isLoadingHomeStats && (completedCount || radarCount)" class="home-library-strip">
        <div
          class="home-library-card home-library-card--completed"
          @click="router.push('/completed-games')"
        >
          <v-progress-circular
            :model-value="completedProgress"
            :size="52"
            :width="4"
            color="#69f0ae"
            bg-color="rgba(255,255,255,0.08)"
            class="home-library-ring"
          >
            <span class="text-caption font-weight-bold">{{ completedProgress }}%</span>
          </v-progress-circular>
          <div class="home-library-text">
            <h3>Bitirdiğim Oyunlar</h3>
            <p>{{ completedCount }} / 100 hedef</p>
          </div>
          <v-icon
            class="home-library-arrow"
            icon="mdi-chevron-right"
            color="grey-lighten-1"
            size="28"
          />
        </div>
        <div
          class="home-library-card home-library-card--radar"
          @click="router.push('/radarimdaki-oyunlar')"
        >
          <v-progress-circular
            :model-value="radarProgress"
            :size="52"
            :width="4"
            color="#ffb74d"
            bg-color="rgba(255,255,255,0.08)"
            class="home-library-ring"
          >
            <span class="text-caption font-weight-bold">{{ radarProgress }}%</span>
          </v-progress-circular>
          <div class="home-library-text">
            <h3>Radarımdaki Oyunlar</h3>
            <p>{{ radarCount }} oyun takipte</p>
          </div>
          <v-icon
            class="home-library-arrow"
            icon="mdi-chevron-right"
            color="grey-lighten-1"
            size="28"
          />
        </div>
      </div>

      <v-row class="home-sections-row ma-0" :dense="smallScreen">
        <!-- Videos carousel -->
        <v-col cols="12" class="video-carousel-section">
          <Home_Section_Header
            title="Kanaldan Son Kesitler"
            subtitle="En yeni 3 video — daha fazlası için kanala göz at"
            icon="mdi-youtube"
            icon-color="red"
          />
          <div class="video-carousel-toolbar">
            <Animated_Text
              text="npmrungame"
              class="cursor-pointer"
              :ms-per-char="50"
              :duration="550"
              :loop="true"
              @click="goToChannel"
            />
            <v-btn
              variant="tonal"
              color="red"
              rounded="pill"
              size="small"
              prepend-icon="mdi-youtube"
              class="text-capitalize"
              :ripple="false"
              href="https://www.youtube.com/@npmrungame"
              target="_blank"
            >
              Tümünü kanalda izle
            </v-btn>
          </div>

          <div class="video-carousel-wrap">
            <div class="video-carousel">
              <div
                v-for="item in carouselVideos"
                :key="item.video_src"
                class="video-carousel-slide video-container"
              >
                <v-skeleton-loader v-if="isLoadedVideos" class="rounded-xl" :height="280" type="image" />
                <v-video
                  v-else
                  class="align-self-center"
                  :image="item.video_img"
                  rounded="xl"
                  :autoplay="false"
                  :density="display.lgAndUp.value ? 'comfortable' : 'compact'"
                  :controls-variant="smallScreen ? 'mini' : 'tube'"
                  :src="item.video_src"
                  color="green-accent-2"
                  controls
                  volume="0"
                  loop
                >
                  <template v-if="!display.xs.value" #header>
                    <div class="d-flex pa-2 pointer-pass-through">
                      <v-chip
                        class="video-header-element"
                        prepend-avatar="https://yt3.ggpht.com/f-Wk3V3N7KtLUXiRTs5ukoRBzLcILBVyt0_z3i_32xup1qg83dxlciDvComml_cJuL71c0ilWBo=s176-c-k-c0x00ffffff-no-rj"
                        rounded="pill"
                        :text="item.video_name"
                      />
                      <v-tooltip text="Videonun tamamını izle" location="top">
                        <template #activator="{ props: tipProps }">
                          <v-btn
                            v-bind="tipProps"
                            :href="item.video_full_link"
                            target="_blank"
                            :ripple="false"
                            size="small"
                            icon="mdi-open-in-new"
                            variant="text"
                            class="ml-auto video-header-element"
                          />
                        </template>
                      </v-tooltip>
                    </div>
                  </template>
                </v-video>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Discover preview -->
        <v-col cols="12">
          <Home_Section_Header
            title="Keşfet'ten Öne Çıkanlar"
            subtitle="Bu yıl öne çıkan oyunlardan bir seçki — türe göre keşfet"
            icon="mdi-compass-outline"
            to="/discover"
            clickable
          />
          <v-row v-if="isGettingDiscover" :dense="smallScreen">
            <v-col v-for="n in 8" :key="n" cols="6" md="4" lg="3">
              <v-skeleton-loader type="image" class="rounded-lg" />
            </v-col>
          </v-row>
          <div v-else-if="discoverPreview.length" class="home-discover-grid">
            <Game_Card
              density="comfortable"
              meta-format="year-genres"
              :loading="false"
              :arr="discoverPreview"
              :on-row-click="handleDiscoverClick"
            />
          </div>
        </v-col>

        <!-- Features -->
        <v-col cols="12">
          <Home_Section_Header
            title="Neden npmrungame?"
            subtitle="Kanalı farklı kılan 8 özellik — kartlara tıkla"
            icon="mdi-star-shooting"
          />
        </v-col>

        <v-col
          v-for="(item, index) of feature_cards"
          :key="item.title"
          cols="6"
          lg="3"
          class="home-feature-col"
        >
          <v-card
            class="home-feature-card"
            :style="{ animationDelay: `${index * 0.06}s` }"
            :ripple="false"
            :elevation="0"
            @click="handleFeatureClick(item)"
          >
            <div class="home-feature-card-accent" :class="`home-feature-card-accent--${index % 4}`" />
            <div class="home-feature-card-inner">
              <div class="home-feature-icon-ring" :class="`home-feature-icon-ring--${index % 4}`">
                <v-icon :icon="item.icon" size="22" color="#69f0ae" />
              </div>
              <div class="home-feature-text">
                <span class="home-feature-index">{{ String(index + 1).padStart(2, "0") }}</span>
                <p class="home-feature-title default-title-letter">{{ item.title }}</p>
                <p v-if="!display.xs.value" class="home-feature-desc">{{ item.description }}</p>
              </div>
              <v-icon icon="mdi-arrow-top-right" class="home-feature-arrow" size="18" />
            </div>
          </v-card>
        </v-col>

        <!-- Current games -->
        <v-col v-if="currentGames?.length" cols="12">
          <Home_Section_Header anchor-id="current-games" title="Şu Sıralar Ne Oynuyor?" subtitle="Aktif oynanan oyunlar">
            <template #badge>
              <span class="live-badge">
                <span class="live-badge-dot" />
                CANLI
              </span>
            </template>
          </Home_Section_Header>
        </v-col>

        <template v-if="currentGames?.length">
          <v-col
            v-for="(item, index) of currentGames"
            :key="item.firestoreId ?? index"
            cols="6"
            md="4"
            lg="3"
          >
            <v-skeleton-loader v-if="isGettingCurrentGame" type="card" class="rounded-lg h-100" />
            <v-card
              v-else
              class="game-card bg-transparent rounded-lg cursor-pointer transition"
              :style="{ animationDelay: `${index * 0.1}s` }"
              :height="display.xs.value ? 170 : smallScreen ? 250 : 375"
              :ripple="false"
              @click="handleRowClick(item)"
            >
              <v-img :src="item.background_image" class="game-card-img h-100 rounded-lg" cover />
              <div class="game-card-overlay" />
              <v-tooltip text="Toplam oynama süresi (Ana Hikaye)" location="top">
                <template #activator="{ props: tipProps }">
                  <v-chip
                    v-if="item.playtime"
                    v-bind="tipProps"
                    class="playtime-icon rounded-xl ma-1 ma-lg-2"
                    :ripple="false"
                    size="small"
                    variant="elevated"
                    prepend-icon="mdi-timer-outline"
                    color="black"
                    :text="`${item.playtime} saat`"
                  />
                </template>
              </v-tooltip>
              <v-tooltip text="Metacritic puanı" location="top">
                <template #activator="{ props: tipProps }">
                  <v-chip
                    v-if="item.metacritic && !display.xs.value"
                    v-bind="tipProps"
                    class="metacritic-point rounded-xl ma-1 ma-lg-2"
                    :ripple="false"
                    size="small"
                    :prepend-icon="item.metacritic < 90 ? 'mdi-star-outline' : ''"
                    :prepend-avatar="item.metacritic >= 90 ? fireAnimation : ''"
                    variant="elevated"
                    :color="useMetacriticStyle(item.metacritic).color"
                    :text="String(item.metacritic)"
                  />
                </template>
              </v-tooltip>
              <div class="game-card-info d-flex flex-column align-start ga-1 ga-lg-2 pa-1 pa-lg-2">
                <div class="d-flex flex-column align-start">
                  <p
                    class="default-title-letter text-white"
                    :class="display.xs.value ? 'extra-small-text' : 'text-caption text-lg-subtitle-2'"
                  >
                    {{ item.name }}
                  </p>
                  <p class="text-white" :class="display.xs.value ? 'extra-xsmall-text' : 'text-caption'">
                    {{ new Date(item.released).getFullYear() }}
                  </p>
                  <div v-if="!display.xs.value" class="d-flex align-center flex-wrap ga-1">
                    <template v-for="icon in getUniquePlatformIcons(item.platforms)" :key="icon">
                      <v-icon v-if="icon" size="x-small" color="grey-lighten-1" :icon="icon" />
                    </template>
                  </div>
                </div>
                <div v-if="!display.xs.value" class="d-flex flex-wrap ga-1">
                  <v-chip
                    v-for="(genre, gi) in item.genres"
                    :key="gi"
                    :size="smallScreen ? 'x-small' : 'small'"
                    variant="outlined"
                    :ripple="false"
                    :text="genre.name"
                  />
                </div>
              </div>
            </v-card>
          </v-col>
        </template>

        <!-- Blogs -->
        <v-col cols="12">
          <Home_Section_Header
            title="Blog Yazılarımıza Göz At"
            subtitle="En yeni ve en çok oy alan yazılar"
            icon="mdi-post-outline"
            to="/blogs"
            clickable
          />
        </v-col>

        <template v-if="isGettingBlogs">
          <v-col v-for="n in 4" :key="n" cols="6" md="4" lg="3">
            <v-skeleton-loader type="card" class="rounded-lg" />
          </v-col>
        </template>

        <v-col
          v-for="(item, index) of featuredBlogs"
          v-else
          :key="item.firestoreId"
          cols="6"
          md="4"
          lg="3"
          class="d-flex"
        >
          <v-card
            class="blog-card cursor-pointer w-100"
            :ripple="false"
            :elevation="0"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @click="handleBlogClick(item)"
          >
            <div class="vote-icon ma-1 ma-lg-2" style="z-index: 10">
              <v-tooltip location="top">
                <template #activator="{ props: tipProps }">
                  <v-chip
                    v-if="item?.average_votes > 0"
                    v-bind="tipProps"
                    class="rounded-xl text-grey-darken-4"
                    variant="elevated"
                    prepend-icon="mdi-thumb-up"
                    :color="getRatingColor(item?.average_votes ?? 0)"
                    size="small"
                    :ripple="false"
                    :text="`${item?.average_votes?.toFixed(1) ?? 0} / 5`"
                  />
                </template>
                <span>{{ item?.total_voters ?? 0 }} kişi oy verdi</span>
              </v-tooltip>
            </div>
            <v-chip
              v-if="item._featuredReason"
              size="x-small"
              variant="tonal"
              color="green-accent-2"
              class="ma-2"
              style="position: absolute; top: 0; left: 0; z-index: 10"
              :text="item._featuredReason"
            />
            <v-img :src="item.imageUrl" class="blog-card-img rounded-lg" cover />
            <div class="blog-card-overlay" />
            <v-card-actions class="d-flex flex-column align-start ga-0">
              <p
                class="blog-card-title default-title-letter text-grey-lighten-1"
                :class="display.xs.value ? 'extra-small-text' : 'text-caption text-sm-subtitle-2 text-lg-subtitle-2'"
              >
                {{ item.title }}
              </p>
              <p class="blog-card-content text-caption text-grey-darken-1">
                {{ truncateText(item.content_raw, 50) }}
              </p>
            </v-card-actions>
            <div v-if="!display.xs.value" class="blog-card-date d-flex align-center ga-1">
              <v-icon icon="mdi-calendar" size="small" color="grey-lighten-1" />
              <span class="text-caption text-grey-lighten-1">{{ formatDateTR(item.createdAt) }}</span>
            </div>
          </v-card>
        </v-col>

        <!-- Full newsletter -->
        <v-col cols="12">
          <Home_Section_Header
            title="Gelişmelerden Haberdar Olun"
            icon="mdi-bell"
            icon-color="#69f0ae"
          />
          <Home_Newsletter_Block
            v-model:email="email"
            :email-valid="emailIsValid"
            :loading="isAddingToDb"
            :email-rules="[emailRule]"
            @submit="addUserToDb"
          />
        </v-col>
      </v-row>
    </div>
    </div>
  </div>

  <v-dialog
    v-model="isSendMail"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.2rem);
      -webkit-backdrop-filter: blur(0.2rem);
    "
  >
    <div
      class="successful-registered-container pa-3 pa-lg-5 rounded-lg d-flex flex-column align-center justify-center ga-2 ga-lg-5"
    >
      <v-btn
        class="close-btn-in-successful-registered-container ma-1 ma-lg-2"
        size="small"
        icon="mdi-close"
        variant="text"
        color="grey-lighten-1"
        :ripple="false"
        @click="handleCloseSendMailPopUp"
      />
      <template v-if="alreadyRegistered">
        <div class="d-flex flex-column align-center justify-center">
          <img :src="warningImg" class="bg-warning" style="border-radius: 50%" :width="smallScreen ? 50 : 75" />
          <p class="mt-2 text-subtitle-2 text-lg-subtitle-1 text-xl-h5 default-title-letter text-warning">
            Zaten Kayıtlısın
          </p>
        </div>
        <p class="text-center text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-grey-lighten-1 default-title-letter">
          Bu e-posta adresi ile zaten topluluğa katılmışsın. Gelişmeleri almaya devam edeceksin!
        </p>
      </template>
      <template v-else>
        <div class="d-flex flex-column align-center justify-center">
          <img :src="successFullyDoneImg" :width="smallScreen ? 75 : 120" />
          <p class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 default-title-letter text-blue-grey-darken-1">
            Kayıt Başarılı
          </p>
        </div>
        <p class="text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-grey-lighten-1 font-weight-bold default-title-letter">
          {{ `Sevgili ${displayName},` }}
        </p>
        <p class="text-center text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-grey-lighten-1 default-title-letter">
          Topluluğumuza katıldığın için teşekkürler. Tüm gelişmelerden haberdar olacaksın. İyi oyunlar!
        </p>
      </template>
    </div>
  </v-dialog>
</template>

<script lang="ts" setup>
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import axios from "axios";
import _ from "lodash";
import Animated_Text from "~/components/common/Animated_Text.vue";
import Game_Card from "~/components/common/Game_Card.vue";
import Home_Newsletter_Block from "~/components/home/Home_Newsletter_Block.vue";
import Home_Section_Header from "~/components/home/Home_Section_Header.vue";
import Bg_Anim from "~/components/layout/Bg_Anim.vue";
import { slugify, truncateText } from "~/composables/core/basicFunc";
import type { Feature_Card } from "~/composables/core/interfaces";
import {
  extractNameFromEmail,
  getRatingColor,
  getUniquePlatformIcons,
  normalizeText,
  useFirestoreDateFormatted,
  useMetacriticStyle,
} from "~/composables/data/handleData";
import { feature_cards } from "~/utils/Feature_Card";
import { useUpcomingGames } from "~/composables/data/useUpcomingGames";
import store from "~/store/store";
import fireAnimation from "~/assets/img/fire_anim.gif";
import successFullyDoneImg from "~/assets/img/successfully_done_anim.gif";
import warningImg from "~/assets/img/warning_anim.gif";

const requestURL = useRequestURL();
const OG_IMAGE =
  "https://yt3.ggpht.com/f-Wk3V3N7KtLUXiRTs5ukoRBzLcILBVyt0_z3i_32xup1qg83dxlciDvComml_cJuL71c0ilWBo=s176-c-k-c0x00ffffff-no-rj";

useHead({
  title: "npmrungame | 4K Oyun Kanalı & Oyun Kütüphanesi",
  meta: [
    {
      name: "description",
      content:
        "npmrungame — 4K oyun içerikleri, bitirdiğim oyunlar, radarımdaki oyunlar, blog ve keşfet. Türkçe oyun kanalı ve kişisel oyun kütüphanesi.",
    },
    { property: "og:title", content: "npmrungame | 4K Oyun Kanalı" },
    {
      property: "og:description",
      content: "4K oyun dünyasının nabzı — videolar, kütüphane, blog ve keşfet.",
    },
    { property: "og:type", content: "website" },
    { property: "og:image", content: OG_IMAGE },
    { property: "og:url", content: requestURL.origin },
    { name: "twitter:card", content: "summary_large_image" },
  ],
  link: [{ rel: "canonical", href: requestURL.href }],
});

const { $firestore } = useNuxtApp();
const { formatDateTR } = useFirestoreDateFormatted();

const _store = store();
const router = useRouter();
const display = useDisplay();

const smallScreen = computed(() => display.smAndDown.value);
const emailIsValid = computed(() => /.+@.+\..+/.test(email.value));

const isLoadedVideos = ref(false);
const isGettingCurrentGame = ref(false);
const isGettingBlogs = ref(false);
const isGettingDiscover = ref(false);
const isLoadingHomeStats = ref(false);
const isAddingToDb = ref(false);
const alreadyRegistered = ref(false);
const isSendMail = ref(false);

const displayName = ref("");
const email = ref("");
const currentGames = ref<any[]>([]);
const videos = ref<any[]>([]);
const featuredBlogs = ref<any[]>([]);
const discoverPreview = ref<any[]>([]);
const completedCount = ref(0);
const blogCount = ref(0);
const videoCount = computed(() => videos.value.length);
const carouselVideos = computed(() => videos.value.slice(0, 3));
const completedProgress = computed(() =>
  Math.min(100, Math.round((completedCount.value / 100) * 100))
);
const radarMilestone = 30;
const radarProgress = computed(() =>
  Math.min(100, Math.round((radarCount.value / radarMilestone) * 100))
);

const {
  games: radarGames,
  nextGame: nextUpcomingGame,
  isLoading: isLoadingUpcoming,
  fetchUpcomingGames,
} = useUpcomingGames();

const radarCount = computed(() => radarGames.value.length);

const blogCreatedTime = (blog: any) => {
  const c = blog.createdAt;
  if (!c) return 0;
  if (typeof c.toMillis === "function") return c.toMillis();
  if (c.seconds) return c.seconds * 1000;
  return new Date(c).getTime() || 0;
};

const getHomeStats = async () => {
  try {
    isLoadingHomeStats.value = true;
    const completedSnap = await getDocs(collection($firestore, "completed_games"));
    completedCount.value = completedSnap.size;
  } catch (e) {
    console.error("Home stats:", e);
  } finally {
    isLoadingHomeStats.value = false;
  }
};

const getVideosFromDb = async () => {
  try {
    isLoadedVideos.value = true;
    const snapshot = await getDocs(collection($firestore, "npmrungame_yt_videos"));
    if (!snapshot.empty) {
      videos.value = snapshot.docs.map((d) => ({ firestoreId: d.id, ...d.data() }));
    }
  } catch (error: any) {
    console.error(error.message);
  } finally {
    setTimeout(() => {
      isLoadedVideos.value = false;
    }, 800);
  }
};

const getCurrentGames = async () => {
  try {
    isGettingCurrentGame.value = true;
    const snapshot = await getDocs(collection($firestore, "current_games"));
    currentGames.value = snapshot.docs.map((d) => ({ firestoreId: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error getting games:", error);
  } finally {
    setTimeout(() => {
      isGettingCurrentGame.value = false;
    }, 250);
  }
};

const getBlogsFromDb = async () => {
  try {
    isGettingBlogs.value = true;
    const blogsSnapshot = await getDocs(collection($firestore, "blogs"));
    const blogsList = blogsSnapshot.docs.map((d) => {
      const data = d.data();
      return {
        firestoreId: d.id,
        ...data,
        keywords: (data.keywords ?? []).map((k: string) => normalizeText(k)),
      };
    });
    blogCount.value = blogsList.length;

    const votesSnapshot = await getDocs(collection($firestore, "blog_votes"));
    const votesMap: Record<string, { average_votes: number; total_voters: number }> = {};
    votesSnapshot.docs.forEach((voteDoc) => {
      const data = voteDoc.data();
      const count = data.count ?? 0;
      const total = data.total ?? 0;
      votesMap[voteDoc.id] = {
        average_votes: count > 0 ? total / count : 0,
        total_voters: count,
      };
    });
    const withVotes = blogsList.map((blog) => ({
      ...blog,
      average_votes: votesMap[blog.firestoreId]?.average_votes ?? 0,
      total_voters: votesMap[blog.firestoreId]?.total_voters ?? 0,
    }));

    const byDate = [...withVotes].sort((a, b) => blogCreatedTime(b) - blogCreatedTime(a));
    const byVotes = [...withVotes].sort((a, b) => (b.average_votes ?? 0) - (a.average_votes ?? 0));

    const picked = new Set<string>();
    const result: any[] = [];

    for (const b of byDate.slice(0, 2)) {
      if (!picked.has(b.firestoreId)) {
        picked.add(b.firestoreId);
        result.push({ ...b, _featuredReason: "Yeni" });
      }
    }
    for (const b of byVotes) {
      if (result.length >= 4) break;
      if (!picked.has(b.firestoreId) && b.average_votes > 0) {
        picked.add(b.firestoreId);
        result.push({ ...b, _featuredReason: "Popüler" });
      }
    }
    for (const b of byDate) {
      if (result.length >= 4) break;
      if (!picked.has(b.firestoreId)) {
        picked.add(b.firestoreId);
        result.push({ ...b, _featuredReason: "Yeni" });
      }
    }

    featuredBlogs.value = result.slice(0, 4);
  } catch (error: any) {
    console.error("Error while getting blogs:", error.message);
  } finally {
    isGettingBlogs.value = false;
  }
};

const getDiscoverPreview = async () => {
  try {
    isGettingDiscover.value = true;
    const year = new Date().getFullYear();
    const { data } = await axios.get("/api/games", {
      params: {
        page: 1,
        page_size: 8,
        dates: `${year}-01-01,${year}-12-31`,
        ordering: "-released",
      },
    });
    discoverPreview.value = (data?.results ?? []).slice(0, 8);
  } catch (e: any) {
    console.error("Discover preview:", e?.message);
  } finally {
    isGettingDiscover.value = false;
  }
};

const handleBlogClick = (blog: any) => {
  _store.setActiveBlogId(blog?.firestoreId);
  router.push(`/blogs/${slugify(blog?.title)}`);
};

const goToChannel = () => {
  window.open("https://www.youtube.com/@npmrungame", "_blank");
};

const handleRowClick = (item: any) => {
  _store.setActiveDetailedGame(item.id, item.name);
  router.push(`/game-detail/${slugify(item.name)}`);
};

const handleDiscoverClick = (item: any) => {
  _store.setActiveDetailedGame(item.id, item.name);
  router.push(`/game-detail/${slugify(item.name)}`);
};

const handleFeatureClick = (item: Feature_Card) => {
  if (!item.path) {
    router.push("/discover");
    return;
  }
  if (item.external) {
    window.open(item.path, "_blank");
    return;
  }
  router.push(item.path);
};

const emailRule = (v: string) => {
  if (!v) return true;
  return /.+@.+\..+/.test(v) || "Geçersiz email";
};

const addUserToDb = async () => {
  try {
    isAddingToDb.value = true;
    const q = query(collection($firestore, "registered_users"), where("email", "==", email.value));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      alreadyRegistered.value = true;
      isSendMail.value = true;
      return;
    }

    displayName.value = extractNameFromEmail(email.value);
    await addDoc(collection($firestore, "registered_users"), {
      username: displayName.value,
      email: email.value,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    isSendMail.value = true;
    setTimeout(() => {
      isSendMail.value = false;
    }, 4500);
  } catch (error: any) {
    console.error("Error while adding user:", error.message);
  } finally {
    isAddingToDb.value = false;
    email.value = "";
  }
};

const handleCloseSendMailPopUp = () => {
  isSendMail.value = false;
  alreadyRegistered.value = false;
};

watch(isSendMail, (newVal) => {
  if (newVal === false) handleCloseSendMailPopUp();
});

onMounted(async () => {
  getHomeStats();
  getVideosFromDb();
  getCurrentGames();
  getBlogsFromDb();
  getDiscoverPreview();
  fetchUpcomingGames();
});
</script>

<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/blogs.css");
@import url("~/assets/css/home_page.css");
</style>
