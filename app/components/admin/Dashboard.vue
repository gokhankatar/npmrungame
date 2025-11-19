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

        <v-row class="mx-auto w-100">
          <!-- Account Informations -->
          <v-col cols="12" md="6" lg="7">
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

          <!-- Youtube Stats Cards -->
          <v-col cols="12" md="6" lg="5">
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
                    />
                    <p
                      class="default-title-letter text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-center"
                    >
                      Abone Sayısı
                    </p>
                    <p
                      class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 font-weight-bold default-title-letter"
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
                    />
                    <p
                      class="default-title-letter text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-center"
                    >
                      Toplam İzlenme
                    </p>
                    <p
                      class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 font-weight-bold default-title-letter"
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
                    />
                    <p
                      class="default-title-letter text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-center"
                    >
                      Toplam Video
                    </p>
                    <p
                      class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 font-weight-bold default-title-letter"
                    >
                      {{ youtubeChannelStats?.videoCount }}
                    </p>
                  </v-card>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import { useTRFormat } from "~/composables/data/handleData";
import store from "~/store/store";
import adminLogoImg from "~/assets/img/logo.jpeg";
import adminZeynepCansuKatarImg from "~/assets/img/admin_zeynep_cansu_katar.jpg";
import adminGokhanKatarImg from "~/assets/img/admin_gokhan_katar.jpg";
import axios from "axios";
import type { Youtube_Channel_Stats } from "~/composables/core/interfaces";

const router = useRouter();
const _store = store();
const config = useRuntimeConfig();

const display = useDisplay();
const isSmallScreen = computed(() => display.smAndDown.value);
const isMediumScreen = computed(() => display.mdAndUp.value);

const { formatTR } = useTRFormat();

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

onMounted(() => {
  getYoutubeChannelInfos();
});
</script>

<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/admin.css");
</style>
