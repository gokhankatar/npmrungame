<template>
  <div class="admin-login-page">
    <!-- Sol: Netflix tarzı vitrin -->
    <section
      class="admin-login-showcase"
      :class="{
        'admin-login-showcase--loading': isLoadingGame,
        'admin-login-showcase--empty': !isLoadingGame && !latestGame,
      }"
      aria-label="Son bitirilen oyun"
    >
      <template v-if="isLoadingGame">
        <v-skeleton-loader type="image" class="admin-login-showcase__loader" />
      </template>

      <template v-else-if="latestGame">
        <v-img
          v-if="latestGame.background_image"
          :src="latestGame.background_image"
          :alt="latestGame.name"
          cover
          class="admin-login-showcase__bg"
        />
        <div v-else class="admin-login-showcase__bg admin-login-showcase__bg--empty">
          <v-icon icon="mdi-gamepad-variant-outline" size="64" color="rgba(255,255,255,0.2)" />
        </div>
        <div class="admin-login-showcase__shade" aria-hidden="true" />
        <div class="admin-login-showcase__vignette" aria-hidden="true" />

        <div class="admin-login-showcase__inner">
          <p class="admin-login-showcase__brand default-title-letter">npmrungame · koleksiyon</p>
          <div class="admin-login-showcase__body">
            <div class="admin-login-showcase__labels">
              <span class="admin-login-showcase__label admin-login-showcase__label--hot">
                <v-icon icon="mdi-trophy" size="14" />
                Son bitirdiğim
              </span>
              <span
                v-if="totalCount"
                class="admin-login-showcase__label admin-login-showcase__label--count"
              >
                {{ totalCount }} oyun kütüphanede
              </span>
            </div>

            <h2 class="admin-login-showcase__title default-title-letter">
              {{ latestGame.name }}
            </h2>

            <p v-if="gameSubtitle" class="admin-login-showcase__sub default-title-letter">
              {{ gameSubtitle }}
            </p>

            <div class="admin-login-showcase__meta">
              <v-chip
                v-if="latestGame.metacritic"
                size="small"
                variant="elevated"
                class="admin-login-showcase__meta-chip"
                :color="useMetacriticStyle(latestGame.metacritic).color"
                prepend-icon="mdi-star"
                :text="String(latestGame.metacritic)"
              />
              <v-chip
                v-if="latestGame.playtime"
                size="small"
                variant="tonal"
                color="grey-darken-3"
                class="admin-login-showcase__meta-chip"
                prepend-icon="mdi-timer-outline"
                :text="`${latestGame.playtime} saat`"
              />
              <span v-if="completedLabel" class="admin-login-showcase__date default-title-letter">
                {{ completedLabel }}
              </span>
            </div>

            <v-btn
              variant="outlined"
              color="grey-lighten-1"
              rounded="pill"
              size="default"
              class="admin-login-showcase__cta text-capitalize default-title-letter mt-4"
              prepend-icon="mdi-bookshelf"
              text="Koleksiyonu gör"
              :ripple="false"
              to="/completed-games"
            />
          </div>
        </div>
      </template>

      <template v-else>
        <div class="admin-login-showcase__bg admin-login-showcase__bg--fallback" aria-hidden="true" />
        <div class="admin-login-showcase__shade" aria-hidden="true" />
        <div class="admin-login-showcase__inner admin-login-showcase__inner--center">
          <p class="admin-login-showcase__brand default-title-letter">npmrungame</p>
          <h2 class="admin-login-showcase__title default-title-letter">Oyun dünyası burada</h2>
          <p class="admin-login-showcase__lead default-title-letter">
            Tamamladığın oyunlar, radar ve öneriler — hepsi tek panelden yönetiliyor.
          </p>
        </div>
      </template>
    </section>

    <!-- Sağ: giriş -->
    <aside class="admin-login-panel">
      <div class="admin-login-panel__grid" aria-hidden="true" />

      <v-tooltip text="Ana sayfaya dön" location="bottom">
        <template #activator="{ props: tipProps }">
          <v-btn
            v-bind="tipProps"
            class="admin-login-back"
            icon="mdi-arrow-left"
            variant="text"
            color="grey-lighten-1"
            size="small"
            :ripple="false"
            aria-label="Ana sayfaya dön"
            @click="router.push('/')"
          />
        </template>
      </v-tooltip>

      <v-form
        ref="adminForm"
        class="admin-login-card"
        @submit.prevent="handleAdminAuth"
      >
        <div class="admin-login-card__head">
          <div class="admin-login-card__icon-wrap" aria-hidden="true">
            <v-icon icon="mdi-shield-lock-outline" size="28" color="#69f0ae" />
          </div>
          <p class="admin-login-card__eyebrow default-title-letter">npmrungame</p>
          <h1 class="admin-login-card__title default-title-letter">Admin girişi</h1>
          <p class="admin-login-card__sub default-title-letter">
            Yönetim paneline erişmek için hesabınla oturum aç.
          </p>
        </div>

        <v-text-field
          ref="adminFormEmailRef"
          v-model="adminModels.email"
          :rules="rules.email"
          type="email"
          variant="outlined"
          rounded="xl"
          label="E-posta"
          prepend-inner-icon="mdi-email-outline"
          color="green-accent-2"
          class="default-title-letter mb-2"
          clearable
          hide-details="auto"
          :density="isExtraLargeScreen ? 'comfortable' : 'default'"
        />

        <v-text-field
          v-model="adminModels.password"
          :rules="rules.password"
          :type="showPassword ? 'text' : 'password'"
          rounded="xl"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          color="green-accent-2"
          class="default-title-letter"
          hide-details="auto"
          :density="isExtraLargeScreen ? 'comfortable' : 'default'"
          label="Şifre"
        >
          <template #append-inner>
            <v-icon
              :icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              class="cursor-pointer"
              @click="togglePasswordVisibility"
            />
          </template>
        </v-text-field>

        <transition name="slide-up">
          <v-alert
            v-if="isVisibleAlertAfterLogin"
            variant="tonal"
            class="admin-login-alert default-title-letter"
            :icon="colorAfterLogin === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'"
            density="compact"
            :text="msgAfterLogin!"
            :color="colorAfterLogin === 'success' ? 'green-accent-2' : 'error'"
          />
        </transition>

        <v-checkbox
          v-model="adminModels.isSelectedRememberMe"
          density="compact"
          :ripple="false"
          hide-details
          color="green-accent-2"
          class="admin-login-remember default-title-letter"
        >
          <template #label>
            <span class="text-caption text-sm-subtitle-2">Beni hatırla</span>
            <v-tooltip text="Başarılı girişten sonra bilgileri hatırla" location="top">
              <template #activator="{ props: helpProps }">
                <v-icon
                  v-bind="helpProps"
                  icon="mdi-help-circle-outline"
                  size="18"
                  color="grey"
                  class="ml-1 cursor-pointer"
                />
              </template>
            </v-tooltip>
          </template>
        </v-checkbox>

        <v-btn
          type="submit"
          text="Panele giriş"
          :loading="isLoadingLogin"
          color="green-accent-2"
          variant="flat"
          block
          rounded="pill"
          size="large"
          class="admin-login-submit text-black text-capitalize default-title-letter"
          prepend-icon="mdi-login"
          :ripple="false"
        />
      </v-form>
    </aside>
  </div>
</template>

<script lang="ts" setup>
import { collection, getDocs } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { VForm } from "vuetify/components";
import store from "~/store/store";
import type { Admin_User } from "~/composables/core/interfaces";
import {
  formatGameYearAndGenres,
  useMetacriticStyle,
} from "~/composables/data/handleData";

definePageMeta({
  layout: "admin",
});

useHead({
  title: "npmrungame | Admin girişi",
});

const _store = store();
const router = useRouter();
const display = useDisplay();
const isExtraLargeScreen = computed(() => display.lgAndUp.value);
const { $auth, $firestore } = useNuxtApp();

const adminForm = ref<InstanceType<typeof VForm> | null>(null);
const adminFormEmailRef = ref<InstanceType<typeof VForm> | null>(null);

const showPassword = ref(false);
const isLoadingLogin = ref(false);
const isLoadingGame = ref(true);
const completedGames = ref<any[]>([]);

const adminModels = ref({
  email: "",
  password: "",
  isSelectedRememberMe: false,
});

const rules = ref({
  email: [
    (v: string) => !!v || "Email Gerekli!",
    (v: string) =>
      (v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) || "Geçerli mail adresi giriniz",
  ],
  password: [
    (v: string) => !!v || "Şifre Gerekli",
    (v: string) => (v && v.length >= 3) || "Şifre en az 3 karakter olmalı!",
  ],
});

const isVisibleAlertAfterLogin = ref(false);
const msgAfterLogin = ref<string | null>(null);
const colorAfterLogin = ref<"error" | "success" | null>(null);

const getCompletedSortTime = (game: { completed_at?: string; released?: string }) => {
  if (game.completed_at) return new Date(game.completed_at).getTime();
  if (game.released) return new Date(game.released).getTime();
  return 0;
};

const totalCount = computed(() => completedGames.value.length);

const latestGame = computed(() => {
  if (!completedGames.value.length) return null;
  return [...completedGames.value].sort(
    (a, b) => getCompletedSortTime(b) - getCompletedSortTime(a)
  )[0];
});

const gameSubtitle = computed(() => {
  const game = latestGame.value;
  return game ? formatGameYearAndGenres(game) : "";
});

const completedLabel = computed(() => {
  const iso = latestGame.value?.completed_at;
  if (!iso) return "";
  try {
    return `Tamamlandı · ${new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso))}`;
  } catch {
    return "";
  }
});

const fetchLatestCompleted = async () => {
  try {
    isLoadingGame.value = true;
    const snapshot = await getDocs(collection($firestore, "completed_games"));
    completedGames.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (e) {
    console.error("Admin login showcase:", e);
    completedGames.value = [];
  } finally {
    isLoadingGame.value = false;
  }
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleAdminAuth = async () => {
  const result = await adminForm.value?.validate();
  if (!result?.valid) return;

  try {
    isLoadingLogin.value = true;

    const userCredential = await signInWithEmailAndPassword(
      $auth,
      adminModels.value.email,
      adminModels.value.password
    );

    const user = userCredential.user;

    if (user && adminModels.value.isSelectedRememberMe) {
      _store.setAnySuccessfullLogin();
    }

    msgAfterLogin.value = "Giriş Başarılı";
    colorAfterLogin.value = "success";
    isVisibleAlertAfterLogin.value = true;

    adminForm.value?.reset();

    setTimeout(() => {
      _store.login();
      isVisibleAlertAfterLogin.value = false;
      router.push("/admin");
    }, 1500);

    _store.setAdminUserInfo(user.metadata as Admin_User);
  } catch {
    isVisibleAlertAfterLogin.value = false;

    msgAfterLogin.value = "Email ya da parola yanlış!";
    colorAfterLogin.value = "error";
    isVisibleAlertAfterLogin.value = true;

    setTimeout(() => {
      isVisibleAlertAfterLogin.value = false;
    }, 3000);
  } finally {
    isLoadingLogin.value = false;
  }
};

watch(
  () => adminModels.value.isSelectedRememberMe,
  async (val) => {
    if (_store.hasAnySuccessfulLogin) {
      if (val) {
        const data = await $fetch("/api/admin/admin-credential");
        adminModels.value.email = data.email;
        adminModels.value.password = data.password;
      } else {
        adminForm.value?.reset();
      }
    }
  }
);

watch(
  () => _store.isAdmin,
  (isAdmin) => {
    if (isAdmin) router.replace("/admin");
  },
  { immediate: true }
);

onMounted(() => {
  fetchLatestCompleted();
  adminFormEmailRef.value?.focus();
});
</script>

<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/admin_login.css");
</style>
