<template>
  <v-row>
    <v-col cols="12">
      <div class="d-flex flex-column align-start ga-1 ga-lg-3">
        <!-- Title -->
        <div class="d-flex align-center ga-2">
          <v-avatar :image="adminLogoImg" />
          <p
            class="default-title-letter text-subtitle-2 text-md-subtitle-1 text-lg-h5 text-xl-h4"
          >
            Admin
          </p>
        </div>

        <v-divider color="white" class="w-100 mb-5" />

        <v-row class="mx-auto w-100" :dense="isSmallScreen">
          <!-- Account Informations -->
          <v-col cols="12" lg="4">
            <v-card
              class="card-admin-panel-info d-flex flex-column align-start justify-center ga-1 ga-lg-2 pa-2 pa-lg-5 rounded-xl w-100"
              :elevation="0"
              :ripple="false"
              :height="isMediumScreen ? 350 : 'auto'"
            >
              <!-- Email -->
              <div class="d-flex flex-wrap align-center ga-2">
                <v-chip
                  :ripple="false"
                  text="Email"
                  color="grey"
                  variant="tonal"
                  rounded="xl"
                  :size="isSmallScreen ? 'small' : 'large'"
                  prepend-icon="mdi-email"
                />
                <p class="text-grey-lighten-1 text-caption text-lg-subtitle-2">
                  npmrungame@gmail.com
                </p>
              </div>

              <!-- Last Login -->
              <div class="d-flex flex-wrap align-center ga-2">
                <v-chip
                  :ripple="false"
                  text="Son Giriş"
                  color="grey"
                  variant="tonal"
                  rounded="xl"
                  :size="isSmallScreen ? 'small' : 'large'"
                  prepend-icon="mdi-update"
                />
                <p class="text-grey-lighten-1 text-caption text-lg-subtitle-2">
                  {{
                    formatTR(_store.admin_user?.lastLoginAt as string) }}
                </p>
              </div>

              <!-- Created Time -->
              <div class="d-flex flex-wrap align-center ga-2">
                <v-chip
                  :ripple="false"
                  text="Hesabın Oluşturulduğu Tarih"
                  color="grey"
                  variant="tonal"
                  rounded="xl"
                  :size="isSmallScreen ? 'small' : 'large'"
                  prepend-icon="mdi-calendar-range"
                />
                <p class="text-grey-lighten-1 text-caption text-lg-subtitle-2">
                  {{
                    formatTR(_store.admin_user?.createdAt as string) }}
                </p>
              </div>

              <!-- Admin Authority -->
              <div class="d-flex flex-wrap align-center ga-2">
                <v-chip
                  :ripple="false"
                  text="Admin Yetkili Kişiler"
                  color="grey"
                  variant="tonal"
                  rounded="xl"
                  :size="isSmallScreen ? 'small' : 'large'"
                  prepend-icon="mdi-key"
                />
                <div class="d-flex align-center ga-1">
                  <v-tooltip text="Zeynep Cansu Katar" location="top">
                    <template #activator="{ props }">
                      <v-avatar v-bind="props" :image="adminZeynepCansuKatarImg" />
                    </template>
                  </v-tooltip>

                  <v-tooltip text="Gökhan Katar" location="top">
                    <template #activator="{ props }">
                      <v-avatar v-bind="props" :image="adminGokhanKatarImg" />
                    </template>
                  </v-tooltip>
                </div>
              </div>
            </v-card>
          </v-col>

          <!-- Messages & Registered Users -->
          <v-col cols="12" md="6" lg="4">
            <v-card
              class="card-admin-panel-info d-flex flex-column align-center justify-center pa-2 pa-lg-5 rounded-xl w-100"
              :elevation="0"
              :height="isMediumScreen ? 350 : 'auto'"
            >
              <v-row class="w-100 mx-auto">
                <!-- Registered Users Count -->
                <v-col cols="6">
                  <v-card
                    class="card-yt-stats d-flex flex-column justify-center align-center ga-1 ga-lg-2 pa-2 pa-lg-5 rounded-xl w-100 h-100"
                    :elevation="0"
                  >
                    <v-icon
                      v-if="!isSmallScreen"
                      :size="isMediumScreen ? 'small' : 'large'"
                      icon="mdi-account"
                      color="green-accent-2"
                    />
                    <p
                      class="default-title-letter text-center text-caption text-lg-subtitle-2 text-xl-subtitle-1"
                    >
                      Kayıtlı Kullanıcı
                    </p>
                    <v-progress-circular
                      v-if="isGettingRegisteredUsers"
                      color="green-accent-2"
                      size="16"
                      width="2"
                      indeterminate
                    />
                    <p
                      v-else
                      class="text-green-accent-2 text-subtitle-2 text-lg-subtitle-1 text-xl-h5 font-weight-bold default-title-letter"
                    >
                      {{ registeredUsersCount }}
                    </p>
                  </v-card>
                </v-col>

                <!-- Messages Count -->
                <v-col cols="6">
                  <v-card
                    class="card-yt-stats d-flex flex-column justify-center align-center ga-1 ga-lg-2 pa-2 pa-lg-5 rounded-xl w-100 h-100"
                    :elevation="0"
                  >
                    <v-icon
                      v-if="!isSmallScreen"
                      :size="isMediumScreen ? 'small' : 'large'"
                      icon="mdi-email-outline"
                      color="green-accent-2"
                    />
                    <p
                      class="default-title-letter text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-center"
                    >
                      Gelen Mesaj
                    </p>

                    <v-progress-circular
                      v-if="isGettingMessages"
                      color="green-accent-2"
                      size="16"
                      width="2"
                      indeterminate
                    />
                    <p
                      v-else
                      class="text-green-accent-2 text-subtitle-2 text-lg-subtitle-1 text-xl-h5 font-weight-bold default-title-letter"
                    >
                      {{ messagesCount }}
                    </p>
                  </v-card>
                </v-col>

                <!-- Recommend Games Count -->
                <v-col cols="6">
                  <v-card
                    class="card-yt-stats d-flex flex-column justify-center align-center ga-1 ga-lg-2 pa-2 pa-lg-5 rounded-xl w-100 h-100"
                    :elevation="0"
                  >
                    <v-icon
                      v-if="!isSmallScreen"
                      :size="isMediumScreen ? 'small' : 'large'"
                      icon="mdi-gamepad-up"
                      color="green-accent-2"
                    />
                    <p
                      class="default-title-letter text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-center"
                    >
                      Önerilen Oyun
                    </p>

                    <v-progress-circular
                      v-if="isGettingRecommendedGames"
                      color="green-accent-2"
                      size="16"
                      width="2"
                      indeterminate
                    />
                    <p
                      v-else
                      class="text-green-accent-2 text-subtitle-2 text-lg-subtitle-1 text-xl-h5 font-weight-bold default-title-letter"
                    >
                      {{ recommendedGamesCount }}
                    </p>
                  </v-card>
                </v-col>

                <!-- Total Blog Count -->
                <v-col cols="6">
                  <v-card
                    class="card-yt-stats d-flex flex-column justify-center align-center ga-1 ga-lg-2 pa-2 pa-lg-5 rounded-xl w-100 h-100"
                    :elevation="0"
                  >
                    <v-icon
                      v-if="!isSmallScreen"
                      :size="isMediumScreen ? 'small' : 'large'"
                      icon="mdi-post"
                      color="green-accent-2"
                    />
                    <p
                      class="default-title-letter text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-center"
                    >
                      Toplam Blog
                    </p>
                    <v-progress-circular
                      v-if="isGettingBlogs"
                      color="green-accent-2"
                      size="16"
                      width="2"
                      indeterminate
                    />
                    <p
                      v-else
                      class="text-green-accent-2 text-subtitle-2 text-lg-subtitle-1 text-xl-h5 font-weight-bold default-title-letter"
                    >
                      {{ totalBlogCount }}
                    </p>
                  </v-card>
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <!-- Youtube Stats Cards -->
          <v-col cols="12" md="6" lg="4">
            <v-card
              class="card-admin-panel-info d-flex flex-column align-center justify-center pa-2 pa-lg-5 rounded-xl w-100"
              :elevation="0"
              :height="isMediumScreen ? 350 : 'auto'"
            >
              <v-row class="w-100 mx-auto">
                <v-col cols="6">
                  <v-card
                    class="card-yt-stats d-flex flex-column justify-center align-center ga-1 ga-lg-2 pa-2 pa-lg-5 rounded-xl w-100 h-100"
                    :elevation="0"
                  >
                    <p
                      class="default-title-letter text-center text-caption text-lg-subtitle-2 text-xl-subtitle-1"
                    >
                      Abone Gizlik
                    </p>
                    <v-icon
                      :icon="
                        youtubeChannelStats?.hiddenSubscriberCount
                          ? 'mdi-eye'
                          : 'mdi-eye-off'
                      "
                      :size="isSmallScreen ? 'small' : 'large'"
                      color="blue-lighten-1"
                    />
                  </v-card>
                </v-col>

                <v-col cols="6">
                  <v-card
                    class="card-yt-stats d-flex flex-column justify-center align-center ga-1 ga-lg-2 pa-2 pa-lg-5 rounded-xl w-100 h-100"
                    :elevation="0"
                  >
                    <v-icon
                      v-if="!isSmallScreen"
                      :size="isMediumScreen ? 'small' : 'large'"
                      icon="mdi-youtube-subscription"
                      color="blue-lighten-1"
                    />
                    <p
                      class="default-title-letter text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-center"
                    >
                      Abone Sayısı
                    </p>
                    <p
                      class="text-blue-lighten-1 text-subtitle-2 text-lg-subtitle-1 text-xl-h5 font-weight-bold default-title-letter"
                    >
                      {{ youtubeChannelStats?.subscriberCount }}
                    </p>
                  </v-card>
                </v-col>

                <v-col cols="6">
                  <v-card
                    class="card-yt-stats d-flex flex-column justify-center align-center ga-1 ga-lg-2 pa-2 pa-lg-5 rounded-xl w-100 h-100"
                    :elevation="0"
                  >
                    <v-icon
                      v-if="!isSmallScreen"
                      :size="isMediumScreen ? 'small' : 'large'"
                      icon="mdi-eye"
                      color="blue-lighten-1"
                    />
                    <p
                      class="default-title-letter text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-center"
                    >
                      Toplam İzlenme
                    </p>
                    <p
                      class="text-blue-lighten-1 text-subtitle-2 text-lg-subtitle-1 text-xl-h5 font-weight-bold default-title-letter"
                    >
                      {{ youtubeChannelStats?.viewCount }}
                    </p>
                  </v-card>
                </v-col>

                <v-col cols="6">
                  <v-card
                    class="card-yt-stats d-flex flex-column justify-center align-center ga-1 ga-lg-2 pa-2 pa-lg-5 rounded-xl w-100 h-100"
                    :elevation="0"
                  >
                    <v-icon
                      v-if="!isSmallScreen"
                      :size="isMediumScreen ? 'small' : 'large'"
                      icon="mdi-monitor"
                      color="blue-lighten-1"
                    />
                    <p
                      class="default-title-letter text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-center"
                    >
                      Toplam Video
                    </p>
                    <p
                      class="text-blue-lighten-1 text-subtitle-2 text-lg-subtitle-1 text-xl-h5 font-weight-bold default-title-letter"
                    >
                      {{ youtubeChannelStats?.videoCount }}
                    </p>
                  </v-card>
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <!-- Game Cards -->
          <v-row class="w-100 mx-auto my-3" :dense="isSmallScreen">
            <v-col cols="12">
              <Animated_Text
                text="Oyun Bilgileri"
                class="cursor-pointer"
                :msPerChar="50"
                :duration="550"
                :loop="true"
              />
            </v-col>

            <!-- Completed Game Card -->
            <v-col cols="12" sm="6" lg="4">
              <v-card
                class="bg-transparent rounded-lg"
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

            <!-- To Play Game Card -->
            <v-col cols="12" sm="6" lg="4">
              <v-card
                class="bg-transparent rounded-lg"
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

            <!-- Current Game Card -->
            <v-col cols="12" lg="4">
              <v-card
                class="bg-transparent rounded-lg"
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

          <!-- Last Blogs -->
          <v-row class="w-100 mx-auto my-3" :dense="isSmallScreen">
            <v-col cols="12">
              <Animated_Text
                text="Son Blog Yazıları"
                class="cursor-pointer"
                :msPerChar="50"
                :duration="1100"
                :loop="true"
              />
            </v-col>

            <v-col cols="12" lg="4" v-for="(item, index) of lastBlogs" :key="index">
              <v-card
                class="bg-transparent rounded-lg"
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
        </v-row>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import {
  normalizeText,
  useFirestoreDateFormatted,
  useTRFormat,
} from "~/composables/data/handleData";
import store from "~/store/store";
import adminLogoImg from "~/assets/img/logo_fixed.webp";
import adminZeynepCansuKatarImg from "~/assets/img/admin_zeynep_cansu_katar.jpg";
import adminGokhanKatarImg from "~/assets/img/admin_gokhan_katar.jpg";
import axios from "axios";
import type { Youtube_Channel_Stats } from "~/composables/core/interfaces";
import { collection, getDocs } from "firebase/firestore";
import successfullyDoneImg from "~/assets/img/successfully_done_anim.gif";
import toPlayAnimImg from "~/assets/img/progress_anim.gif";
import Animated_Text from "../common/Animated_Text.vue";
import blogAnimImg from "~/assets/img/blog_anim.gif";
import _ from "lodash";
import { truncateText } from "~/composables/core/basicFunc";

const { $firestore } = useNuxtApp();
const { formatTR } = useTRFormat();
const { formatDateTR } = useFirestoreDateFormatted();

const router = useRouter();
const _store = store();
const config = useRuntimeConfig();

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
  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${config.public.youtubeChannelId}&key=${config.public.youtubeApiKey}`;
  const response = await axios.get(url);

  youtubeChannelStats.value = response.data?.items[0]
    ?.statistics as Youtube_Channel_Stats;
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
