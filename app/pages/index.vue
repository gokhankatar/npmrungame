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
    <v-row class="w-100 mx-auto" :dense="smallScreen">
      <v-col cols="12" md="8" class="d-flex justify-center justify-sm-start">
        <p
          class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-blue-grey-lighten-1 default-title-letter"
        >
          Kanaldan Bazı Kesitler
        </p>
      </v-col>

      <v-col cols="12" md="4" class="d-flex justify-center justify-sm-end">
        <Animated_Text text="npmrungame" :msPerChar="50" :duration="550" :loop="true" />
      </v-col>

      <v-divider class="mt-2 mb-5 w-100" />

      <v-row :dense="smallScreen" class="mt-4">
        <v-col
          v-for="item in videos"
          :key="item.video_src"
          cols="12"
          md="6"
          lg="4"
          xl="3"
          class="video-container"
        >
          <v-video
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
    </v-row>
  </v-container>
</template>
<script lang="ts" setup>
import { collection, getDocs } from "firebase/firestore";
import Animated_Text from "~/components/common/Animated_Text.vue";
import store from "~/store/store";

const { $firestore } = useNuxtApp();

const _store = store();
const router = useRouter();
const config = useRuntimeConfig();

useHead({
  title: "npmrungame",
});

// screen breakout
const display = useDisplay();
const smallScreen = computed(() => display.smAndDown.value);
const extraLgScreen = computed(() => display.xlAndUp.value);

const videos = ref<any[]>([]);

const getVideosFromDb = async () => {
  try {
    const col = collection($firestore, "npmrungame_yt_videos");
    const snapshot = await getDocs(col);

    if (snapshot.empty) return;

    const videoList = snapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
    }));

    // Preview URL oluştur
    videos.value = videoList;

    console.log(videos.value);
  } catch (error: any) {
    console.error(error.message);
  }
};

onMounted(async () => {
  await getVideosFromDb();
});
</script>

<style scoped>
@import url("~/assets/css/main.css");
</style>
