<template>
  <v-responsive height="100" v-if="!isSmallScreen" />
  <v-responsive height="70" v-else />

  <v-row class="w-100 mx-auto align-stretch" :dense="isSmallScreen">
    <v-col cols="12">
      <div class="d-flex align-center justify-center justify-sm-end">
        <v-btn
          @click="goBackToDiscover"
          text="Keşfetmeye Devam Et"
          prepend-icon="mdi-step-backward"
          :size="isSmallScreen ? 'small' : 'default'"
          :ripple="false"
          :block="isSmallScreen"
        />
      </div>
    </v-col>

    <!-- Loader (Game Banner) -->
    <v-col cols="12" lg="6" class="d-flex" v-if="isGettingGame">
      <v-skeleton-loader class="cursor-pointer transition rounded-lg flex-grow-1" />
    </v-col>

    <!-- Game Banner -->
    <v-col cols="12" lg="6" class="d-flex" v-else>
      <v-img
        @click="openImgDetail(game?.background_image)"
        :src="game?.background_image ?? 'https://f4.bcbits.com/img/0016409163_71.jpg'"
        cover
        class="cursor-pointer transition rounded-lg flex-grow-1"
      />
    </v-col>

    <!-- Loader (Game Screenshots)  -->
    <v-col cols="12" lg="6" class="d-flex" v-if="isGettingScreenshots">
      <v-row :dense="isSmallScreen" class="flex-grow-1">
        <v-col cols="12" md="6" lg="4" v-for="n in 6" :key="n">
          <v-skeleton-loader
            class="cursor-pointer transition rounded-lg w-100 h-100"
            type="image"
          />
        </v-col>
      </v-row>
    </v-col>

    <!-- Game Screenshots -->
    <v-col cols="12" lg="6" class="d-flex" v-else>
      <v-row :dense="isSmallScreen" class="flex-grow-1">
        <v-col cols="12" md="6" lg="4" v-for="(item, index) in imgArr" :key="index">
          <v-img
            @click="openImgDetail(item.image)"
            :src="item.image"
            cover
            class="cursor-pointer transition rounded-lg w-100 h-100"
          />
        </v-col>
      </v-row>
    </v-col>

    <!-- Loader (text) -->
    <v-col cols="12" md="6" v-if="isGettingGame">
      <div class="d-flex flex-column align-center align-sm-start ga-1 ga-lg-3">
        <v-skeleton-loader type="text" width="100%" />
        <v-skeleton-loader type="text" width="100" />
        <v-skeleton-loader v-for="n of 3" type="paragraph" width="100%" />
      </div>
    </v-col>

    <!-- Game Info (text) -->
    <v-col cols="12" md="6" v-else>
      <div class="d-flex flex-column align-center align-sm-start ga-1 ga-lg-3">
        <p
          class="text-subtitle-2 text-sm-subtitle-1 text-md-h5 text-lg-h4 text-xl-h3 default-title-letter text-blue-grey-lighten-1"
        >
          {{ game?.name }}
        </p>
        <p
          class="text-white text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-blue-grey-darken-1"
        >
          {{ new Date(game?.released).getFullYear() }}
        </p>

        <div
          class="text-center text-sm-start text-caption text-md-subtitle-2 text-xl-subtitle-1 default-title-letter text-grey-lighten-1"
          v-html="game?.description"
        />
      </div>
    </v-col>

    <v-divider v-if="!isSmallScreen" vertical color="white" />

    <v-divider v-else color="white" class="w-100 my-3" />

    <!-- Loader (Game Info - chips) -->
    <v-col cols="12" md="6" v-if="isGettingGame">
      <div class="d-flex flex-column align-start ga-2 ga-lg-4 ga-xl-5">
        <div class="d-flex flex-wrap align-center ga-1 ga-lg-2 w-100">
          <v-skeleton-loader type="text" width="100%" class="rounded-lg" />
          <v-skeleton-loader type="chip" width="100%" class="rounded-xl" />
        </div>

        <div class="d-flex flex-wrap align-center ga-1 ga-lg-2 w-100">
          <v-skeleton-loader type="text" width="70%" />
          <v-skeleton-loader type="chip" width="100%" />
        </div>

        <div class="d-flex flex-wrap align-center ga-1 ga-lg-2 w-100">
          <v-skeleton-loader type="text" width="50%" />
          <v-skeleton-loader type="chip" width="70%" />
        </div>

        <div class="d-flex flex-wrap align-center ga-1 ga-lg-2 w-100">
          <v-skeleton-loader type="text" width="80%" />
          <v-skeleton-loader
            v-for="i in 3"
            :key="i"
            type="chip"
            width="80"
            class="rounded-xl"
          />
        </div>

        <div class="d-flex flex-wrap align-center ga-1 ga-lg-2 w-100">
          <v-skeleton-loader type="text" width="50%" />
          <v-skeleton-loader
            v-for="i in 2"
            :key="i"
            type="chip"
            width="90"
            class="rounded-lg"
          />
        </div>

        <div class="d-flex flex-wrap align-center ga-1 ga-lg-2 w-100">
          <v-skeleton-loader type="text" width="75%" />
        </div>
      </div>
    </v-col>

    <!-- Game Info (chips) -->
    <v-col cols="12" md="6" v-else>
      <div class="d-flex flex-column align-start ga-2 ga-lg-4 ga-xl-5">
        <!-- Metacritic -->
        <div
          v-if="game?.metacritic"
          class="d-flex flex-wrap align-center ga-1 ga-lg-2"
          :class="game?.metacritic_url ? 'cursor-pointer' : ''"
          @click="handleMetacriticUrl"
        >
          <p
            class="default-title-letter text-decoration-underline text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-grey-lighten-1"
          >
            Metacritic
          </p>
          <v-chip
            class="rounded-xl"
            :ripple="false"
            size="small"
            :prepend-icon="game.metacritic < 90 ? 'mdi-star-outline' : ''"
            :prepend-avatar="game.metacritic >= 90 ? fireAnimation : ''"
            variant="elevated"
            :color="useMetacriticStyle(game.metacritic).color"
            :text="game.metacritic"
          />
        </div>
        <!-- Website -->
        <div v-if="game?.website" class="d-flex flex-wrap align-center ga-1 ga-lg-2">
          <p
            class="default-title-letter text-decoration-underline text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-grey-lighten-1"
          >
            Website
          </p>
          <v-chip
            class="rounded-xl"
            target="_blank"
            :href="game?.website"
            :ripple="false"
            size="small"
            prepend-icon="mdi-web"
            variant="outlined"
            :text="game?.website"
          />
        </div>
        <!-- Playtime -->
        <div v-if="game?.playtime" class="d-flex flex-wrap align-center ga-1 ga-lg-2">
          <p
            class="default-title-letter text-decoration-underline text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-grey-lighten-1"
          >
            Tahmini Oyun Süresi
          </p>
          <v-chip
            class="rounded-xl"
            :ripple="false"
            size="small"
            prepend-icon="mdi-update"
            variant="outlined"
            :text="`${game.playtime} saat`"
          />
        </div>
        <!-- Developers -->
        <div
          v-if="game?.developers[0]"
          class="d-flex flex-wrap align-center ga-1 ga-lg-2"
        >
          <p
            class="default-title-letter text-decoration-underline text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-grey-lighten-1"
          >
            Geliştiriciler
          </p>
          <v-chip
            v-for="(developer, index) in game?.developers"
            :key="index"
            :size="isSmallScreen ? 'x-small' : 'small'"
            prepend-icon="mdi-account-group-outline"
            variant="outlined"
            rounded="lg"
            :ripple="false"
            :text="developer.name"
          />
        </div>
        <!-- Publishers -->
        <div
          v-if="game?.publishers[0]"
          class="d-flex flex-wrap align-center ga-1 ga-lg-2"
        >
          <p
            class="default-title-letter text-decoration-underline text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-grey-lighten-1"
          >
            Yayınlama
          </p>
          <v-chip
            v-for="(publisher, index) in game?.publishers"
            :key="index"
            :size="isSmallScreen ? 'x-small' : 'small'"
            variant="outlined"
            prepend-icon="mdi-domain"
            rounded="lg"
            :ripple="false"
            :text="publisher.name"
          />
        </div>
        <!-- Platforms -->
        <div v-if="game?.platforms[0]" class="d-flex flex-wrap align-center ga-1 ga-lg-2">
          <p
            class="default-title-letter text-decoration-underline text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-grey-lighten-1"
          >
            Platformlar
          </p>
          <template v-for="icon in getUniquePlatformIcons(game.platforms)" :key="icon">
            <v-icon v-if="icon" size="x-small" color="grey-lighten-1" :icon="icon" />
          </template>
        </div>
        <!-- Stores -->
        <div v-if="game?.stores[0]" class="d-flex flex-wrap align-center ga-1 ga-lg-2">
          <p
            class="default-title-letter text-decoration-underline text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-grey-lighten-1"
          >
            Mağazalar
          </p>
          <v-chip
            v-for="(store, index) in game?.stores"
            :key="index"
            :prepend-avatar="store.store.image_background"
            :size="isSmallScreen ? 'small' : 'default'"
            variant="tonal"
            :ripple="false"
            color="blue-grey-lighten-1"
            :text="store.store.name"
          />
        </div>
        <!-- Genres -->
        <div v-if="game?.genres[0]" class="d-flex flex-wrap align-center ga-1 ga-lg-2">
          <p
            class="default-title-letter text-decoration-underline text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-grey-lighten-1"
          >
            Türler
          </p>
          <v-chip
            v-for="(genre, index) in game?.genres"
            :key="index"
            :size="isSmallScreen ? 'small' : 'default'"
            variant="tonal"
            :ripple="false"
            :text="genre.name"
          />
        </div>
        <!-- Tags -->
        <div v-if="game?.tags[0]" class="d-flex flex-wrap align-center ga-1 ga-lg-2">
          <p
            class="default-title-letter text-decoration-underline text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-grey-lighten-1"
          >
            Etiketler
          </p>
          <v-chip
            v-for="(tag, index) in game?.tags"
            :key="index"
            :size="isSmallScreen ? 'x-small' : 'small'"
            variant="tonal"
            color="blue-lighten-1"
            :ripple="false"
            :text="tag.name"
          />
        </div>
      </div>
    </v-col>

    <!-- Loader (System Req) -->
    <template v-if="isGettingGame">
      <v-row class="w-100 mx-auto my-3 my-lg-5" align="stretch">
        <v-col cols="12" sm="6" v-for="n of 2">
          <v-skeleton-loader type="card" class="rounded-lg" />
        </v-col>
      </v-row>
    </template>

    <!-- System Requirements -->
    <template v-else>
      <v-row
        v-if="
          game?.platforms[0]?.requirements?.minimum ||
          game?.platforms[0]?.requirements?.recommended
        "
        class="w-100 mx-auto my-3 my-lg-5"
        align="stretch"
      >
        <!-- Minimum -->
        <v-col cols="12" sm="6" v-if="game?.platforms[0]?.requirements?.minimum">
          <v-card class="rounded-lg pa-2 pa-lg-5 h-100" :ripple="false">
            <v-card-title class="text-subtitle-2 text-lg-subtitle-1 default-title-letter">
              Minimum Sistem Gereksinimleri
            </v-card-title>

            <p
              class="text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-grey-lighten-1"
              v-for="(line, i) in parseRequirements(
                game?.platforms[0]?.requirements?.minimum
              )"
              :key="i"
            >
              {{ line }}
            </p>
          </v-card>
        </v-col>

        <!-- Recommended -->
        <v-col cols="12" sm="6" v-if="game?.platforms[0]?.requirements?.recommended">
          <v-card class="rounded-lg pa-2 pa-lg-5 h-100" :ripple="false">
            <v-card-title class="text-subtitle-2 text-lg-subtitle-1 default-title-letter">
              Önerilen Sistem Gereksinimleri
            </v-card-title>

            <p
              class="text-caption text-lg-subtitle-2 text-xl-subtitle-1 text-grey-lighten-1"
              v-for="(line, i) in parseRequirements(
                game?.platforms[0]?.requirements?.recommended
              )"
              :key="i"
            >
              {{ line }}
            </p>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-row>

  <!-- Image Detail Pop Up -->
  <v-dialog
    v-model="isOpenImgDetail"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.1rem);
      -webkit-backdrop-filter: blur(0.1rem);
    "
  >
    <div class="img-detail-container">
      <v-btn
        @click="isOpenImgDetail = false"
        class="close-icon-in-img-detail-container ma-1 ma-lg-2"
        variant="text"
        size="small"
        color="grey-lighten-2"
        icon="mdi-close"
        :ripple="false"
      />

      <v-img
        v-if="imgDetailSrc"
        rounded="xl"
        height="100%"
        width="100%"
        :src="imgDetailSrc"
        cover
      />
    </div>
  </v-dialog>
</template>
<script lang="ts" setup>
import axios from "axios";
import store from "~/store/store";
import fireAnimation from "~/assets/img/fire_anim.gif";
import {
  getUniquePlatformIcons,
  parseRequirements,
  useMetacriticStyle,
} from "~/composables/data/handleData";
import { useDiscoverStore } from "~/store/queryStore";

const _store = store();
const discover_store = useDiscoverStore();
const router = useRouter();
const display = useDisplay();

const isSmallScreen = computed(() => display.smAndDown.value);

const isGettingGame = ref(false);
const isGettingScreenshots = ref(false);
const isOpenImgDetail = ref(false);

const game = ref<any | null>(null);
const imgDetailSrc = ref<string | null>(null);
const imgArr = ref<any[]>([]);

const goBackToDiscover = () => {
  router.replace({
    path: "/discover",
    query: discover_store.lastQuery || {},
  });
};

const openImgDetail = (src: string | null) => {
  imgDetailSrc.value = src;
  isOpenImgDetail.value = true;
};

const getGameScreenshots = async () => {
  try {
    isGettingScreenshots.value = true;

    const res = await axios.get("/api/game-screenshots", {
      params: {
        id: _store.active_detailed_game?.id,
      },
    });

    imgArr.value = res.data.results;
  } catch (error: any) {
    console.error("Error while getting screenshots", error.message);
  } finally {
    isGettingScreenshots.value = false;
  }
};

const getGamesById = async () => {
  try {
    isGettingGame.value = true;

    await getGameScreenshots();

    const res = await axios.get("/api/game-details", {
      params: {
        id: _store.active_detailed_game?.id,
      },
    });

    game.value = res.data;
  } catch (err: any) {
    console.error("Error fetching game:", err.message);
  } finally {
    isGettingGame.value = false;
  }
};

const handleMetacriticUrl = () => {
  if (game.value?.metacritic_url) {
    let url = game.value?.metacritic_url;
    window.open(url, "blank");
  }
};

onMounted(() => {
  getGamesById();
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/game_detail.css";
</style>
