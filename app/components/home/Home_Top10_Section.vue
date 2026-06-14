<template>
  <section class="home-top10-section">
    <Home_Section_Header
      title="Top 10 listeni yaptın mı?"
      subtitle="En sevdiğin 10 oyunu seç, paylaş — topluluğun listelerine göz at"
      icon="mdi-numeric-10-box-multiple-outline"
      icon-color="#69f0ae"
    />

    <div class="home-top10-cta" role="button" tabindex="0" @click="goToBuilder" @keydown.enter="goToBuilder">
      <div class="home-top10-cta__icon">
        <v-icon icon="mdi-playlist-star" color="#69f0ae" size="26" />
      </div>
      <div class="home-top10-cta__text">
        <h3 class="default-title-letter">Kendi Top 10'unu oluştur</h3>
        <p class="default-title-letter">
          Oyun ara, sırala, kaydet — ekran görüntüsü alıp sosyal medyada paylaş.
        </p>
      </div>
      <v-btn
        color="green-accent-2"
        variant="flat"
        rounded="pill"
        class="text-black text-capitalize default-title-letter flex-shrink-0"
        prepend-icon="mdi-arrow-right"
        text="Başla"
        :ripple="false"
        @click.stop="goToBuilder"
      />
    </div>

    <div v-if="isLoading" class="home-top10-grid">
      <v-skeleton-loader
        v-for="n in 4"
        :key="n"
        type="image"
        class="rounded-lg"
        height="120"
      />
    </div>

    <div v-else-if="recentLists.length" class="home-top10-grid">
      <article
        v-for="item in recentLists"
        :key="item.slug"
        class="home-top10-card"
        role="button"
        tabindex="0"
        @click="openList(item.slug)"
        @keydown.enter="openList(item.slug)"
      >
        <p class="home-top10-card__user default-title-letter">{{ item.username }}</p>
        <p class="home-top10-card__count default-title-letter">
          {{ item.gameCount }} oyun · Top 10
        </p>
        <div class="home-top10-card__covers">
          <div
            v-for="(game, idx) in previewCovers(item)"
            :key="`${item.slug}-${game.id}`"
            class="home-top10-card__cover"
          >
            <v-img
              v-if="game.background_image"
              :src="game.background_image"
              cover
              position="center center"
              class="home-top10-card__img"
            />
            <v-icon v-else icon="mdi-gamepad-variant-outline" size="16" color="grey" />
          </div>
          <div
            v-if="item.gameCount > 3"
            class="home-top10-card__cover home-top10-card__cover--more"
          >
            +{{ item.gameCount - 3 }}
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script lang="ts" setup>
import Home_Section_Header from "~/components/home/Home_Section_Header.vue";
import type { UserTop10List } from "~/composables/core/top10";
import { fetchRecentPublicTop10Lists } from "~/composables/useTop10";

const { $firestore } = useNuxtApp();
const router = useRouter();

const recentLists = ref<UserTop10List[]>([]);
const isLoading = ref(true);

const previewCovers = (list: UserTop10List) =>
  [...list.games].sort((a, b) => a.rank - b.rank).slice(0, 3);

const goToBuilder = () => router.push("/top-10");
const openList = (slug: string) => router.push(`/top-10/${slug}`);

onMounted(async () => {
  try {
    isLoading.value = true;
    recentLists.value = await fetchRecentPublicTop10Lists($firestore, 4);
  } catch (e) {
    console.error("Home top10:", e);
    recentLists.value = [];
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
@import "~/assets/css/top10.css";
</style>
