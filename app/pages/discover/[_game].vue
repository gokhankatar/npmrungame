<template>
  <v-responsive height="100" />

  <v-container class="pa-0 pa-lg-10 pa-xl-15">
    <v-row>
      <v-col cols="12" sm="8" xl="10">
        <p
          class="text-center text-sm-start text-subtitle-2 text-sm-subtitle-1 text-md-h5 text-lg-h4 text-xl-h3 default-title-letter font-weight-bold text-grey-lighten-1"
        >
          {{ `${_store.active_game_genre?.title} Oyunları` }}
        </p>
      </v-col>

      <v-col cols="12" sm="4" xl="2">
        <v-btn
          @click="handleToBack"
          text="Oyunlara Dön"
          prepend-icon="mdi-arrow-left"
          :size="isSmallScreen ? 'small' : 'large'"
          block
          :ripple="false"
          variant="text"
        />
      </v-col>

      <v-divider class="w-100 mt-2 mb-5" color="white" />
    </v-row>
  </v-container>
</template>
<script lang="ts" setup>
import axios from "axios";
import store from "~/store/store";
const config = useRuntimeConfig();
const apiKey = config.public.apiKey;

const route = useRoute();
const router = useRouter();
const _store = store();
const display = useDisplay();

const isSmallScreen = computed(() => display.smAndDown.value);
const title = ref<string>("");

const getGames = async () => {
  const response = await axios.get(
    `https://api.rawg.io/api/games?key=${apiKey}&tags=horror`
  );
  console.log(response);
};

const handleToBack = () => {
  _store.clearActiveGamePlatform();
  router.replace("/discover");
};

onMounted(() => {});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/discover.css";
</style>
