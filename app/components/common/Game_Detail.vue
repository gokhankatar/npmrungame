<template>
  <v-responsive height="100" />

  <v-row class="w-100 mx-auto align-stretch" :dense="isSmallScreen">
    <v-col cols="12">
      <div class="d-flex align-center justify-center justify-sm-end">
        <v-btn
          @click="router.replace('/discover')"
          text="Keşfetmeye Devam Et"
          prepend-icon="mdi-step-backward"
          :size="isSmallScreen ? 'small' : 'default'"
          :ripple="false"
          :block="isSmallScreen"
        />
      </div>
    </v-col>
    <!-- Game Banner -->
    <v-col cols="12" lg="6" class="d-flex">
      <v-img
        :src="game?.background_image"
        cover
        class="cursor-pointer transition rounded-lg flex-grow-1"
      />
    </v-col>

    <!-- Game Screenshots -->
    <v-col cols="12" lg="6" class="d-flex">
      <v-row :dense="isSmallScreen" class="flex-grow-1">
        <v-col cols="12" md="6" lg="4" v-for="(item, index) in imgArr" :key="index">
          <v-img
            :src="item.image"
            cover
            class="cursor-pointer transition rounded-lg w-100 h-100"
          />
        </v-col>
      </v-row>
    </v-col>

    <v-col cols="12" md="6">
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

    <v-col cols="12" md="6">
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
        <div v-if="game?.developers" class="d-flex flex-wrap align-center ga-1 ga-lg-2">
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
        <div v-if="game?.publishers" class="d-flex flex-wrap align-center ga-1 ga-lg-2">
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
        <div v-if="game?.genres" class="d-flex flex-wrap align-center ga-1 ga-lg-2">
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
        <div v-if="game?.stores" class="d-flex flex-wrap align-center ga-1 ga-lg-2">
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
        <div v-if="game?.genres" class="d-flex flex-wrap align-center ga-1 ga-lg-2">
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

    <!-- System Requirements -->
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
    <v-img v-if="imgDetailSrc" :src="imgDetailSrc" cover />
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

const _store = store();
const router = useRouter();
const config = useRuntimeConfig();
const display = useDisplay();

const isSmallScreen = computed(() => display.smAndDown.value);

const isGettingGame = ref(false);
const isOpenImgDetail = ref(false);

const game = ref<any | null>(null);
const imgDetailSrc = ref<string | null>(null);
const imgArr = ref<any[]>([]);

const getGameScreenshots = async () => {
  const res = await axios.get(
    `https://api.rawg.io/api/games/${_store.active_detailed_game?.id}/screenshots?key=${config.public.apiKey}`
  );

  imgArr.value = res.data.results;
};

const getGamesById = async () => {
  try {
    isGettingGame.value = true;

    await getGameScreenshots();

    const res = await axios.get(
      `https://api.rawg.io/api/games/${_store.active_detailed_game?.id}`,
      {
        params: {
          key: config.public.apiKey,
        },
      }
    );

    game.value = res.data;
    console.log(res.data);
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
