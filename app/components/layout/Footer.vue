<template>
  <v-responsive :height="display.xs.value ? 450 : 280" />

  <div class="footer-container py-3">
    <v-row class="footer-content w-100 w-md-75 mx-auto align-center">
      <!-- logo section -->
      <v-col cols="12" sm="6" class="d-flex flex-column align-start ga-2 ga-lg-3">
        <v-img
          @click="router.replace('/')"
          :src="logo"
          :width="isSmallScreen ? 100 : 150"
          class="cursor-pointer"
        />
        <div class="w-100 w-lg-50 d-flex flex-column align-start ga-1 ga-lg-2">
          <p
            class="text-caption text-lg-subtitle-2 default-title-letter text-grey-lighten-1"
            style="line-height: 1rem"
          >
            npmrungame, en yeni AAA oyunlardan gizli indie hazine oyunlara kadar, 4K
            videolar ve detaylı oyun deneyimleri sunan oyun kanalıdır.
          </p>

          <!-- socials -->
          <div class="d-flex align-center ga-2 ga-lg-4 w-100 flex-wrap">
            <v-tooltip
              v-for="(social, index) in footer_social_links"
              :key="social.icon"
              :text="social.title"
              location="top"
            >
              <template #activator="{ props }">
                <v-icon
                  @click="goToLink(social.link)"
                  v-bind="props"
                  :icon="social.icon"
                  class="footer-social-link transition cursor-pointer"
                  color="grey-lighten-1"
                />
              </template>
            </v-tooltip>
          </div>
        </div>
      </v-col>

      <!-- link section -->
      <v-col cols="12" sm="6">
        <v-row class="w-100 mx-auto">
          <v-col cols="6" v-for="(item, index) of footer_links" :key="item.title">
            <div class="d-flex flex-column ga-1 ga-lg-3">
              <p
                class="text-grey-lighten-3 text-subtitle-2 text-xl-subtitle-1 default-title-letter"
              >
                {{ item.title }}
              </p>
              <div class="d-flex flex-column align-start ga-1">
                <p
                  @click="router.replace(subItem.path)"
                  class="footer-link transition cursor-pointer text-caption text-grey-darken-1 text-lg-subtitle-2 default-title-letter"
                  v-for="subItem of item.items"
                >
                  {{ subItem.subtitle }}
                </p>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12">
        <v-divider class="w-100 mx-auto" />

        <v-row
          class="footer-bottom-section d-flex justify-space-between align-center px-2 px-lg-5 mt-2"
        >
          <v-col
            cols="12"
            sm="6"
            class="d-flex justify-center justify-sm-start align-center"
          >
            <Animated_Text
              @click="goToLink('https://www.youtube.com/@npmrungame')"
              text="npmrungame"
              class="cursor-pointer"
              :msPerChar="50"
              :duration="550"
              :loop="true"
            />
          </v-col>
          <v-col
            cols="12"
            sm="6"
            class="d-flex justify-center justify-sm-end align-center"
          >
            <p
              class="text-blue-grey-darken-1 text-caption text-lg-subtitle-2 text-xl-subtitle-1"
            >
              © 2025 Tüm hakları saklıdır
            </p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>
<script lang="ts" setup>
import logo from "@/assets/img/logo_fixed.webp";
import Animated_Text from "../common/Animated_Text.vue";

const router = useRouter();
const display = useDisplay();

const isSmallScreen = computed(() => display.smAndDown.value);

const goToLink = (link: string) => {
  window.open(link, "_blank");
};
</script>
<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/footer.css");
</style>
