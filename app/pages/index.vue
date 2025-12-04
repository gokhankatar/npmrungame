<template>
  <div class="banner-container">
    <div
      class="banner-content d-flex flex-column align-center align-md-start ga-1 ga-md-3 ga-lg-5"
    >
      <p class="banner-content-title text-subtitle-1 text-md-h5 text-lg-h4 text-xl-h3">
        Sende Günden Güne Büyüyen Ekosistemin Bir Parçası Ol!
      </p>
      <div class="d-flex align center ga-2 ga-xl-5">
        <div
          class="discover-btn pa-1 pa-xl-3 d-flex align-center ga-2 ga-xl-5 cursor-pointer"
        >
          <v-icon
            class="discover-icon"
            icon="mdi-earth"
            :size="extraLgScreen ? 'medium' : 'x-small'"
          />
          <p
            class="text-subtitle-2 text-md-subtitle-1 text-xl-h5"
            style="letter-spacing: 1px !important; font-weight: 500"
          >
            Keşfet
          </p>
        </div>

        <div
          class="subscribe-btn pa-1 pa-xl-3 d-flex align-center ga-2 ga-xl-5 cursor-pointer"
        >
          <v-icon
            class="bell-icon"
            icon="mdi-bell"
            :size="extraLgScreen ? 'medium' : 'x-small'"
          />
          <p
            class="text-subtitle-2 text-md-subtitle-1 text-xlz-h5"
            style="letter-spacing: 1px !important; font-weight: 500"
          >
            Abone Ol
          </p>
        </div>
      </div>
    </div>
  </div>

  <v-responsive height="100vh" />

  <v-container class="pa-0 pa-lg-10 pa-xl-15">
    <v-row class="w-100 mx-auto my-5" :dense="smallScreen">
      <v-col cols="12" md="8" class="d-flex justify-center justify-sm-start">
        <p
          class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-blue-grey-lighten-1 default-title-letter"
        >
          Kanaldan Bazı Kesitler
        </p>
      </v-col>

      <v-col cols="12" md="4" class="d-flex justify-center justify-sm-end">
        <Animated_Text
          @click="goToChannel"
          text="npmrungame"
          class="cursor-pointer"
          :msPerChar="50"
          :duration="550"
          :loop="true"
        />
      </v-col>

      <v-divider class="mt-2 mb-5 w-100" />

      <!-- Channel Scenes -->
      <v-row :dense="smallScreen" class="mt-2 mt-lg-5">
        <v-col
          v-for="item in videos"
          :key="item.video_src"
          cols="12"
          md="6"
          lg="4"
          xl="3"
          class="video-container"
        >
          <!-- Skeleton Overlay -->
          <v-skeleton-loader
            v-if="isLoadedVideos"
            class="rounded-xl overlay"
            :height="300"
          />
          <v-video
            v-else
            class="align-self-center"
            :image="item.video_img"
            rounded="xl"
            :autoplay="true"
            :density="display.lgAndUp.value ? 'comfortable' : 'compact'"
            :controls-variant="smallScreen ? 'mini' : 'tube'"
            :src="item.video_src"
            :muted="false"
            color="green-accent-2"
            controls
            volume="0"
            eager
            loop
          >
            <template v-slot:header v-if="!display.xs.value">
              <div class="d-flex pa-2 pointer-pass-through">
                <v-chip
                  class="video-header-element"
                  prepend-avatar="https://yt3.ggpht.com/f-Wk3V3N7KtLUXiRTs5ukoRBzLcILBVyt0_z3i_32xup1qg83dxlciDvComml_cJuL71c0ilWBo=s176-c-k-c0x00ffffff-no-rj"
                  rounded="pill"
                  :text="item.video_name"
                />
                <v-tooltip location="top" text="Videonun tamamını izle">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
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
        </v-col>
      </v-row>

      <!-- why npmrungame -->
      <v-col cols="12">
        <div
          class="d-flex flex-column align-center justify-center ga-2 ga-lg-5 my-3 my-sm-5 my-lg-10 my-xl-15"
        >
          <p
            class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-blue-grey-lighten-1 default-title-letter"
          >
            Neden npmrungame ?
          </p>

          <v-divider class="w-100 w-lg-50" color="white" />
        </div>
      </v-col>

      <v-col
        cols="6"
        lg="4"
        xl="3"
        v-for="(item, index) of feature_cards"
        :key="item.title"
      >
        <v-card
          class="feature-card transition rounded-xl pa-2 pa-lg-5 d-flex flex-column align-center align-md-start justify-center justify-md-start ga-2 ga-lg-5 cursor-default"
          :ripple="false"
          :hover="false"
          :elevation="0"
          :height="display.mdAndDown.value ? 100 : 230"
        >
          <v-icon
            :icon="item.icon"
            color="grey-lighten-1"
            class="feature-card-icon"
            :size="smallScreen ? 'small' : 'large'"
          />
          <p
            class="feature-card-title text-center text-md-start text-grey-lighten-1 text-caption text-sm-subtitle-2 text-lg-subtitle-1 default-title-letter"
          >
            {{ item.title }}
          </p>

          <p
            v-if="!display.mdAndDown.value"
            class="feature-description text-caption text-lg-subtitle-2 text-grey-darken-1 default-title-letter"
          >
            {{ item.description }}
          </p>
        </v-card>
      </v-col>

      <!-- npmrungame current play -->
      <v-row
        class="w-100 mx-auto d-flex justify-center align-center"
        v-if="currentGames?.length"
      >
        <v-col cols="12">
          <div
            class="d-flex flex-column align-center justify-center ga-2 ga-lg-5 my-3 my-sm-5 my-lg-10 my-xl-15"
          >
            <div class="d-flex align-center ga-2 ga-lg-3">
              <div
                class="scan-dot-home-page"
                :style="{
                  width: smallScreen ? '14px' : '20px',
                  height: smallScreen ? '14px' : '20px',
                }"
              ></div>
              <p
                class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-blue-grey-lighten-1 default-title-letter"
              >
                Şu Sıralar Ne Oynuyor ?
              </p>
            </div>

            <v-divider class="w-100 w-lg-50" color="white" />
          </div>
        </v-col>

        <v-col
          v-for="(item, index) of currentGames"
          :key="index"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-skeleton-loader
            v-if="isGettingCurrentGame"
            type="card"
            class="rounded-lg h-100"
          />

          <v-card
            v-if="!isGettingCurrentGame"
            class="game-card bg-transparent rounded-lg cursor-pointer transition"
            :height="smallScreen ? 250 : 375"
            :ripple="false"
            @click="handleRowClick(item)"
          >
            <v-img
              :src="item.background_image"
              class="game-card-img h-100 rounded-lg"
              cover
            />

            <!-- Playtime -->
            <v-tooltip text="Toplam oynama süresi (Ana Hikaye)" location="top">
              <template #activator="{ props }">
                <v-chip
                  v-if="item.playtime"
                  v-bind="props"
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

            <!-- Metacritic -->
            <v-tooltip text="Metacritic puanı" location="top">
              <template #activator="{ props }">
                <v-chip
                  v-if="item.metacritic"
                  v-bind="props"
                  class="metacritic-point rounded-xl ma-1 ma-lg-2"
                  :ripple="false"
                  size="small"
                  :prepend-icon="item.metacritic < 90 ? 'mdi-star-outline' : ''"
                  :prepend-avatar="item.metacritic >= 90 ? fireAnimation : ''"
                  variant="elevated"
                  :color="useMetacriticStyle(item.metacritic).color"
                  :text="item.metacritic"
                />
              </template>
            </v-tooltip>

            <div
              class="game-card-info d-flex flex-column align-start ga-1 ga-lg-2 pa-1 pa-lg-2"
            >
              <!-- Name & Date -->
              <div class="d-flex flex-column align-start">
                <p
                  class="default-title-letter text-caption text-lg-subtitle-2 text-white"
                >
                  {{ item.name }}
                </p>
                <p class="text-white text-caption">
                  {{ new Date(item.released).getFullYear() }}
                </p>

                <!-- Platforms -->
                <div class="d-flex align-center flex-wrap ga-1">
                  <template
                    v-for="icon in getUniquePlatformIcons(item.platforms)"
                    :key="icon"
                  >
                    <v-icon
                      v-if="icon"
                      size="x-small"
                      color="grey-lighten-1"
                      :icon="icon"
                    />
                  </template>
                </div>
              </div>

              <!-- Genres -->
              <div class="d-flex flex-wrap ga-1">
                <v-chip
                  v-for="(genre, index) in item.genres"
                  :key="index"
                  :size="smallScreen ? 'x-small' : 'small'"
                  variant="outlined"
                  :ripple="false"
                  :text="genre.name"
                />
              </div>

              <!-- Tags -->
              <div class="d-none d-md-flex flex-wrap ga-1">
                <v-chip
                  v-for="(tag, index) in useLimitedTags(item.tags, 3).visibleTags"
                  :key="index"
                  color="grey-darken-1"
                  size="x-small"
                  class="rounded text-black"
                  variant="elevated"
                  :ripple="false"
                  :text="truncateText(tag.name, 15)"
                />
                <v-chip
                  v-if="useLimitedTags(item.tags, 3).hiddenCount > 0"
                  color="grey-darken-2"
                  size="x-small"
                  variant="elevated"
                  class="rounded text-white"
                  :ripple="false"
                  :text="useLimitedTags(item.tags, 3).hiddenText"
                />
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Subscription Input -->
      <v-col cols="12">
        <div
          class="d-flex flex-column align-center justify-center ga-2 ga-lg-5 my-3 my-sm-5 my-lg-10 my-xl-15"
        >
          <div class="d-flex justify-center align-center ga-2 ga-lg-3">
            <v-icon
              icon="mdi-bell"
              class="bell-shake"
              :size="smallScreen ? 20 : 32"
              color="blue-grey-darken-1"
            />
            <p
              class="text-center text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-blue-grey-lighten-1 default-title-letter"
            >
              Gelişmelerden Haberdar Olun
            </p>
          </div>

          <v-divider class="w-100 w-lg-50" color="white" />

          <div
            class="input-container w-100 w-lg-75 w-xl-50 d-flex flex-column align-center justify-center ga-2 ga-lg-4"
          >
            <p
              class="text-center text-caption text-sm-subtitle-2 text-lg-subtitle-1 default-title-letter text-grey-lighten-1"
            >
              Yeni oyunlar, bloglar, ödüller ve önemli gelişmelerden haberdar olmak için
              e-posta adresini bırakabilirsin.
            </p>

            <v-text-field
              v-model="email"
              variant="outlined"
              label="Email"
              rounded="xl"
              prepend-inner-icon="mdi-email"
              :rules="[emailRule]"
              :density="smallScreen ? 'compact' : 'comfortable'"
              class="subs-email-input text-caption text-lg-subtitle-2 text-grey-lighten-3 default-title-letter w-100 w-lg-50"
            >
              <template #append-inner>
                <v-btn
                  icon="mdi-send"
                  size="small"
                  color="blue-lighten-1"
                  :disabled="!emailIsValid"
                  :ripple="false"
                  :variant="emailIsValid ? 'elevated' : 'text'"
                  @click="handleSubmit"
                  class="subs-email-btn"
                />
              </template>
            </v-text-field>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts" setup>
import { collection, getDocs } from "firebase/firestore";
import Animated_Text from "~/components/common/Animated_Text.vue";
import { truncateText } from "~/composables/core/basicFunc";
import {
  getUniquePlatformIcons,
  useLimitedTags,
  useMetacriticStyle,
} from "~/composables/data/handleData";
import store from "~/store/store";
import fireAnimation from "~/assets/img/fire_anim.gif";

useHead({
  title: "npmrungame",
});

const { $firestore } = useNuxtApp();

const _store = store();
const router = useRouter();
const config = useRuntimeConfig();

// screen breakout
const display = useDisplay();
const smallScreen = computed(() => display.smAndDown.value);
const extraLgScreen = computed(() => display.xlAndUp.value);

const isLoadedVideos = ref(false);
const isGettingCurrentGame = ref(false);
const isSuccessfulSendMail = ref(false);

const email = ref<string>("");
const currentGames = ref<any[]>([]);
const videos = ref<any[]>([]);

const getVideosFromDb = async () => {
  try {
    isLoadedVideos.value = true;

    const colRef = collection($firestore, "npmrungame_yt_videos");
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) return;

    videos.value = snapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    console.error(error.message);
  } finally {
    setTimeout(() => {
      isLoadedVideos.value = false;
    }, 1200);
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

const goToChannel = () => {
  let url = "https://www.youtube.com/@npmrungame";
  window.open(url, "_blank");
};

const handleRowClick = (item: any) => {
  _store.setActiveDetailedGame(item.id, item.name);
  router.replace(`/game-detail/${item.name}`);
};

const emailRule = (v: string) => {
  return /.+@.+\..+/.test(v) || "Geçerli bir e-posta adresi gir.";
};

const emailIsValid = computed(() => /.+@.+\..+/.test(email.value));

const handleSubmit = () => {
  console.log("Gönderilen mail:", email.value);
  // burada API çağırırsın
};

onMounted(() => {
  getVideosFromDb();
  getCurrentGames();
});
</script>

<style scoped>
@import url("~/assets/css/main.css");
</style>
