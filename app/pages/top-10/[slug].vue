<template>
  <div class="top10-page">
    <div class="top10-page-glow top10-page-glow--left" aria-hidden="true" />
    <div class="top10-page-glow top10-page-glow--right" aria-hidden="true" />

    <v-responsive :height="smallScreen ? 70 : 100" />

    <v-container class="top10-container pa-3 pa-md-6 pa-lg-10">
      <div v-if="isLoading" class="d-flex justify-center py-16">
        <v-progress-circular indeterminate color="green-accent-2" size="48" width="3" />
      </div>

      <div v-else-if="!list" class="top10-not-found">
        <v-icon icon="mdi-playlist-remove" size="64" color="grey-darken-1" />
        <h1 class="text-h5 text-grey-lighten-1 default-title-letter mt-4">Liste bulunamadı</h1>
        <p class="text-caption text-grey-darken-1 default-title-letter mt-2">
          Bu bağlantı geçersiz olabilir veya liste henüz paylaşılmamış.
        </p>
        <v-btn
          color="green-accent-2"
          variant="flat"
          rounded="pill"
          class="text-black text-capitalize default-title-letter mt-4"
          prepend-icon="mdi-plus"
          text="Kendi listeni oluştur"
          :ripple="false"
          to="/top-10"
        />
      </div>

      <template v-else>
        <header class="top10-public-hero">
          <div class="top10-hero-badge default-title-letter">
            <v-icon icon="mdi-numeric-10-box-multiple-outline" size="16" color="#69f0ae" />
            Top 10
          </div>
          <h1 class="top10-hero-title default-title-letter">{{ list.title }}</h1>
          <p class="top10-hero-sub default-title-letter">
            {{ list.username }} · {{ list.gameCount }} oyun
          </p>

          <div class="top10-public-meta">
            <v-chip
              size="small"
              variant="tonal"
              color="green-accent-2"
              prepend-icon="mdi-share-variant"
              :text="`${list.gameCount} oyunluk liste`"
            />
            <v-chip
              v-if="list.viewCount"
              size="small"
              variant="outlined"
              color="grey-lighten-1"
              prepend-icon="mdi-eye-outline"
              :text="`${list.viewCount} görüntülenme`"
            />
          </div>

          <div class="top10-public-actions">
            <v-btn
              color="green-accent-2"
              variant="flat"
              rounded="pill"
              class="text-black text-capitalize default-title-letter"
              prepend-icon="mdi-link-variant"
              text="Linki kopyala"
              :ripple="false"
              @click="copyLink"
            />
            <v-btn
              variant="tonal"
              color="grey-lighten-1"
              rounded="pill"
              class="text-capitalize default-title-letter"
              prepend-icon="mdi-plus"
              text="Sen de yap"
              :ripple="false"
              to="/top-10"
            />
            <v-btn
              variant="outlined"
              color="grey-lighten-1"
              rounded="pill"
              class="text-capitalize default-title-letter"
              prepend-icon="mdi-twitter"
              text="X'te paylaş"
              :ripple="false"
              :href="twitterShareUrl"
              target="_blank"
              rel="noopener noreferrer"
            />
          </div>

          <v-snackbar v-model="snackbar" color="green-accent-2" :timeout="2500">
            <span class="text-black default-title-letter">Link kopyalandı!</span>
          </v-snackbar>
        </header>

        <Top10_Share_Card
          :title="list.title"
          :username="list.username"
          :games="list.games"
          :display-mode="list.displayMode ?? 'grid'"
        />
      </template>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import Top10_Share_Card from "~/components/top10/Top10_Share_Card.vue";
import type { UserTop10List } from "~/composables/core/top10";
import {
  fetchTop10BySlug,
  getTop10ShareUrl,
  incrementTop10ViewCount,
} from "~/composables/useTop10";
import { buildPageUrl } from "~/utils/siteSeo";

const route = useRoute();
const { $firestore } = useNuxtApp();
const display = useDisplay();

const smallScreen = computed(() => display.smAndDown.value);
const slug = computed(() => String(route.params.slug ?? ""));

const list = ref<UserTop10List | null>(null);
const isLoading = ref(true);
const snackbar = ref(false);
const viewCounted = ref(false);

const pageTitle = computed(() =>
  list.value ? `${list.value.title} | npmrungame Top 10` : "Top 10 | npmrungame"
);

const pageDescription = computed(() => {
  if (!list.value) return "npmrungame Top 10 oyun listesi.";
  const names = list.value.games
    .slice(0, 3)
    .map((g) => g.name)
    .join(", ");
  return `${list.value.username} listesi: ${names} ve daha fazlası. Kendi Top 10'unu oluştur.`;
});

useHead(() => ({
  title: pageTitle.value,
  meta: [{ name: "description", content: pageDescription.value }],
}));

const shareUrl = computed(() => buildPageUrl(`/top-10/${slug.value}`));

const twitterShareUrl = computed(() => {
  if (!list.value) return "#";
  const text = encodeURIComponent(
    `${list.value.username} · Top 10 oyun listesi 🎮\n${list.value.title}`
  );
  const url = encodeURIComponent(shareUrl.value);
  return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
});

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    snackbar.value = true;
  } catch {
    window.prompt("Linki kopyala:", shareUrl.value);
  }
};

const loadList = async () => {
  if (!slug.value) {
    list.value = null;
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    const data = await fetchTop10BySlug($firestore, slug.value);

    if (!data || !data.isPublic || data.gameCount < 1) {
      list.value = null;
      return;
    }

    list.value = data;

    if (!viewCounted.value && data.uid) {
      viewCounted.value = true;
      incrementTop10ViewCount($firestore, data.uid).catch(() => {});
    }
  } catch (e) {
    console.error("Top10 public load:", e);
    list.value = null;
  } finally {
    isLoading.value = false;
  }
};

watch(slug, loadList, { immediate: true });
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/top10.css";
</style>
