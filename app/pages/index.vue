<template>
  <Bg_Anim />

  <v-container class="pa-0 pa-lg-10 pa-xl-15">
    <v-row class="w-100 mx-auto my-5" :dense="smallScreen">
      <v-col cols="12" md="8" class="d-flex justify-center justify-sm-start">
        <p class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-blue-grey-lighten-1 default-title-letter">
          Kanaldan Bazı Kesitler
        </p>
      </v-col>

      <v-col cols="12" md="4" class="d-flex justify-center justify-sm-end">
        <Animated_Text @click="goToChannel" text="npmrungame" class="cursor-pointer" :msPerChar="50" :duration="550"
          :loop="true" />
      </v-col>

      <v-divider class="mt-2 mb-5 w-100" />

      <!-- Channel Scenes -->
      <v-row :dense="smallScreen" class="mt-2 mt-lg-5">
        <v-col v-for="item in videos" :key="item.video_src" cols="12" md="6" lg="4" xl="3" class="video-container">
          <!-- Skeleton Overlay -->
          <v-skeleton-loader v-if="isLoadedVideos" class="rounded-xl overlay" :height="300" />
          <v-video v-else class="align-self-center" :image="item.video_img" rounded="xl" :autoplay="true"
            :density="display.lgAndUp.value ? 'comfortable' : 'compact'"
            :controls-variant="smallScreen ? 'mini' : 'tube'" :src="item.video_src" :muted="false"
            color="green-accent-2" controls volume="0" eager loop>
            <template v-slot:header v-if="!display.xs.value">
              <div class="d-flex pa-2 pointer-pass-through">
                <v-chip class="video-header-element"
                  prepend-avatar="https://yt3.ggpht.com/f-Wk3V3N7KtLUXiRTs5ukoRBzLcILBVyt0_z3i_32xup1qg83dxlciDvComml_cJuL71c0ilWBo=s176-c-k-c0x00ffffff-no-rj"
                  rounded="pill" :text="item.video_name" />
                <v-tooltip location="top" text="Videonun tamamını izle">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" :href="item.video_full_link" target="_blank" :ripple="false" size="small"
                      icon="mdi-open-in-new" variant="text" class="ml-auto video-header-element" />
                  </template>
                </v-tooltip>
              </div>
            </template>
          </v-video>
        </v-col>
      </v-row>

      <!-- why npmrungame -->
      <v-col cols="12" class="mt-5">
        <div class="d-flex flex-column align-center justify-center ga-2 ga-lg-5 my-3 my-sm-5 my-lg-10 my-xl-15">
          <p class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-blue-grey-lighten-1 default-title-letter">
            Neden npmrungame ?
          </p>

          <v-divider class="w-100 w-lg-50" color="white" />
        </div>
      </v-col>

      <v-col cols="6" lg="4" xl="3" v-for="(item, index) of feature_cards" :key="item.title">
        <v-card
          class="feature-card transition rounded-xl pa-2 pa-lg-5 d-flex flex-column align-center align-lg-start justify-center justify-lg-start ga-2 ga-lg-5 cursor-default"
          :ripple="false" :hover="false" :elevation="0" :height="display.mdAndDown.value ? 100 : 230">
          <v-icon :icon="item.icon" color="grey-lighten-1" class="feature-card-icon"
            :size="smallScreen ? 'small' : 'large'" />
          <p
            class="feature-card-title text-center text-lg-start text-caption text-sm-subtitle-2 text-lg-subtitle-1 default-title-letter">
            {{ item.title }}
          </p>

          <p v-if="!display.mdAndDown.value"
            class="feature-description text-caption text-lg-subtitle-2 text-grey-darken-1 default-title-letter">
            {{ item.description }}
          </p>
        </v-card>
      </v-col>

      <!-- npmrungame current play -->
      <v-row class="w-100 mx-auto d-flex justify-center align-center mt-5" v-if="currentGames?.length">
        <v-col cols="12">
          <div class="d-flex flex-column align-center justify-center ga-2 ga-lg-5 my-3 my-sm-5 my-lg-10 my-xl-15">
            <div class="d-flex align-center ga-2 ga-lg-3">
              <div class="scan-dot-home-page" :style="{
                width: smallScreen ? '14px' : '20px',
                height: smallScreen ? '14px' : '20px',
              }"></div>
              <p class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-blue-grey-lighten-1 default-title-letter">
                Şu Sıralar Ne Oynuyor ?
              </p>
            </div>

            <v-divider class="w-100 w-lg-50" color="white" />
          </div>
        </v-col>

        <v-col v-for="(item, index) of currentGames" :key="index" cols="12" sm="6" md="4" lg="3">
          <v-skeleton-loader v-if="isGettingCurrentGame" type="card" class="rounded-lg h-100" />

          <v-card v-if="!isGettingCurrentGame" class="game-card bg-transparent rounded-lg cursor-pointer transition"
            :height="smallScreen ? 250 : 375" :ripple="false" @click="handleRowClick(item)">
            <v-img :src="item.background_image" class="game-card-img h-100 rounded-lg" cover />

            <!-- Playtime -->
            <v-tooltip text="Toplam oynama süresi (Ana Hikaye)" location="top">
              <template #activator="{ props }">
                <v-chip v-if="item.playtime" v-bind="props" class="playtime-icon rounded-xl ma-1 ma-lg-2"
                  :ripple="false" size="small" variant="elevated" prepend-icon="mdi-timer-outline" color="black"
                  :text="`${item.playtime} saat`" />
              </template>
            </v-tooltip>

            <!-- Metacritic -->
            <v-tooltip text="Metacritic puanı" location="top">
              <template #activator="{ props }">
                <v-chip v-if="item.metacritic" v-bind="props" class="metacritic-point rounded-xl ma-1 ma-lg-2"
                  :ripple="false" size="small" :prepend-icon="item.metacritic < 90 ? 'mdi-star-outline' : ''"
                  :prepend-avatar="item.metacritic >= 90 ? fireAnimation : ''" variant="elevated"
                  :color="useMetacriticStyle(item.metacritic).color" :text="item.metacritic" />
              </template>
            </v-tooltip>

            <div class="game-card-info d-flex flex-column align-start ga-1 ga-lg-2 pa-1 pa-lg-2">
              <!-- Name & Date -->
              <div class="d-flex flex-column align-start">
                <p class="default-title-letter text-caption text-lg-subtitle-2 text-white">
                  {{ item.name }}
                </p>
                <p class="text-white text-caption">
                  {{ new Date(item.released).getFullYear() }}
                </p>

                <!-- Platforms -->
                <div class="d-flex align-center flex-wrap ga-1">
                  <template v-for="icon in getUniquePlatformIcons(item.platforms)" :key="icon">
                    <v-icon v-if="icon" size="x-small" color="grey-lighten-1" :icon="icon" />
                  </template>
                </div>
              </div>

              <!-- Genres -->
              <div class="d-flex flex-wrap ga-1">
                <v-chip v-for="(genre, index) in item.genres" :key="index" :size="smallScreen ? 'x-small' : 'small'"
                  variant="outlined" :ripple="false" :text="genre.name" />
              </div>

              <!-- Tags -->
              <div class="d-none d-md-flex flex-wrap ga-1">
                <v-chip v-for="(tag, index) in useLimitedTags(item.tags, 3).visibleTags" :key="index"
                  color="grey-darken-1" size="x-small" class="rounded text-black" variant="elevated" :ripple="false"
                  :text="truncateText(tag.name, 15)" />
                <v-chip v-if="useLimitedTags(item.tags, 3).hiddenCount > 0" color="grey-darken-2" size="x-small"
                  variant="elevated" class="rounded text-white" :ripple="false"
                  :text="useLimitedTags(item.tags, 3).hiddenText" />
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Blogs -->
      <v-col cols="12" class="mt-5">
        <div class="d-flex flex-column align-center justify-center ga-2 ga-lg-5 my-3 my-sm-5 my-lg-10 my-xl-15">
          <div @click="router.replace('/blogs')" class="cursor-pointer d-flex justify-center align-center ga-2 ga-lg-3">
            <v-icon icon="mdi-post-outline" class="blog-bounce" :size="smallScreen ? 20 : 32"
              color="blue-grey-darken-1" />
            <p
              class="text-center text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-blue-grey-lighten-1 default-title-letter">
              Blog Yazılarımıza Göz At
            </p>
          </div>

          <v-divider class="w-100 w-lg-50" color="white" />
        </div>
      </v-col>

      <v-col cols="12" sm="6" lg="3" v-for="(item, index) of randomBlogs" :key="index">
        <v-card class="blog-card cursor-pointer" :ripple="false" :elevation="0" @click="handleBlogClick(item)"
          :height="getBlogCardHeight()">
          <div class="vote-icon ma-1 ma-lg-2" style="z-index: 10">
            <v-tooltip location="top">
              <template #activator="{ props }">
                <v-chip v-if="item?.average_votes > 0" v-bind="props" class="rounded-xl text-grey-darken-4"
                  variant="elevated" prepend-icon="mdi-thumb-up" :color="getRatingColor(item?.average_votes ?? 0)"
                  size="small" :ripple="false" :text="`${item?.average_votes?.toFixed(1) ?? 0} / 5`" />
              </template>
              <span>{{ item?.total_voters ?? 0 }} kişi oy verdi</span>
            </v-tooltip>
          </div>

          <v-img :src="item.imageUrl" class="blog-card-img rounded-lg w-100 h-50" cover />

          <v-card-actions class="d-flex flex-column align-start ga-1 ga-lg-2">
            <p class="text-subtitle-2 text-lg-subtitle-1 default-title-letter text-grey-lighten-1">
              {{ item.title }}
            </p>

            <p class="text-caption text-lg-subtitle-2 text-grey-darken-1">
              {{ truncateText(item.content_raw, 100) }}
            </p>

            <div class="d-flex d-sm-none d-flex flex-wrap align-center ga-1">
              <p class="text-caption text-grey-darken-1">Tarih :</p>
              <span class="text-caption text-grey-lighten-1">{{
                formatDateTR(item.createdAt)
              }}</span>
            </div>

            <div class="d-none d-sm-flex flex-wrap align-center ga-1">
              <v-chip class="rounded" variant="tonal" color="white" prepend-icon="mdi-tag" size="x-small"
                :ripple="false" v-for="(tag, tagIndex) of item.keywords" :text="tag" />
            </div>

            <div class="d-flex d-sm-none flex-wrap align-center ga-1">
              <p class="text-caption text-grey-darken-1">Etiketler :</p>
              <v-chip class="rounded" variant="tonal" color="green-accent-2" prepend-icon="mdi-tag" size="x-small"
                :ripple="false" v-for="(tag, tagIndex) of item.keywords" :text="tag" />
            </div>
          </v-card-actions>

          <span class="d-none d-sm-flex text-caption text-grey-lighten-1 ma-1 ma-lg-2">{{
            formatDateTR(item.createdAt)
          }}</span>
        </v-card>
      </v-col>

      <!-- Subscription Input -->
      <v-col cols="12" class="mt-5">
        <div class="d-flex flex-column align-center justify-center ga-2 ga-lg-5 my-3 my-sm-5 my-lg-10 my-xl-15">
          <div class="d-flex justify-center align-center ga-2 ga-lg-3">
            <v-icon icon="mdi-bell" class="bell-shake" :size="smallScreen ? 20 : 32" color="blue-grey-darken-1" />
            <p
              class="text-center text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-blue-grey-lighten-1 default-title-letter">
              Gelişmelerden Haberdar Olun
            </p>
          </div>

          <v-divider class="w-100 w-lg-50" color="white" />

          <div
            class="input-container w-100 w-lg-75 w-xl-50 d-flex flex-column align-center justify-center ga-2 ga-lg-4">
            <p
              class="text-center text-caption text-sm-subtitle-2 text-lg-subtitle-1 default-title-letter text-grey-lighten-1">
              Yeni oyunlar, bloglar, ödüller ve önemli gelişmelerden haberdar olmak için
              e-posta adresini bırakabilirsin.
            </p>

            <v-text-field v-model="email" variant="outlined" label="Email" rounded="xl" prepend-inner-icon="mdi-email"
              :rules="[emailRule]" :density="smallScreen ? 'compact' : 'comfortable'"
              class="subs-email-input text-caption text-lg-subtitle-2 text-grey-lighten-3 default-title-letter w-100 w-lg-50">
              <template #append-inner>
                <v-btn icon="mdi-send" size="small" color="blue-lighten-1" :loading="isAddingToDb"
                  :disabled="!emailIsValid" :ripple="false" :variant="emailIsValid ? 'elevated' : 'text'"
                  @click="addUserToDb" class="subs-email-btn" />
              </template>
            </v-text-field>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>

  <!-- successfull registered email popup -->
  <v-dialog v-model="isSendMail" :max-width="600" style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.2rem);
      -webkit-backdrop-filter: blur(0.2rem);
    ">
    <div
      class="successful-registered-container pa-3 pa-lg-5 rounded-lg d-flex flex-column align-center justify-center ga-2 ga-lg-5">
      <v-btn @click="handleCloseSendMailPopUp" class="close-btn-in-successful-registered-container ma-1 ma-lg-2"
        size="small" icon="mdi-close" variant="text" color="grey-lighten-1" :ripple="false" />
      <!-- Is already have email -->
      <template v-if="alreadyRegistered">
        <div class="d-flex flex-column align-center justify-center">
          <img :src="warningImg" class="bg-warning" style="border-radius: 50%" :width="smallScreen ? 50 : 75" />
          <p class="mt-2 text-subtitle-2 text-lg-subtitle-1 text-xl-h5 default-title-letter text-warning">
            Zaten Kayıtlısın
          </p>
        </div>

        <p
          class="text-center text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-grey-lighten-1 default-title-letter">
          Bu e-posta adresi ile zaten topluluğa katılmışsın. Güzel haber: Gelişmeleri
          almaya devam edeceksin!
        </p>
      </template>

      <!-- New Register -->
      <template v-else>
        <div class="d-flex flex-column align-center justify-center">
          <img :src="successFullyDoneImg" :width="smallScreen ? 75 : 120" />
          <p class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 default-title-letter text-blue-grey-darken-1">
            Kayıt Başarılı
          </p>
        </div>

        <p
          class="text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-grey-lighten-1 font-weight-bold default-title-letter">
          {{ `Sevgili ${displayName},` }}
        </p>

        <p
          class="text-center text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-grey-lighten-1 default-title-letter">
          topluluğumuza katıldığınız için minnet duyduk. Artık tüm gelişmelerden haberdar
          olacaksınız. Ekosistemimizin bir parçası olduğunuz için teşekkür ederiz. İyi
          oyunlar dileriz...
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
import Animated_Text from "~/components/common/Animated_Text.vue";
import { slugify, truncateText } from "~/composables/core/basicFunc";
import {
  extractNameFromEmail,
  getRatingColor,
  getUniquePlatformIcons,
  normalizeText,
  useFirestoreDateFormatted,
  useLimitedTags,
  useMetacriticStyle,
} from "~/composables/data/handleData";
import store from "~/store/store";
import fireAnimation from "~/assets/img/fire_anim.gif";
import successFullyDoneImg from "~/assets/img/successfully_done_anim.gif";
import warningImg from "~/assets/img/warning_anim.gif";
import Bg_Anim from "~/components/layout/Bg_Anim.vue";

useHead({
  title: "npmrungame",
});

const { $firestore } = useNuxtApp();
const { formatDateTR } = useFirestoreDateFormatted();

const _store = store();
const router = useRouter();

// screen breakout
const display = useDisplay();
const smallScreen = computed(() => display.smAndDown.value);
const extraLgScreen = computed(() => display.xlAndUp.value);

const isLoadedVideos = ref(false);
const isGettingCurrentGame = ref(false);
const isGettingBlogs = ref(false);
const isAddingToDb = ref(false);
const alreadyRegistered = ref(false);
const isSendMail = ref(false);

const displayName = ref("");
const email = ref<string>("");
const currentGames = ref<any[]>([]);
const videos = ref<any[]>([]);
const randomBlogs = ref<any[]>([]);

const emailIsValid = computed(() => /.+@.+\..+/.test(email.value));

const getBlogCardHeight = () => {
  if (display.xl.value) {
    return 400;
  } else if (display.lgAndUp.value && !display.xl.value) {
    return 575;
  } else if (display.mdAndDown.value && !display.xs.value) {
    return 425;
  } else {
    return "auto";
  }
};

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

    // 2️⃣ Votes 
    const votesCol = collection($firestore, "blog_votes");
    const votesSnapshot = await getDocs(votesCol);

    const blogVotes: Record<
      string,
      { total: number; count: number; average_votes?: number }
    > = {};

    votesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const total = data.total ?? 0;
      const count = data.count ?? 0;
      blogVotes[doc.id] = {
        total,
        count,
        average_votes: count > 0 ? total / count : 0,
      };
    });

    const blogsWithVotes = blogsList.map((blog) => {
      const votes = blogVotes[blog.firestoreId];
      return {
        ...blog,
        average_votes: votes?.average_votes ?? 0,
        total_votes: votes?.total ?? 0,
        total_voters: votes?.count ?? 0,
      };
    });


    randomBlogs.value = blogsWithVotes.sort(() => Math.random() - 0.5).slice(0, 4);
  } catch (error: any) {
    console.error("Error while getting blogs : ", error.message);
  } finally {
    isGettingBlogs.value = false;
  }
};

const handleBlogClick = (blog: any) => {
  const prefixedTitle = slugify(blog?.title);
  _store.setActiveBlogId(blog?.firestoreId);
  router.replace(`/blogs/${prefixedTitle}`);
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
  if (v === "" || v === undefined || v === null) return true;
  return /.+@.+\..+/.test(v) || "Geçersiz email";
};

const addUserToDb = async () => {
  try {
    isAddingToDb.value = true;

    // Email control
    const q = query(
      collection($firestore, "registered_users"),
      where("email", "==", email.value)
    );

    const snapshot = await getDocs(q);

    // already registered
    if (!snapshot.empty) {
      alreadyRegistered.value = true;
      isSendMail.value = true;

      return;
    }

    // Is haven't already email ?
    const user = {
      username: extractNameFromEmail(email.value),
      email: email.value,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    displayName.value = extractNameFromEmail(email.value);

    await addDoc(collection($firestore, "registered_users"), user);

    console.log("User registered:", user);

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

watch(
  isSendMail,
  (newVal) => {
    if (newVal === false) {
      handleCloseSendMailPopUp();
    }
  },
  { immediate: true }
);

onMounted(() => {
  getVideosFromDb();
  getCurrentGames();
  getBlogsFromDb();
});
</script>

<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/blogs.css");
</style>
