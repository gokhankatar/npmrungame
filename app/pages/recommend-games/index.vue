<template>
  <div class="recommend-page">
    <!-- Netflix tarzı hero — en son önerilen oyun -->
    <section
      class="recommend-hero"
      :class="{
        'recommend-hero--empty': !isGettingRecommendedGames && !featuredGame,
        'recommend-hero--loading': isGettingRecommendedGames,
      }"
    >
      <template v-if="isGettingRecommendedGames">
        <v-skeleton-loader type="image" class="recommend-hero__loader" />
      </template>

      <template v-else-if="featuredGame">
        <v-img
          v-if="featuredGame.background_image"
          :src="featuredGame.background_image"
          :alt="featuredGame.name"
          cover
          class="recommend-hero__bg"
        />
        <div v-else class="recommend-hero__bg recommend-hero__bg--empty">
          <v-icon icon="mdi-gamepad-variant-outline" size="72" color="rgba(255,255,255,0.2)" />
        </div>
        <div class="recommend-hero__shade" aria-hidden="true" />
        <div class="recommend-hero__vignette" aria-hidden="true" />

        <div class="recommend-hero__inner">
          <p class="recommend-hero__brand default-title-letter">npmrungame · topluluk</p>
          <div class="recommend-hero__body">
            <div class="recommend-hero__labels">
              <span class="recommend-hero__label recommend-hero__label--hot">
                Son öneri
              </span>
              <span
                v-if="featuredGame.recommender_name"
                class="recommend-hero__label recommend-hero__label--who"
              >
                <v-icon icon="mdi-account-heart" size="14" />
                {{ featuredGame.recommender_name }} önerdi
              </span>
            </div>

            <h1 class="recommend-hero__title default-title-letter">
              {{ featuredGame.name }}
            </h1>

            <p
              v-if="featuredSuggestionExcerpt"
              class="recommend-hero__quote default-title-letter"
            >
              “{{ featuredSuggestionExcerpt }}”
            </p>

            <div class="recommend-hero__meta">
              <v-chip
                v-if="featuredGame.metacritic"
                size="small"
                variant="elevated"
                class="recommend-hero__meta-chip"
                :color="useMetacriticStyle(featuredGame.metacritic).color"
                prepend-icon="mdi-star"
                :text="String(featuredGame.metacritic)"
              />
              <span v-if="featuredDateLabel" class="recommend-hero__date default-title-letter">
                {{ featuredDateLabel }}
              </span>
            </div>

            <div class="recommend-hero__actions">
              <v-btn
                color="deep-purple-accent-2"
                variant="flat"
                rounded="pill"
                size="large"
                class="recommend-hero__btn recommend-hero__btn--primary text-white font-weight-bold text-capitalize default-title-letter"
                prepend-icon="mdi-hand-heart"
                text="Sen de öner"
                :ripple="false"
                @click="openRecommendDialog"
              />
              <v-btn
                variant="outlined"
                color="grey-lighten-1"
                rounded="pill"
                size="large"
                class="recommend-hero__btn recommend-hero__btn--secondary text-capitalize default-title-letter"
                prepend-icon="mdi-information-outline"
                text="Oyun detayı"
                :ripple="false"
                @click="openGameDetail(featuredGame)"
              />
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="recommend-hero__bg recommend-hero__bg--fallback" aria-hidden="true" />
        <div class="recommend-hero__shade" aria-hidden="true" />
        <div class="recommend-hero__inner recommend-hero__inner--center">
          <p class="recommend-hero__brand default-title-letter">npmrungame · topluluk</p>
          <h1 class="recommend-hero__title default-title-letter">
            Hangi oyunu görmek istersin?
          </h1>
          <p class="recommend-hero__lead default-title-letter">
            İlk öneriyi sen yap — ekibimiz inceleyip listeye ekleyebilir. Onaylanan öneriler burada
            Netflix tarzı vitrinde yer alır.
          </p>
          <v-btn
            color="deep-purple-accent-2"
            variant="flat"
            rounded="pill"
            size="x-large"
            class="recommend-hero__btn recommend-hero__btn--primary text-white font-weight-bold text-capitalize default-title-letter mt-4"
            prepend-icon="mdi-gamepad-variant"
            text="İlk öneriyi gönder"
            :ripple="false"
            @click="openRecommendDialog"
          />
        </div>
      </template>
    </section>

    <!-- İçerik -->
    <div class="recommend-main">
      <div class="recommend-main__toolbar">
        <div class="recommend-pills">
          <div class="recommend-pill">
            <span class="recommend-pill__value default-title-letter">{{ recommendedCount }}</span>
            <span class="recommend-pill__label default-title-letter">Toplam öneri</span>
          </div>
          <div class="recommend-pill">
            <span class="recommend-pill__value default-title-letter">3</span>
            <span class="recommend-pill__label default-title-letter">Max / gönderim</span>
          </div>
        </div>
        <v-btn
          v-if="display.mdAndUp.value"
          color="deep-purple-accent-2"
          variant="flat"
          rounded="pill"
          class="text-capitalize default-title-letter text-white font-weight-bold"
          prepend-icon="mdi-plus"
          text="Oyun öner"
          :ripple="false"
          @click="openRecommendDialog"
        />
        <v-btn
          icon="mdi-refresh"
          variant="text"
          color="grey-lighten-1"
          :loading="isGettingRecommendedGames"
          :ripple="false"
          aria-label="Listeyi yenile"
          @click="getRecommendedGames"
        />
      </div>

      <section v-if="!isGettingRecommendedGames && recommendedGames.length" class="recommend-catalog">
        <div class="recommend-catalog__head">
          <h2 class="recommend-catalog__title default-title-letter">Topluluktan öneriler</h2>
          <p class="recommend-catalog__count default-title-letter mb-0">
            {{ recommendedCount }} oyun · kaydırarak keşfet
          </p>
        </div>

        <div class="recommend-catalog__track" role="list">
          <article
            v-for="(game, index) in recommendedGames"
            :key="game.firestoreId ?? `${game.id}-${index}`"
            role="listitem"
            class="recommend-poster"
            :class="{ 'recommend-poster--featured': index === 0 }"
            tabindex="0"
            @click="openGameDetail(game)"
            @keydown.enter="openGameDetail(game)"
          >
            <div class="recommend-poster__frame">
              <v-img
                v-if="game.background_image"
                :src="game.background_image"
                :alt="game.name"
                cover
                class="recommend-poster__img"
              />
              <div v-else class="recommend-poster__img recommend-poster__img--empty">
                <v-icon icon="mdi-gamepad-variant-outline" size="32" color="rgba(255,255,255,0.25)" />
              </div>
              <div class="recommend-poster__shade" />
              <span v-if="index === 0" class="recommend-poster__badge default-title-letter">
                Son
              </span>
              <v-chip
                v-if="game.metacritic"
                size="x-small"
                variant="elevated"
                class="recommend-poster__score"
                :color="useMetacriticStyle(game.metacritic).color"
                :text="String(game.metacritic)"
              />
            </div>
            <p class="recommend-poster__name default-title-letter">{{ game.name }}</p>
            <p
              v-if="game.recommender_name"
              class="recommend-poster__who default-title-letter mb-0"
            >
              {{ game.recommender_name }}
            </p>
          </article>
        </div>
      </section>

      <section class="recommend-how">
        <h2 class="recommend-how__title default-title-letter">Nasıl çalışır?</h2>
        <ol class="recommend-how__steps default-title-letter">
          <li>
            <span class="recommend-how__num">1</span>
            <span>RAWG’den oyun ara ve en fazla 3 tanesini seç</span>
          </li>
          <li>
            <span class="recommend-how__num">2</span>
            <span>Neden önerdiğini kısaca yaz — ekip okuyacak</span>
          </li>
          <li>
            <span class="recommend-how__num">3</span>
            <span>Onaylanan öneriler bu sayfada vitrinde görünür</span>
          </li>
        </ol>
      </section>
    </div>

    <v-btn
      v-if="display.smAndDown.value"
      class="recommend-fab"
      color="deep-purple-accent-2"
      icon="mdi-plus"
      size="large"
      elevation="8"
      :ripple="false"
      aria-label="Oyun öner"
      @click="openRecommendDialog"
    />

    <!-- Öneri formu -->
    <v-dialog
      v-model="isRecommendDialogOpen"
      max-width="640"
      scrollable
      class="recommend-dialog"
      scrim="rgba(0,0,0,0.88)"
      @after-leave="onDialogClosed"
    >
      <v-card class="recommend-dialog-card rounded-xl" :ripple="false">
        <div class="recommend-dialog-header">
          <div>
            <h2 class="recommend-dialog-title default-title-letter">Oyun öner</h2>
            <p class="recommend-dialog-sub default-title-letter">
              Bilgilerini gir, oyunları seç ve gönder.
            </p>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="grey-lighten-1"
            :ripple="false"
            @click="isRecommendDialogOpen = false"
          />
        </div>

        <v-card-text class="recommend-dialog-body">
          <v-form ref="recommendGameForm" @submit.prevent="handleRecommendGame">
            <v-text-field
              v-model="models.name"
              :rules="rules.name"
              rounded="xl"
              label="Adın"
              variant="outlined"
              class="default-title-letter mb-3"
              prepend-inner-icon="mdi-account-outline"
              :density="display.smAndDown.value ? 'compact' : 'comfortable'"
              hide-details="auto"
              clearable
            />
            <v-text-field
              v-model="models.email"
              :rules="rules.email"
              rounded="xl"
              label="E-posta"
              type="email"
              variant="outlined"
              class="default-title-letter mb-3"
              prepend-inner-icon="mdi-email-outline"
              :density="display.smAndDown.value ? 'compact' : 'comfortable'"
              hide-details="auto"
              clearable
            />
            <v-textarea
              v-model="models.suggestionText"
              rounded="xl"
              label="Neden bu oyun(lar)?"
              variant="outlined"
              rows="3"
              counter
              maxlength="500"
              class="default-title-letter mb-4"
              prepend-inner-icon="mdi-comment-text-outline"
              :density="display.smAndDown.value ? 'compact' : 'comfortable'"
              hide-details="auto"
              clearable
            />

            <div class="recommend-search-block">
              <v-text-field
                v-model="searchGameText"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                rounded="xl"
                label="Oyun ara"
                placeholder="En az 3 karakter — örn. Elden Ring"
                color="deep-purple-accent-1"
                class="default-title-letter"
                :density="display.smAndDown.value ? 'compact' : 'comfortable'"
                hide-details
                clearable
                @update:model-value="onSearchInput"
              />

              <v-alert
                v-if="showNoGameSelectedWarning"
                type="warning"
                variant="tonal"
                density="compact"
                class="text-caption mt-2 mb-0"
                text="En az 1 oyun seçmelisin."
              />
              <v-alert
                v-if="showMaxLimitWarning"
                type="warning"
                variant="tonal"
                density="compact"
                class="text-caption mt-2 mb-0"
                text="En fazla 3 oyun önerebilirsin."
              />

              <div v-if="selectedGamesAfterResearch.length" class="recommend-selected-chips">
                <v-chip
                  v-for="game in selectedGamesAfterResearch"
                  :key="game.id"
                  closable
                  size="small"
                  color="deep-purple-accent-2"
                  variant="tonal"
                  class="default-title-letter"
                  @click:close="removeSelectedGame(game.id)"
                >
                  {{ game.name }}
                </v-chip>
              </div>

              <div v-if="searchGameText.length >= 3" class="recommend-search-results">
                <div v-if="isSearchingGameLoading" class="d-flex justify-center py-4">
                  <v-progress-circular indeterminate size="28" color="#b39ddb" />
                </div>
                <template v-else>
                  <p
                    v-if="searchResults.length"
                    class="text-caption text-grey-darken-1 mb-2 default-title-letter"
                  >
                    {{ searchResults.length }} sonuç
                  </p>
                  <button
                    v-for="game in searchResults"
                    :key="game.id"
                    type="button"
                    class="recommend-search-pick"
                    :class="{
                      'recommend-search-pick--selected': isGameSelected(game.id),
                    }"
                    @click="selectGameAfterSearch(game)"
                  >
                    <v-avatar :size="44" rounded="lg">
                      <v-img :src="game.background_image" :alt="game.name" cover />
                    </v-avatar>
                    <div class="min-w-0 flex-grow-1 text-start">
                      <p class="text-subtitle-2 text-grey-lighten-1 mb-0 text-truncate default-title-letter">
                        {{ game.name }}
                        <span v-if="game.released" class="text-grey-darken-1">
                          ({{ new Date(game.released).getFullYear() }})
                        </span>
                      </p>
                      <p
                        class="text-caption mb-0"
                        :class="`text-${useMetacriticStyle(game.metacritic).color}`"
                      >
                        Metacritic: {{ game.metacritic ?? "—" }}
                      </p>
                    </div>
                    <v-icon
                      :icon="isGameSelected(game.id) ? 'mdi-check-circle' : 'mdi-plus-circle-outline'"
                      :color="isGameSelected(game.id) ? '#b39ddb' : 'grey'"
                    />
                  </button>
                  <p
                    v-if="!searchResults.length"
                    class="text-caption text-grey-darken-1 text-center py-3 mb-0"
                  >
                    Sonuç bulunamadı
                  </p>
                </template>
              </div>
            </div>
          </v-form>
        </v-card-text>

        <div class="recommend-dialog-actions">
          <v-btn
            variant="tonal"
            color="grey-lighten-1"
            rounded="pill"
            class="text-capitalize default-title-letter"
            text="Vazgeç"
            :ripple="false"
            @click="isRecommendDialogOpen = false"
          />
          <v-btn
            color="deep-purple-accent-2"
            variant="flat"
            rounded="pill"
            class="text-capitalize default-title-letter text-white font-weight-bold"
            :prepend-icon="selectedGamesAfterResearch.length ? 'mdi-send' : 'mdi-plus'"
            :text="
              selectedGamesAfterResearch.length
                ? `Gönder (${selectedGamesAfterResearch.length})`
                : 'Gönder'
            "
            :loading="isAddingToDb"
            :ripple="false"
            @click="handleRecommendGame"
          />
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isSuccessDialogOpen" max-width="480" scrim="rgba(0,0,0,0.9)">
      <div class="recommend-success-dialog">
        <v-btn
          class="position-absolute"
          style="top: 8px; right: 8px"
          variant="text"
          icon="mdi-close"
          size="small"
          color="grey"
          :ripple="false"
          @click="isSuccessDialogOpen = false"
        />
        <v-img
          v-if="msgGenre === 'successfull'"
          :src="successfullyDoneImg"
          :width="display.smAndDown.value ? 56 : 80"
          class="mx-auto mb-3"
        />
        <p class="text-subtitle-1 text-grey-lighten-1 default-title-letter mb-0">
          {{ dialogMsg }}
        </p>
      </div>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import { VForm } from "vuetify/components";
import { getDocs, collection, addDoc, writeBatch, doc } from "firebase/firestore";
import { useMetacriticStyle } from "~/composables/data/handleData";
import { slugify } from "~/composables/core/basicFunc";
import store from "~/store/store";
import _ from "lodash";
import successfullyDoneImg from "~/assets/img/successfully_done_anim.gif";

useHead({
  title: "Oyun Öner | npmrungame",
  meta: [
    {
      name: "description",
      content: "npmrungame için oyun öner — topluluk listesine katkıda bulun.",
    },
  ],
});

const { $firestore } = useNuxtApp();
const _store = store();
const router = useRouter();
const display = useDisplay();

const recommendGameForm = ref<InstanceType<typeof VForm> | null>(null);

const isGettingRecommendedGames = ref(false);
const isSearchingGameLoading = ref(false);
const isAddingToDb = ref(false);
const isRecommendDialogOpen = ref(false);
const isSuccessDialogOpen = ref(false);
const showMaxLimitWarning = ref(false);
const showNoGameSelectedWarning = ref(false);
const isGettingCompletedGames = ref(false);
const isGettingRadarGames = ref(false);

const addedGameToDbCount = ref(0);
const msgGenre = ref<"successfull" | "warning">("successfull");
const dialogMsg = ref("");
const searchGameText = ref("");
const recommendedGames = ref<any[]>([]);
const completedGames = ref<any[]>([]);
const radarGames = ref<any[]>([]);
const selectedGamesAfterResearch = ref<any[]>([]);
const searchResults = ref<any[]>([]);

const models = ref({
  name: "",
  email: "",
  suggestionText: "",
});

const rules = ref({
  name: [
    (v: string) => !!v || "Ad gerekli",
    (v: string) => (v && v.length >= 3) || "En az 3 karakter",
  ],
  email: [
    (v: string) => !!v || "E-posta gerekli",
    (v: string) =>
      (v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) || "Geçerli e-posta gir",
  ],
});

const recommendedCount = computed(() => recommendedGames.value.length);
const featuredGame = computed(() => recommendedGames.value[0] ?? null);

const featuredSuggestionExcerpt = computed(() => {
  const msg = featuredGame.value?.recommender_suggestion_msg;
  if (!msg?.trim()) return "";
  const t = msg.trim();
  return t.length > 160 ? `${t.slice(0, 160)}…` : t;
});

const featuredDateLabel = computed(() => {
  const iso = featuredGame.value?.recommended_at;
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
});

let searchDebounce: ReturnType<typeof setTimeout> | null = null;

const isGameSelected = (id: number) =>
  selectedGamesAfterResearch.value.some((g) => g.id === id);

const removeSelectedGame = (id: number) => {
  const idx = selectedGamesAfterResearch.value.findIndex((g) => g.id === id);
  if (idx !== -1) selectedGamesAfterResearch.value.splice(idx, 1);
};

const openRecommendDialog = () => {
  isRecommendDialogOpen.value = true;
};

const openGameDetail = (item: any) => {
  if (!item?.id) return;
  _store.setActiveDetailedGame(item.id, item.name);
  router.push(`/game-detail/${slugify(item.name)}`);
};

const onDialogClosed = () => {
  searchResults.value = [];
  searchGameText.value = "";
  showMaxLimitWarning.value = false;
  showNoGameSelectedWarning.value = false;
  resetForm();
};

const selectGameAfterSearch = (game: any) => {
  const idx = selectedGamesAfterResearch.value.findIndex((g) => g.id === game.id);
  if (idx !== -1) {
    selectedGamesAfterResearch.value.splice(idx, 1);
    return;
  }

  if (selectedGamesAfterResearch.value.length >= 3) {
    showMaxLimitWarning.value = true;
    setTimeout(() => (showMaxLimitWarning.value = false), 2500);
    return;
  }

  selectedGamesAfterResearch.value.push(game);
};

const searchGame = async () => {
  if (searchGameText.value.length < 3) {
    searchResults.value = [];
    isSearchingGameLoading.value = false;
    return;
  }

  try {
    isSearchingGameLoading.value = true;
    const { data } = await axios.get("/api/search-games", {
      params: { search: searchGameText.value },
    });

    const results = data?.results ?? [];
    const excludedIds = new Set([
      ...recommendedGames.value.map((g: any) => g.id),
      ...completedGames.value.map((g: any) => g.id),
      ...radarGames.value.map((g: any) => g.rawgId ?? g.id),
    ]);

    searchResults.value = results.filter((game: any) => !excludedIds.has(game.id));
  } catch (error: any) {
    console.error(error.message);
    searchResults.value = [];
  } finally {
    isSearchingGameLoading.value = false;
  }
};

const onSearchInput = () => {
  if (searchDebounce) clearTimeout(searchDebounce);
  if (searchGameText.value.length < 3) {
    searchResults.value = [];
    isSearchingGameLoading.value = false;
    return;
  }
  searchDebounce = setTimeout(searchGame, 400);
};

const resetForm = async () => {
  models.value = { name: "", email: "", suggestionText: "" };
  selectedGamesAfterResearch.value = [];
  await nextTick();
  recommendGameForm.value?.reset();
  recommendGameForm.value?.resetValidation();
};

const addGameToRecommendedGames = async () => {
  const games = selectedGamesAfterResearch.value;
  if (!games.length) return;

  try {
    isAddingToDb.value = true;
    addedGameToDbCount.value = games.length;

    const metadata = {
      recommender_name: models.value.name || null,
      recommender_email: models.value.email || null,
      recommender_suggestion_msg: models.value.suggestionText || null,
      recommended_at: new Date().toISOString(),
    };

    if (games.length === 1) {
      const game = games[0];
      await addDoc(collection($firestore, "recommended_games"), { ...game, ...metadata });
      await addDoc(collection($firestore, "notifications"), {
        game_name: game?.name || null,
        recommender_name: metadata.recommender_name,
        recommender_email: metadata.recommender_email,
        status: "recommended_game",
        read_status: false,
        created_at: new Date().toISOString(),
      });
    } else {
      const batch = writeBatch($firestore);
      games.forEach((g) => {
        const ref = doc(collection($firestore, "recommended_games"));
        batch.set(ref, { ...g, ...metadata });
        batch.set(doc(collection($firestore, "notifications")), {
          game_name: g?.name || null,
          recommender_name: metadata.recommender_name,
          recommender_email: metadata.recommender_email,
          status: "recommended_game",
          read_status: false,
          created_at: new Date().toISOString(),
        });
      });
      await batch.commit();
    }

    isRecommendDialogOpen.value = false;
    msgGenre.value = "successfull";
    dialogMsg.value =
      games.length === 1
        ? "Oyun önerin başarıyla iletildi!"
        : `${games.length} oyun önerin başarıyla iletildi!`;
    isSuccessDialogOpen.value = true;
    setTimeout(() => {
      isSuccessDialogOpen.value = false;
    }, 3500);

    await resetForm();
    await getRecommendedGames();
  } catch (error: any) {
    console.error("DB Add Error:", error.message);
    msgGenre.value = "warning";
    dialogMsg.value = "Gönderilirken bir hata oluştu. Tekrar dene.";
    isSuccessDialogOpen.value = true;
  } finally {
    isAddingToDb.value = false;
  }
};

const getCompletedGames = async () => {
  try {
    isGettingCompletedGames.value = true;
    const snapshot = await getDocs(collection($firestore, "completed_games"));
    completedGames.value = snapshot.docs.map((d) => ({
      firestoreId: d.id,
      ...d.data(),
    }));
  } catch (error) {
    console.error(error);
  } finally {
    isGettingCompletedGames.value = false;
  }
};

const getRadarGames = async () => {
  try {
    isGettingRadarGames.value = true;
    const snapshot = await getDocs(collection($firestore, "upcoming_games"));
    radarGames.value = snapshot.docs.map((d) => ({
      firestoreId: d.id,
      ...d.data(),
    }));
  } catch (error) {
    console.error(error);
  } finally {
    isGettingRadarGames.value = false;
  }
};

const getRecommendedGames = async () => {
  try {
    isGettingRecommendedGames.value = true;
    const snapshot = await getDocs(collection($firestore, "recommended_games"));
    const games = snapshot.docs.map((d) => ({
      firestoreId: d.id,
      ...d.data(),
    }));
    recommendedGames.value = _.orderBy(
      _.uniqBy(games, (g) => g.id ?? g.firestoreId),
      [(g) => (g.recommended_at ? new Date(g.recommended_at).getTime() : 0)],
      ["desc"]
    );
  } catch (error) {
    console.error(error);
  } finally {
    isGettingRecommendedGames.value = false;
  }
};

const handleRecommendGame = async () => {
  if (!selectedGamesAfterResearch.value.length) {
    showNoGameSelectedWarning.value = true;
    setTimeout(() => (showNoGameSelectedWarning.value = false), 2500);
    return;
  }

  const result = await recommendGameForm.value?.validate();
  if (!result?.valid) return;

  await addGameToRecommendedGames();
};

onMounted(() => {
  getRadarGames();
  getCompletedGames();
  getRecommendedGames();
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/recommend_games_page.css";
</style>
