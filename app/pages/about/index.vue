<template>
  <div class="about-page">
    <div class="about-page-glow about-page-glow--left" aria-hidden="true" />
    <div class="about-page-glow about-page-glow--right" aria-hidden="true" />

    <v-responsive :height="display.smAndDown.value ? 70 : 100" />

    <v-container class="about-container pa-3 pa-md-6 pa-lg-10 pa-xl-15">
      <header class="about-hero">
        <div class="about-hero-badge default-title-letter">
          <v-icon icon="mdi-account-circle" size="16" color="#69f0ae" />
          <span>Hakkımda</span>
        </div>
        <h1 class="about-hero-title default-title-letter">Ben Kimim?</h1>
        <p class="about-hero-sub default-title-letter">
          npmrungame’in arkasındaki isim — oyun, içerik ve topluluk hakkında kısa bir özet.
        </p>
      </header>

      <div class="about-layout">
        <!-- Profil kartı -->
        <aside class="about-profile-card">
          <template v-if="isGettingMyInfos">
            <v-skeleton-loader
              type="avatar"
              class="mx-auto mb-4 rounded-circle"
              :width="display.smAndDown.value ? 120 : 168"
              :height="display.smAndDown.value ? 120 : 168"
            />
            <v-skeleton-loader type="heading" class="mb-2" />
            <v-skeleton-loader type="text" width="80%" class="mx-auto mb-4" />
            <v-skeleton-loader type="button" class="mb-2" />
            <v-skeleton-loader type="button" />
          </template>

          <template v-else-if="myInfos">
            <div class="about-avatar-wrap">
              <v-avatar
                :image="myInfos.profile_img"
                :size="display.smAndDown.value ? 112 : 160"
              />
            </div>

            <h2 class="about-profile-name default-title-letter">
              {{ myInfos.full_name }}
            </h2>
            <p class="about-profile-role default-title-letter">İçerik üretici · npmrungame</p>

            <a
              v-if="myInfos.email"
              :href="`mailto:${myInfos.email}`"
              class="about-email-link default-title-letter"
              target="_blank"
              rel="noopener noreferrer"
            >
              <v-icon icon="mdi-email-outline" size="20" color="#69f0ae" />
              <span>{{ myInfos.email }}</span>
            </a>

            <div class="about-quick-links">
              <v-btn
                href="https://www.youtube.com/@npmrungame"
                target="_blank"
                rel="noopener noreferrer"
                variant="tonal"
                color="red-lighten-1"
                rounded="pill"
                size="small"
                class="text-capitalize default-title-letter"
                prepend-icon="mdi-youtube"
                text="YouTube"
                :ripple="false"
              />
              <v-btn
                to="/discover"
                variant="tonal"
                color="green-accent-2"
                rounded="pill"
                size="small"
                class="text-capitalize default-title-letter"
                prepend-icon="mdi-compass-outline"
                text="Keşfet"
                :ripple="false"
              />
            </div>
          </template>
        </aside>

        <!-- Biyografi -->
        <section class="about-bio-card">
          <div class="about-bio-card__head">
            <v-icon icon="mdi-text-box-outline" size="20" color="#69f0ae" />
            <h3 class="about-bio-card__head-title default-title-letter">Hikâye</h3>
          </div>

          <template v-if="isGettingMyInfos">
            <v-skeleton-loader type="paragraph" class="mb-3" />
            <v-skeleton-loader type="paragraph" class="mb-3" />
            <v-skeleton-loader type="paragraph" width="85%" />
          </template>

          <div
            v-else-if="myInfos?.summary_html"
            class="about-bio default-title-letter"
            v-html="myInfos.summary_html"
          />

          <p v-else class="about-bio mb-0 default-title-letter text-grey-darken-1">
            Profil metni yakında eklenecek.
          </p>
        </section>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { getDocs, collection } from "firebase/firestore";

useHead({
  title: "Ben Kimim | npmrungame",
  meta: [
    {
      name: "description",
      content: "npmrungame kurucusu Gökhan Katar hakkında — oyun içerikleri ve kanal hikâyesi.",
    },
  ],
});

const { $firestore } = useNuxtApp();
const display = useDisplay();

const isGettingMyInfos = ref(false);
const myInfos = ref<Record<string, string> | null>(null);

const getMyInfos = async () => {
  try {
    isGettingMyInfos.value = true;

    const snapshot = await getDocs(collection($firestore, "my_profile_infos"));
    const rows = snapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
    })) as Record<string, string>[];

    myInfos.value = rows[0] ?? null;
  } catch (error) {
    console.error("Error getting my infos:", error);
    myInfos.value = null;
  } finally {
    isGettingMyInfos.value = false;
  }
};

onMounted(() => {
  getMyInfos();
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/about_page.css";
</style>
