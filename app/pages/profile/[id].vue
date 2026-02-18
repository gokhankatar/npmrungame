<template>
  <v-container class="pa-0 pa-lg-5">
    <v-row class="d-flex justify-center align-center mx-auto mt-5 mt-lg-10">
      <!-- Loading -->
      <v-col v-if="isLoadingUser" cols="12" class="d-flex justify-center">
        <v-progress-circular indeterminate color="green-accent-2" size="64" />
      </v-col>

      <!-- User Not Found -->
      <v-col
        v-else-if="!user"
        cols="12"
        class="d-flex flex-column align-center justify-center pa-10"
      >
        <v-icon icon="mdi-account-alert" size="64" color="error" />
        <p class="text-subtitle-2 text-lg-subtitle-1 text-grey-lighten-1 mt-3">
          Kullanıcı bulunamadı
        </p>
      </v-col>

      <!-- User Profile -->
      <template v-else>
        <!-- Profile Header -->
        <v-col cols="12" lg="10">
          <v-card
            class="profile-header-card d-flex flex-column flex-md-row align-center ga-4 pa-4 pa-lg-6 rounded-lg"
            :elevation="0"
          >
            <v-avatar :size="display.lgAndUp.value ? 120 : 80" class="profile-avatar">
              <v-img
                v-if="steamProfile?.avatarfull"
                :src="steamProfile.avatarfull"
                cover
              />
              <v-icon v-else icon="mdi-account" size="64" color="grey-lighten-1" />
            </v-avatar>

            <div class="d-flex flex-column align-center align-md-start ga-2 flex-grow-1">
              <div class="d-flex align-center ga-2">
                <h1 class="text-h5 text-lg-h4 text-grey-lighten-1 default-title-letter">
                  {{ user.username }}
                </h1>
                <v-chip
                  v-if="steamProfile"
                  prepend-icon="mdi-steam"
                  size="small"
                  color="blue-grey-lighten-1"
                  variant="tonal"
                  :ripple="false"
                >
                  {{ steamProfile.personaname }}
                </v-chip>
              </div>

              <p class="text-caption text-lg-subtitle-2 text-grey-darken-1">
                {{ user.email }}
              </p>

              <div class="d-flex align-center ga-2 flex-wrap">
                <v-chip
                  prepend-icon="mdi-calendar"
                  size="small"
                  variant="outlined"
                  color="grey-lighten-1"
                  :ripple="false"
                >
                  Kayıt: {{ formatDateTR(user.createdAt) }}
                </v-chip>
                <v-chip
                  v-if="user.steamId"
                  prepend-icon="mdi-steam"
                  size="small"
                  variant="tonal"
                  color="blue-grey-lighten-1"
                  :ripple="false"
                >
                  Steam ID: {{ user.steamId }}
                </v-chip>
                <v-btn
                  v-if="isOwnProfile"
                  @click="isSteamIdDialogOpen = true"
                  size="small"
                  variant="tonal"
                  color="blue-grey-lighten-1"
                  :prepend-icon="user.steamId ? 'mdi-pencil' : 'mdi-steam'"
                  :text="user.steamId ? 'Steam ID Güncelle' : 'Steam ID Ekle'"
                  :ripple="false"
                />
              </div>
            </div>
          </v-card>
        </v-col>

        <!-- Steam Games & Achievements -->
        <v-col v-if="user.steamId" cols="12" lg="10">
          <v-tabs v-model="activeTab" color="green-accent-2" class="steam-tabs">
            <v-tab value="games">
              <v-icon icon="mdi-gamepad-variant" class="mr-2" />
              Oyunlar ({{ ownedGames?.length || 0 }})
            </v-tab>
            <v-tab value="achievements">
              <v-icon icon="mdi-trophy" class="mr-2" />
              Başarılar
            </v-tab>
          </v-tabs>

          <v-window v-model="activeTab" class="mt-4">
            <!-- Games Tab -->
            <v-window-item value="games">
              <div v-if="isLoadingGames" class="d-flex justify-center pa-5">
                <v-progress-circular indeterminate color="green-accent-2" />
              </div>
              <div
                v-else-if="ownedGames && ownedGames.length > 0"
                class="d-flex flex-column ga-3"
              >
                <v-card
                  v-for="game in ownedGames"
                  :key="game.appid"
                  class="game-card d-flex align-center ga-3 pa-3 pa-lg-4 rounded-lg cursor-pointer"
                  :elevation="0"
                  @click="selectGameForAchievements(game)"
                >
                  <v-img
                    v-if="game.img_icon_url"
                    :src="`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`"
                    width="64"
                    height="64"
                    class="rounded-lg"
                    cover
                  />
                  <v-icon
                    v-else
                    icon="mdi-gamepad-variant"
                    size="64"
                    color="grey-darken-1"
                  />

                  <div class="d-flex flex-column flex-grow-1 ga-1">
                    <p
                      class="text-subtitle-2 text-lg-subtitle-1 text-grey-lighten-1 default-title-letter"
                    >
                      {{ game.name }}
                    </p>
                    <div class="d-flex align-center ga-2">
                      <v-chip
                        size="small"
                        variant="tonal"
                        color="green-accent-2"
                        :ripple="false"
                      >
                        {{ formatPlaytime(game.playtime_forever) }}
                      </v-chip>
                      <v-chip
                        size="small"
                        variant="outlined"
                        color="grey-lighten-1"
                        :ripple="false"
                      >
                        App ID: {{ game.appid }}
                      </v-chip>
                    </div>
                  </div>

                  <v-btn
                    icon="mdi-trophy"
                    size="small"
                    color="green-accent-2"
                    variant="text"
                    @click.stop="selectGameForAchievements(game)"
                  />
                </v-card>
              </div>
              <div v-else class="d-flex flex-column align-center justify-center pa-10">
                <v-icon
                  icon="mdi-gamepad-variant-outline"
                  size="64"
                  color="grey-darken-1"
                />
                <p class="text-subtitle-2 text-grey-lighten-1 mt-3">
                  Steam oyunu bulunamadı
                </p>
              </div>
            </v-window-item>

            <!-- Achievements Tab -->
            <v-window-item value="achievements">
              <div
                v-if="!selectedGame"
                class="d-flex flex-column align-center justify-center pa-10"
              >
                <v-icon icon="mdi-trophy-outline" size="64" color="grey-darken-1" />
                <p class="text-subtitle-2 text-grey-lighten-1 mt-3 text-center">
                  Başarıları görmek için bir oyun seçin
                </p>
              </div>
              <Steam_Achievements
                v-else
                :achievements="achievements"
                :loading="isLoadingAchievements"
              />
            </v-window-item>
          </v-window>
        </v-col>

        <!-- No Steam ID -->
        <v-col v-else cols="12" lg="10">
          <v-alert type="info" variant="tonal" class="rounded-lg">
            <template #prepend>
              <v-icon icon="mdi-information" />
            </template>
            <div class="d-flex flex-column ga-2">
              <p class="text-subtitle-2 text-grey-lighten-1">
                Steam oyunlarını ve başarılarını görmek için Steam ID'nizi eklemeniz
                gerekiyor.
              </p>
              <v-btn
                v-if="isOwnProfile"
                @click="isSteamIdDialogOpen = true"
                size="small"
                variant="tonal"
                color="blue-grey-lighten-1"
                prepend-icon="mdi-steam"
                text="Steam ID Ekle"
                :ripple="false"
              />
            </div>
          </v-alert>
        </v-col>
      </template>
    </v-row>

    <!-- Steam ID Dialog -->
    <v-dialog
      v-model="isSteamIdDialogOpen"
      :max-width="600"
      style="
        background-color: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(0.1rem);
        -webkit-backdrop-filter: blur(0.1rem);
      "
    >
      <div
        class="steam-id-dialog d-flex flex-column align-start ga-2 ga-lg-4 rounded pa-2 pa-lg-5"
      >
        <v-btn
          @click="isSteamIdDialogOpen = false"
          icon="mdi-close"
          color="grey-darken-1"
          class="close-btn ma-1"
          variant="text"
          size="small"
          :ripple="false"
        />

        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-steam" color="blue-grey-lighten-1" size="large" />
          <p
            class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-grey-lighten-1 default-title-letter"
          >
            Steam ID Ekle/Güncelle
          </p>
        </div>

        <v-divider color="white" class="w-100" />

        <div class="w-100 d-flex flex-column ga-3">
          <div class="d-flex flex-column ga-2">
            <p class="text-subtitle-2 text-grey-lighten-1 default-title-letter">
              Steam ID'nizi Nasıl Bulursunuz?
            </p>
            <v-card variant="tonal" color="blue-grey-darken-1" class="pa-3 rounded-lg">
              <ol
                class="text-caption text-lg-subtitle-2 text-grey-lighten-2"
                style="margin-left: 20px"
              >
                <li>
                  Steam profil sayfanıza gidin:
                  <a
                    href="https://steamcommunity.com/my/profile"
                    target="_blank"
                    class="text-blue-lighten-1"
                    >steamcommunity.com/my/profile</a
                  >
                </li>
                <li>URL'deki sayıyı kopyalayın (17 haneli)</li>
                <li>
                  Örnek:
                  <code class="text-grey-lighten-1"
                    >https://steamcommunity.com/profiles/<strong
                      class="text-green-accent-2"
                      >76561198000000000</strong
                    ></code
                  >
                </li>
                <li>Veya Steam ID Finder sitelerini kullanabilirsiniz</li>
              </ol>
            </v-card>
          </div>

          <v-text-field
            v-model="steamIdInput"
            prepend-inner-icon="mdi-steam"
            variant="outlined"
            class="w-100 text-grey-lighten-1"
            color="grey-lighten-1"
            rounded="xl"
            label="Steam ID"
            placeholder="76561198000000000"
            :density="display.lgAndUp.value ? 'comfortable' : 'compact'"
            clearable
            :rules="steamIdRules"
          />
        </div>

        <div class="w-100 d-flex align-center justify-end ga-1 mt-2">
          <v-btn
            @click="isSteamIdDialogOpen = false"
            :ripple="false"
            class="rounded"
            :size="display.lgAndUp.value ? 'default' : 'small'"
            color="grey-lighten-2"
            variant="text"
            prepend-icon="mdi-close"
            text="İptal"
          />

          <v-btn
            @click="saveSteamId"
            :loading="isSavingSteamId"
            :ripple="false"
            class="rounded"
            color="blue-grey-lighten-1"
            :size="display.lgAndUp.value ? 'default' : 'small'"
            variant="tonal"
            prepend-icon="mdi-content-save"
            text="Kaydet"
          />
        </div>
      </div>
    </v-dialog>

    <!-- Success Toast -->
    <v-dialog
      v-model="isShowSuccessToast"
      :max-width="600"
      style="
        background-color: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(0.1rem);
        -webkit-backdrop-filter: blur(0.1rem);
      "
    >
      <div
        class="successfully-done-container d-flex flex-column align-center justify-center pa-5 rounded-xl"
      >
        <v-btn
          @click="isShowSuccessToast = false"
          class="close-icon-in-successfully-done-container ma-1 ma-lg-2"
          icon="mdi-close"
          :ripple="false"
          variant="text"
          color="grey-darken-1"
          size="small"
        />
        <v-icon icon="mdi-check-circle" color="success" size="64" />
        <p
          class="text-subtitle-2 text-lg-subtitle-1 text-grey-lighten-1 default-title-letter"
        >
          {{ successMessage }}
        </p>
      </div>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useFirestoreDateFormatted } from "~/composables/data/handleData";
import Steam_Achievements from "~/components/common/Steam_Achievements.vue";
import store from "~/store/store";

definePageMeta({
  layout: "default",
});

const route = useRoute();
const { $firestore } = useNuxtApp();
const { formatDateTR } = useFirestoreDateFormatted();
const display = useDisplay();
const _store = store();

const userId = route.params.id as string;

const isLoadingUser = ref(true);
const isLoadingGames = ref(false);
const isLoadingAchievements = ref(false);
const isSavingSteamId = ref(false);
const isSteamIdDialogOpen = ref(false);
const isShowSuccessToast = ref(false);
const successMessage = ref("");
const steamIdInput = ref("");

const user = ref<any | null>(null);
const steamProfile = ref<any | null>(null);
const ownedGames = ref<any[]>([]);
const achievements = ref<any[]>([]);
const selectedGame = ref<any | null>(null);
const activeTab = ref("games");

const isOwnProfile = computed(() => {
  return (
    _store.user?.uid === user.value?.uid || _store.user?.uid === user.value?.firestoreId
  );
});

const steamIdRules = [
  (v: string) => !!v || "Steam ID gerekli",
  (v: string) => /^\d{17}$/.test(v) || "Steam ID 17 haneli sayı olmalıdır",
];

const getUser = async () => {
  try {
    isLoadingUser.value = true;

    if (!$firestore) {
      console.error("Firestore kullanılamıyor");
      isLoadingUser.value = false;
      return;
    }

    // Try to get user by firestoreId first (document ID = uid)
    const userDocRef = doc($firestore, "registered_users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      user.value = {
        firestoreId: userDoc.id,
        ...userDoc.data(),
      };

      // If user has Steam ID, fetch Steam profile and games
      if (user.value.steamId) {
        await Promise.all([getSteamProfile(), getOwnedGames()]);
      }
    } else {
      // Try to get by uid field (in case document ID is different)
      const qByUid = query(
        collection($firestore, "registered_users"),
        where("uid", "==", userId)
      );
      const snapshotByUid = await getDocs(qByUid);

      if (!snapshotByUid.empty) {
        const userData = snapshotByUid.docs[0];
        if (userData) {
          user.value = {
            firestoreId: userData.id,
            ...userData.data(),
          };

          if (user.value.steamId) {
            await Promise.all([getSteamProfile(), getOwnedGames()]);
          }
        }
      } else {
        // Try to get by email (fallback)
        const qByEmail = query(
          collection($firestore, "registered_users"),
          where("email", "==", userId)
        );
        const snapshotByEmail = await getDocs(qByEmail);

        if (!snapshotByEmail.empty) {
          const userData = snapshotByEmail.docs[0];
          if (userData) {
            user.value = {
              firestoreId: userData.id,
              ...userData.data(),
            };

            if (user.value.steamId) {
              await Promise.all([getSteamProfile(), getOwnedGames()]);
            }
          }
        }
      }
    }
  } catch (error: any) {
    console.error("Kullanıcı getirme hatası:", error);
  } finally {
    isLoadingUser.value = false;
  }
};

const getSteamProfile = async () => {
  if (!user.value?.steamId) return;

  try {
    const response = await $fetch(
      `/api/steam/player-summary?steamId=${user.value.steamId}`
    );
    if (response.success && response.data) {
      steamProfile.value = response.data;
    }
  } catch (error: any) {
    console.error("Steam profil getirme hatası:", error);
  }
};

const getOwnedGames = async () => {
  if (!user.value?.steamId) return;

  try {
    isLoadingGames.value = true;
    const response: any = await $fetch(
      `/api/steam/owned-games?steamId=${user.value.steamId}`
    );
    if (response?.success && response?.data?.games) {
      ownedGames.value = response.data.games;
    }
  } catch (error: any) {
    console.error("Steam oyunları getirme hatası:", error);
  } finally {
    isLoadingGames.value = false;
  }
};

const selectGameForAchievements = async (game: any) => {
  selectedGame.value = game;
  activeTab.value = "achievements";
  await getAchievements(game.appid);
};

const getAchievements = async (appId: string) => {
  if (!user.value?.steamId || !appId) return;

  try {
    isLoadingAchievements.value = true;
    const response: any = await $fetch(
      `/api/steam/player-achievements?steamId=${user.value.steamId}&appId=${appId}`
    );
    if (response?.success && response?.data?.achievements) {
      achievements.value = response.data.achievements;
    } else {
      achievements.value = [];
    }
  } catch (error: any) {
    console.error("Başarılar getirme hatası:", error);
    achievements.value = [];
  } finally {
    isLoadingAchievements.value = false;
  }
};

const formatPlaytime = (minutes: number) => {
  if (!minutes) return "0 saat";
  const hours = Math.floor(minutes / 60);
  return `${hours} saat`;
};

const saveSteamId = async () => {
  if (!steamIdInput.value || !/^\d{17}$/.test(steamIdInput.value)) {
    return;
  }

  if (!user.value?.firestoreId || !isOwnProfile.value) {
    return;
  }

  try {
    isSavingSteamId.value = true;

    const userDocRef = doc($firestore, "registered_users", user.value.firestoreId);
    await updateDoc(userDocRef, {
      steamId: steamIdInput.value,
      updatedAt: serverTimestamp(),
    });

    // Update local user data
    user.value.steamId = steamIdInput.value;

    // Update store if it's the current user
    if (
      _store.user?.uid === user.value.uid ||
      _store.user?.uid === user.value.firestoreId
    ) {
      _store.setUser({ ..._store.user, steamId: steamIdInput.value });
    }

    successMessage.value = "Steam ID başarıyla kaydedildi!";
    isShowSuccessToast.value = true;

    setTimeout(() => {
      isShowSuccessToast.value = false;
      isSteamIdDialogOpen.value = false;

      // Reload Steam data
      if (user.value.steamId) {
        Promise.all([getSteamProfile(), getOwnedGames()]);
      }
    }, 2000);
  } catch (error: any) {
    console.error("Steam ID kaydetme hatası:", error);
    successMessage.value = "Hata oluştu: " + error.message;
    isShowSuccessToast.value = true;

    setTimeout(() => {
      isShowSuccessToast.value = false;
    }, 3000);
  } finally {
    isSavingSteamId.value = false;
  }
};

watch(isSteamIdDialogOpen, (newVal) => {
  if (newVal && user.value) {
    steamIdInput.value = user.value.steamId || "";
  }
});

onMounted(() => {
  if (process.client) {
    getUser();
  }
});
</script>

<style scoped>
@import "~/assets/css/main.css";

.profile-header-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(0.5rem);
  -webkit-backdrop-filter: blur(0.5rem);
}

.profile-avatar {
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.game-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(0.5rem);
  -webkit-backdrop-filter: blur(0.5rem);
  transition: all 0.3s ease;
}

.game-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.steam-tabs {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px 8px 0 0;
}
</style>
