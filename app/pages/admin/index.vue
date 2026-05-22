<template>
  <template v-if="_store.isAdmin">
    <v-container
      class="admin-content pa-0"
      :class="isCompactNav ? 'pt-3' : 'pt-4 pt-lg-6'"
      fluid
    >
      <Dashboard v-if="_store.active_admin_list_item == 'dashboard'" />
      <Notificiations v-if="_store.active_admin_list_item == 'notifications'" />
      <Completed_Games v-if="_store.active_admin_list_item == 'completed_games'" />
      <Blogs v-if="_store.active_admin_list_item == 'blog'" />
      <To_Play_Games v-if="_store.active_admin_list_item == 'to_play_games'" />
      <Current_Games v-if="_store.active_admin_list_item == 'current_games'" />
      <Registered_Users_Messages v-if="_store.active_admin_list_item == 'messages'" />
      <Recommended_Games v-if="_store.active_admin_list_item == 'recommended_games'" />
      <Settings v-if="_store.active_admin_list_item == 'settings'" />
    </v-container>
  </template>

  <!-- Authentication Form -->
  <template v-else>
    <v-img
      class="admin-bg-img-cover"
      cover
      :src="
        display.smAndDown.value
          ? 'https://gbfhkvefbnlgkqaqqwxp.supabase.co/storage/v1/object/public/admin_bg_npmrungame/security_img_small.jpg'
          : 'https://gbfhkvefbnlgkqaqqwxp.supabase.co/storage/v1/object/public/admin_bg_npmrungame/security_img_large.jpg'
      "
    />
    <v-form
      class="admin-form rounded-lg pa-3 pa-lg-5 mx-auto"
      ref="adminForm"
      @submit.prevent="handleAdminAuth"
    >
      <v-tooltip text="Ana sayfaya dön" location="top">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="back-to-home-btn ma-1 ma-lg-2 text-caption text-lg-subtitle-2 pa-1"
            @click="router.push('/')"
            size="xs"
            icon="mdi-arrow-left"
            variant="text"
            color="grey-lighten-1"
            :ripple="false"
          />
        </template>
      </v-tooltip>

      <div class="d-flex align-center justify-center ga-2 ga-lg-4 mt-5 mb-5 mb-lg-10">
        <v-icon
          icon="mdi-security"
          color="grey-lighten-1"
          :size="isSmallScreen ? 'small' : 'large'"
        />

        <p
          class="default-title-letter text-grey-lighten-1 text-subtitle-2 text-md-subtitle-1 text-lg-h5 text-center"
        >
          Admin Girişi
        </p>
      </div>

      <v-text-field
        ref="adminFormEmailRef"
        v-model="adminModels.email"
        :rules="rules.email"
        type="email"
        variant="outlined"
        rounded="xl"
        label="Email"
        prepend-inner-icon="mdi-email"
        clearable
        :hide-details="display.smAndDown.value ? true : false"
        :density="isExtraLargeScreen ? 'comfortable' : 'compact'"
      />

      <v-text-field
        v-model="adminModels.password"
        :rules="rules.password"
        :type="showPassword ? 'text' : 'password'"
        rounded="xl"
        prepend-inner-icon="mdi-lock"
        variant="outlined"
        :class="display.smAndDown.value ? 'my-2' : ''"
        :hide-details="display.smAndDown.value ? true : false"
        :density="isExtraLargeScreen ? 'comfortable' : 'compact'"
        label="Şifre"
      >
        <template v-slot:append-inner>
          <v-icon
            :icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click="togglePasswordVisibility"
          />
        </template>
      </v-text-field>

      <transition name="slide-up">
        <v-alert
          v-if="isVisibleAlertAfterLogin"
          variant="tonal"
          class="default-title-letter mb-1 text-caption text-lg-subtitle-2"
          :icon="colorAfterLogin == 'success' ? 'mdi-check' : 'mdi-close'"
          density="compact"
          :text="msgAfterLogin!"
          :color="colorAfterLogin!"
        />
      </transition>

      <v-checkbox
        @click="adminModels.isSelectedRememberMe = !adminModels.isSelectedRememberMe"
        v-model="adminModels.isSelectedRememberMe"
        density="compact"
        :ripple="false"
        :hide-details="display.smAndDown.value ? true : false"
        class="text-caption text-lg-subtitle-2"
        color="blue-lighten-1"
      >
        <template #label>
          <div class="d-flex align-center ga-1 ga-lg-2">
            <span class="text-caption text-lg-subtitle-2 default-title-letter"
              >Beni Hatırla</span
            >

            <v-tooltip text="Başarılı Girişte Bilgileri Hatırla" location="top">
              <template #activator="{ props }">
                <v-icon
                  v-bind="props"
                  :size="display.smAndDown.value ? 16 : 22"
                  color="grey"
                  class="cursor-pointer"
                  icon="mdi-help-circle-outline"
                />
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-checkbox>

      <v-btn
        text="Giriş"
        :loading="isLoadingLogin"
        class="text-subtitle-2 text-lg-subtitle-1 text-capitalize rounded-xl"
        prepend-icon="mdi-check"
        color="primary"
        block
        :size="display.smAndDown.value ? 'small' : 'default'"
        variant="elevated"
        :elevation="0"
        :ripple="false"
        type="submit"
      />
    </v-form>
  </template>
</template>

<script lang="ts" setup>
import store from "~/store/store";
import { signInWithEmailAndPassword } from "firebase/auth";
import { VForm } from "vuetify/components";
import type { Admin_User } from "~/composables/core/interfaces";
import Dashboard from "~/components/admin/Dashboard.vue";
import Completed_Games from "~/components/admin/Completed_Games.vue";
import Blogs from "~/components/admin/Blogs.vue";
import To_Play_Games from "~/components/admin/To_Play_Games.vue";
import Current_Games from "~/components/admin/Current_Games.vue";
import Registered_Users_Messages from "~/components/admin/Registered_Users_Messages.vue";
import Recommended_Games from "~/components/admin/Recommended_Games.vue";
import Notificiations from "~/components/admin/Notificiations.vue";
import Settings from "~/components/admin/Settings.vue";

definePageMeta({
  layout: "admin",
});

useHead({
  title: "npmrungame | Admin",
});

const _store = store();
const router = useRouter();
const display = useDisplay();
const isSmallScreen = computed(() => display.smAndDown.value);
const isExtraLargeScreen = computed(() => display.lgAndUp.value);
/** Dar ekran: üst yatay menü (layout); içerik üst boşluğu */
const isCompactNav = computed(() => display.smAndDown.value);
const { $auth } = useNuxtApp();

const adminForm = ref<InstanceType<typeof VForm> | null>(null);
const adminFormEmailRef = ref<InstanceType<typeof VForm> | null>(null);

const showPassword = ref(false);
const isLoadingLogin = ref(false);

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
    }, 1500);

    _store.setAdminUserInfo(user.metadata as Admin_User);
  } catch (err) {
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

onMounted(() => {
  if (!_store.isAdmin) {
    adminFormEmailRef.value?.focus();
  }
});
</script>

<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/admin.css");
</style>
