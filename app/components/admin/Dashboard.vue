<template>
  <div class="admin-dashboard">
    <section class="admin-overview">
      <div class="admin-overview-hero">
        <div class="admin-overview-hero-text">
          <v-avatar :image="adminLogoImg" size="52" rounded="lg" class="admin-overview-avatar" />
          <div>
            <h1 class="admin-dash-title default-title-letter">Panel Özeti</h1>
            <p class="admin-dash-subtitle mb-0">npmrungame yönetim merkezi</p>
          </div>
        </div>
        <div class="admin-overview-hero-badges">
          <span class="admin-hero-badge">
            <v-icon icon="mdi-check-circle" size="14" />
            {{ completedGames.length }} bitirilen
          </span>
          <span class="admin-hero-badge admin-hero-badge--current">
            <v-icon icon="mdi-play-circle" size="14" />
            {{ currentGames.length }} oynanan
          </span>
          <span class="admin-hero-badge admin-hero-badge--cyan">
            <v-icon icon="mdi-playlist-play" size="14" />
            {{ toPlayGames.length }} oynanacak
          </span>
        </div>
      </div>

      <div class="admin-quick-actions">
        <div class="d-flex flex-wrap ga-3">
          <button
            type="button"
            class="admin-quick-btn admin-quick-btn--completed"
            @click="goToAdminSection('completed_games')"
          >
            <span class="admin-quick-btn-icon">
              <v-icon icon="mdi-trophy" size="22" />
            </span>
            <span class="admin-quick-btn-body">
              <span class="admin-quick-btn-title default-title-letter">Bitirdiğim Oyunlar</span>
              <span class="admin-quick-btn-desc">Oyun ekle / çıkar</span>
            </span>
            <span class="admin-quick-btn-count">{{ completedGames.length }}</span>
            <v-icon class="admin-quick-btn-arrow" icon="mdi-chevron-right" size="20" />
          </button>

          <button
            type="button"
            class="admin-quick-btn admin-quick-btn--current"
            @click="goToAdminSection('current_games')"
          >
            <span class="admin-quick-btn-icon">
              <v-icon icon="mdi-play-circle" size="22" />
            </span>
            <span class="admin-quick-btn-body">
              <span class="admin-quick-btn-title default-title-letter">Şuan Oynananlar</span>
              <span class="admin-quick-btn-desc">Oyun ekle / çıkar</span>
            </span>
            <span class="admin-quick-btn-count">{{ currentGames.length }}</span>
            <v-icon class="admin-quick-btn-arrow" icon="mdi-chevron-right" size="20" />
          </button>

          <button
            type="button"
            class="admin-quick-btn admin-quick-btn--toplay"
            @click="goToAdminSection('to_play_games')"
          >
            <span class="admin-quick-btn-icon">
              <v-icon icon="mdi-playlist-play" size="22" />
            </span>
            <span class="admin-quick-btn-body">
              <span class="admin-quick-btn-title default-title-letter">Oynayacaklarım</span>
              <span class="admin-quick-btn-desc">Oyun ekle / çıkar</span>
            </span>
            <span class="admin-quick-btn-count">{{ toPlayGames.length }}</span>
            <v-icon class="admin-quick-btn-arrow" icon="mdi-chevron-right" size="20" />
          </button>
        </div>
      </div>

      <div class="admin-overview-layout">
        <aside class="admin-profile-card admin-profile-card--strip">
          <div class="admin-profile-strip-head">
            <div class="admin-profile-strip-icon">
              <v-icon icon="mdi-shield-account" size="26" color="#69f0ae" />
            </div>
            <div class="admin-profile-strip-titles">
              <span class="admin-profile-strip-title default-title-letter">Hesap</span>
              <span class="admin-profile-strip-sub">npmrungame yönetimi</span>
            </div>
          </div>
          <ul class="admin-profile-list admin-profile-list--strip">
            <li class="admin-profile-field">
              <v-icon icon="mdi-email-outline" size="20" class="admin-profile-field-icon" />
              <div>
                <span class="admin-profile-key">E-posta</span>
                <span class="admin-profile-val">npmrungame@gmail.com</span>
              </div>
            </li>
            <li class="admin-profile-field">
              <v-icon icon="mdi-clock-outline" size="20" class="admin-profile-field-icon" />
              <div>
                <span class="admin-profile-key">Son giriş</span>
                <span class="admin-profile-val">{{ formatTR(_store.admin_user?.lastLoginAt as string) }}</span>
              </div>
            </li>
            <li class="admin-profile-field">
              <v-icon icon="mdi-calendar-check" size="20" class="admin-profile-field-icon" />
              <div>
                <span class="admin-profile-key">Kayıt tarihi</span>
                <span class="admin-profile-val">{{ formatTR(_store.admin_user?.createdAt as string) }}</span>
              </div>
            </li>
          </ul>
          <div class="admin-profile-strip-team">
            <span class="admin-profile-team-label">Yetkililer</span>
            <div class="admin-profile-team">
              <v-tooltip text="Zeynep Cansu Katar" location="top">
                <template #activator="{ props }">
                  <v-avatar
                    v-bind="props"
                    :image="adminZeynepCansuKatarImg"
                    size="44"
                    class="admin-profile-avatar"
                  />
                </template>
              </v-tooltip>
              <v-tooltip text="Gökhan Katar" location="top">
                <template #activator="{ props }">
                  <v-avatar
                    v-bind="props"
                    :image="adminGokhanKatarImg"
                    size="44"
                    class="admin-profile-avatar"
                  />
                </template>
              </v-tooltip>
            </div>
          </div>
        </aside>

        <div class="admin-metrics-wrap">
          <section class="admin-metrics-panel">
            <h3 class="admin-metrics-panel-title">
              <v-icon icon="mdi-web" size="16" color="#69f0ae" />
              Site
            </h3>
            <div class="admin-goal-rings-grid">
              <Admin_Goal_Ring_Metric
                variant="site"
                label="Kayıtlı kullanıcı"
                icon="mdi-account-multiple"
                :value="registeredUsersCount"
                :goal="100"
                :loading="isGettingRegisteredUsers"
              />
              <Admin_Goal_Ring_Metric
                variant="site"
                label="Gelen mesaj"
                icon="mdi-email-outline"
                :value="messagesCount"
                :goal="100"
                :loading="isGettingMessages"
              />
              <Admin_Goal_Ring_Metric
                variant="site"
                label="Önerilen oyun"
                icon="mdi-thumb-up-outline"
                :value="recommendedGamesCount"
                :goal="100"
                :loading="isGettingRecommendedGames"
              />
              <Admin_Goal_Ring_Metric
                variant="site"
                label="Toplam blog"
                icon="mdi-post-outline"
                :value="totalBlogCount"
                :goal="50"
                :loading="isGettingBlogs"
              />
            </div>
          </section>

          <section class="admin-metrics-panel admin-metrics-panel--yt">
            <div class="admin-metrics-panel-head">
              <h3 class="admin-metrics-panel-title admin-metrics-panel-title--yt">
                <v-icon icon="mdi-youtube" size="16" color="#ff5252" />
                YouTube
              </h3>
              <span class="admin-yt-privacy-chip">
                <v-icon
                  :icon="youtubeChannelStats?.hiddenSubscriberCount ? 'mdi-eye-off' : 'mdi-eye'"
                  size="14"
                />
                Abone {{ youtubeChannelStats?.hiddenSubscriberCount ? "gizli" : "açık" }}
              </span>
            </div>
            <div class="admin-goal-rings-grid admin-goal-rings-grid--yt">
              <Admin_Goal_Ring_Metric
                variant="youtube"
                label="Abone sayısı"
                icon="mdi-youtube"
                :value="youtubeChannelStats?.subscriberCount"
                :goal="1000"
                compact
              />
              <Admin_Goal_Ring_Metric
                variant="youtube"
                label="Toplam izlenme"
                icon="mdi-eye"
                :value="youtubeChannelStats?.viewCount"
                :goal="1_000_000"
                compact
              />
              <Admin_Goal_Ring_Metric
                variant="youtube"
                label="Toplam video"
                icon="mdi-video"
                :value="youtubeChannelStats?.videoCount"
                :goal="1000"
                compact
              />
            </div>
          </section>
        </div>
      </div>
    </section>
    <header class="admin-dash-section-header mt-6 mb-4">
      <div class="admin-dash-section-icon admin-dash-section-icon--games">
        <v-icon icon="mdi-gamepad-variant" size="22" color="#69f0ae" />
      </div>
      <div class="admin-dash-section-text">
        <h2 class="admin-dash-section-title default-title-letter">Oyun Koleksiyonları</h2>
        <p class="admin-dash-section-sub">Tamamlanan, sıradaki ve aktif oyunların özeti</p>
      </div>
      <div class="admin-dash-section-line" aria-hidden="true" />
    </header>
    <v-row class="w-100 mx-auto mb-3" :dense="isSmallScreen">
            <!-- Completed Game Card -->
            <v-col cols="12" sm="6" lg="4">
              <v-card
                class="admin-game-stat-card bg-transparent rounded-lg"
                :ripple="false"
                :height="display.xs.value ? 'auto' : 315"
              >
                <v-img
                  class="card-img-in-card-dashboard-game-stats"
                  :src="randomGameBackgroundForCompletedGames"
                  height="100%"
                  cover
                />
                <img
                  :src="successfullyDoneImg"
                  class="img-anim"
                  :width="isSmallScreen ? 40 : 70"
                />
                <div
                  class="card-content-in-card-dashboard-game-stats d-flex align-center flex-wrap justiy-center justify-sm-space-between rounded-lg pa-1 pa-lg-2 ga-2"
                >
                  <p
                    class="text-subtitle-2 text-md-subtitle-1 text-lg-h5 text-center default-title-letter text-grey-lighten-1"
                  >
                    Tamamlanmış Oyun
                  </p>

                  <p
                    class="text-subtitle-1 text-lg-h5 text-xl-h4 default-title-letter"
                    style="color: #4df62f"
                  >
                    {{ completedGames?.length }}
                  </p>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" lg="4">
              <v-card
                class="admin-game-stat-card bg-transparent rounded-lg"
                :ripple="false"
                :height="display.xs.value ? 'auto' : 315"
              >
                <v-img
                  class="card-img-in-card-dashboard-game-stats"
                  :src="randomGameBackgroundForToPlayGames"
                  height="100%"
                  cover
                />
                <img
                  :src="toPlayAnimImg"
                  class="img-anim"
                  :width="isSmallScreen ? 40 : 70"
                />
                <div
                  class="card-content-in-card-dashboard-game-stats d-flex align-center flex-wrap justiy-center justify-sm-space-between rounded-lg pa-1 pa-lg-2 ga-2"
                >
                  <p
                    class="text-subtitle-2 text-md-subtitle-1 text-lg-h5 text-center default-title-letter text-grey-lighten-1"
                  >
                    Oynanacak Oyun
                  </p>

                  <p
                    class="text-subtitle-1 text-lg-h5 text-xl-h4 default-title-letter"
                    style="color: #86ddfd"
                  >
                    {{ toPlayGames?.length }}
                  </p>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" lg="4">
              <v-card
                class="admin-game-stat-card bg-transparent rounded-lg"
                :ripple="false"
                :height="!isLargeScreen ? 'auto' : 315"
              >
                <v-img
                  class="card-img-in-card-dashboard-game-stats"
                  :src="randomGameBackgroundForCurrentGames"
                  height="100%"
                  cover
                />
                <div
                  class="scan-dot"
                  :style="{
                    width: isSmallScreen ? '14px' : '20px',
                    height: isSmallScreen ? '14px' : '20px',
                  }"
                ></div>

                <div
                  class="card-content-in-card-dashboard-game-stats d-flex align-center flex-wrap justiy-center justify-sm-space-between rounded-lg pa-1 pa-lg-2 ga-2"
                >
                  <p
                    class="text-subtitle-2 text-md-subtitle-1 text-lg-h5 text-center default-title-letter text-grey-lighten-1"
                  >
                    Şuanda Oynanan
                  </p>

                  <p
                    class="text-subtitle-1 text-lg-h5 text-xl-h4 default-title-letter"
                    style="color: #ff1d1d"
                  >
                    {{ currentGames?.length }}
                  </p>
                </div>
              </v-card>
            </v-col>
          </v-row>

    <header class="admin-dash-section-header mt-4 mb-4">
      <div class="admin-dash-section-icon admin-dash-section-icon--blog">
        <v-icon icon="mdi-post-outline" size="22" color="#81c784" />
      </div>
      <div class="admin-dash-section-text">
        <h2 class="admin-dash-section-title default-title-letter">Son Blog Yazıları</h2>
        <p class="admin-dash-section-sub">En son eklenen 3 yazı</p>
      </div>
      <div class="admin-dash-section-line" aria-hidden="true" />
    </header>
    <v-row class="w-100 mx-auto mb-3" :dense="isSmallScreen">
            <v-col cols="12" lg="4" v-for="(item, index) of lastBlogs" :key="index">
              <v-card
                class="admin-game-stat-card admin-blog-stat-card bg-transparent rounded-lg"
                :ripple="false"
                :height="!isLargeScreen ? 'auto' : 315"
              >
                <v-img
                  class="card-img-in-card-dashboard-game-stats"
                  :src="item.imageUrl"
                  height="100%"
                  cover
                />
                <img class="blog-img-gif" :src="blogAnimImg" width="50" />

                <div
                  class="card-content-in-card-dashboard-game-stats d-flex align-center flex-wrap justiy-center rounded-lg pa-1 pa-lg-2 ga-2"
                >
                  <p
                    class="text-subtitle-2 text-lg-subtitle-1 text-center text-lg-start default-title-letter text-grey-lighten-1"
                  >
                    {{
                      display.lgAndUp.value ? truncateText(item.title, 60) : item.title
                    }}
                  </p>

                  <div class="w-100">
                    <p
                      class="text-caption text-lg-subtile-2 default-title-letter text-white text-center text-sm-end"
                    >
                      {{ formatDateTR(item?.createdAt) }}
                    </p>
                  </div>
                </div>
              </v-card>
            </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import {
  normalizeText,
  useFirestoreDateFormatted,
  useTRFormat,
} from "~/composables/data/handleData";
import type { AdminListItemSlug, Youtube_Channel_Stats } from "~/composables/core/interfaces";
import { truncateText } from "~/composables/core/basicFunc";
import { collection, getDocs } from "firebase/firestore";
import axios from "axios";
import store from "~/store/store";
import _ from "lodash";
import adminLogoImg from "~/assets/img/logo_fixed.webp";
import adminZeynepCansuKatarImg from "~/assets/img/admin_zeynep_cansu_katar.jpg";
import adminGokhanKatarImg from "~/assets/img/admin_gokhan_katar.jpg";
import successfullyDoneImg from "~/assets/img/successfully_done_anim.gif";
import toPlayAnimImg from "~/assets/img/progress_anim.gif";
import blogAnimImg from "~/assets/img/blog_anim.gif";
import Admin_Goal_Ring_Metric from "./Admin_Goal_Ring_Metric.vue";

const { $firestore } = useNuxtApp();
const { formatTR } = useTRFormat();
const { formatDateTR } = useFirestoreDateFormatted();

const _store = store();

const goToAdminSection = (slug: AdminListItemSlug) => {
  _store.setActiveAdminListItem(slug as any);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const display = useDisplay();
const isSmallScreen = computed(() => display.smAndDown.value);
const isMediumScreen = computed(() => display.mdAndUp.value);
const isLargeScreen = computed(() => display.lgAndUp.value);

const isGettingCompletedGames = ref(false);
const isGettingToPlayGames = ref(false);
const isGettingCurrentGame = ref(false);
const isGettingBlogs = ref(false);
const isGettingRegisteredUsers = ref(false);
const isGettingMessages = ref(false);
const isGettingRecommendedGames = ref(false);

const completedGames = ref<any[]>([]);
const toPlayGames = ref<any[]>([]);
const currentGames = ref<any[]>([]);
const lastBlogs = ref<any[]>([]);
const totalBlogCount = ref<number>(0);
const registeredUsersCount = ref<number>(0);
const messagesCount = ref<number>(0);
const recommendedGamesCount = ref<number>(0);

const youtubeChannelStats = ref<Youtube_Channel_Stats | null>({
  hiddenSubscriberCount: null,
  videoCount: null,
  viewCount: null,
  subscriberCount: null,
});

const getYoutubeChannelInfos = async () => {
  try {
    const res = await axios.get("/api/youtube-channel-infos");

    youtubeChannelStats.value = res.data.statistics;
  } catch (err: any) {
    console.error("Error getting YouTube stats:", err.message);
  }
};

const randomGameBackgroundForCompletedGames = computed(() => {
  if (!completedGames.value.length) return null;

  const randomIndex = Math.floor(Math.random() * completedGames.value.length);
  return completedGames.value[randomIndex].background_image;
});

const randomGameBackgroundForToPlayGames = computed(() => {
  if (!toPlayGames.value.length) return null;

  const randomIndex = Math.floor(Math.random() * toPlayGames.value.length);
  return toPlayGames.value[randomIndex].background_image;
});

const randomGameBackgroundForCurrentGames = computed(() => {
  if (!currentGames.value || !currentGames.value.length) return null;

  const randomIndex = Math.floor(Math.random() * currentGames.value.length);
  return currentGames.value[randomIndex]?.background_image || null;
});

const getCompletedGames = async () => {
  try {
    isGettingCompletedGames.value = true;

    const gamesCol = collection($firestore, "completed_games");
    const gamesSnapshot = await getDocs(gamesCol);

    const gamesList = gamesSnapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
    }));

    completedGames.value = gamesList;
  } catch (error) {
    console.error("Error getting games :", error);
    return [];
  } finally {
    setTimeout(() => {
      isGettingCompletedGames.value = false;
    }, 250);
  }
};

const getToPlayGames = async () => {
  try {
    isGettingToPlayGames.value = true;

    const gamesCol = collection($firestore, "to_play_games");
    const gamesSnapshot = await getDocs(gamesCol);

    const gamesList = gamesSnapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
    }));

    toPlayGames.value = gamesList;
  } catch (error) {
    console.error("Error getting games :", error);
    return [];
  } finally {
    setTimeout(() => {
      isGettingToPlayGames.value = false;
    }, 250);
  }
};

const getCurrentGames = async () => {
  try {
    isGettingCurrentGame.value = true;

    const gamesCol = collection($firestore, "current_games");
    const gamesSnapshot = await getDocs(gamesCol);

    const gamesList = gamesSnapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
    }));

    currentGames.value = gamesList;
  } catch (error) {
    console.error("Error getting games :", error);
    return [];
  } finally {
    setTimeout(() => {
      isGettingCurrentGame.value = false;
    }, 250);
  }
};

const getBlogsFromDb = async () => {
  try {
    isGettingBlogs.value = true;
    const blogsCol = collection($firestore, "blogs");
    const blogsSnapshot = await getDocs(blogsCol);

    const blogsList = blogsSnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        firestoreId: doc.id,
        ...data,
        keywords: (data.keywords ?? []).map((k: string) => normalizeText(k)),
      };
    });

    totalBlogCount.value = blogsList?.length;

    const sorted = _.orderBy(
      blogsList,
      [(item: any) => item.createdAt?.seconds ?? 0],
      ["desc"]
    );

    // 🔥 Last 3 blogs
    lastBlogs.value = sorted.slice(0, 3);
  } catch (error: any) {
    console.error("Error while getting blogs : ", error.message);
  } finally {
    isGettingBlogs.value = false;
  }
};

const getRegisteredUsers = async () => {
  try {
    isGettingRegisteredUsers.value = true;
    const registeredUsersCol = collection($firestore, "registered_users");
    const registeredUsersSnapshot = await getDocs(registeredUsersCol);

    const registeredUsersList = registeredUsersSnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        firestoreId: doc.id,
        ...data,
      };
    });

    registeredUsersCount.value = registeredUsersList?.length;
  } catch (error: any) {
    console.error("Error while getting registered users : ", error.message);
  } finally {
    isGettingRegisteredUsers.value = false;
  }
};

const getRecommendedGames = async () => {
  try {
    isGettingRecommendedGames.value = true;
    const recommendedGamesCol = collection($firestore, "recommended_games");
    const recommendedGamesSnapshot = await getDocs(recommendedGamesCol);

    const recommendedGamesList = recommendedGamesSnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        firestoreId: doc.id,
        ...data,
      };
    });

    recommendedGamesCount.value = recommendedGamesList?.length;
  } catch (error: any) {
    console.error("Error while getting registered users : ", error.message);
  } finally {
    isGettingRecommendedGames.value = false;
  }
};

const getMessages = async () => {
  try {
    isGettingMessages.value = true;
    const messagesCol = collection($firestore, "messages");
    const messagesSnapshot = await getDocs(messagesCol);

    const messagesList = messagesSnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        firestoreId: doc.id,
        ...data,
      };
    });

    messagesCount.value = messagesList?.length;
  } catch (error: any) {
    console.error("Error while getting registered users : ", error.message);
  } finally {
    isGettingMessages.value = false;
  }
};

onMounted(() => {
  getYoutubeChannelInfos();
  getCompletedGames();
  getToPlayGames();
  getCurrentGames();
  getBlogsFromDb();
  getRegisteredUsers();
  getRecommendedGames();
  getMessages();
});
</script>

<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/admin.css");
</style>
